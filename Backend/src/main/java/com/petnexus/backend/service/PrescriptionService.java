package com.petnexus.backend.service;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.Consultation;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.Prescription;
import com.petnexus.backend.entity.PrescriptionItem;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.ConsultationRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.PrescriptionRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final ConsultationRepository consultationRepository;

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptions(String petId, String vetId, String callerOwnerId) {
        String cleanPetId = (petId != null && !petId.trim().isEmpty()) ? petId.trim() : null;
        String cleanVetId = (vetId != null && !vetId.trim().isEmpty()) ? vetId.trim() : null;

        List<Prescription> list = prescriptionRepository.findWithFilters(cleanPetId, cleanVetId);

        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.PetOwner) {
            list = list.stream()
                    .filter(p -> p.getPet() != null && p.getPet().getOwner() != null &&
                            currentUser.getUserId().equalsIgnoreCase(p.getPet().getOwner().getUserId()))
                    .collect(Collectors.toList());
        }

        return list.stream().map(PrescriptionResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(String prescriptionId, String callerOwnerId) {
        Prescription p = prescriptionRepository.findByPrescriptionId(prescriptionId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));

        if (p.getPet() != null && p.getPet().getOwner() != null) {
            SecurityUtils.enforceOwnershipOrRole(p.getPet().getOwner().getUserId(), UserRole.Admin, UserRole.ClinicManager, UserRole.Veterinarian);
        }

        return PrescriptionResponse.from(p);
    }

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionCreateRequest request) {
        SecurityUtils.enforceOwnershipOrRole(null, UserRole.Veterinarian);
        String petId = request.resolvePetId();
        List<PrescriptionItemDto> items = request.getItems();

        if (petId == null || petId.trim().isEmpty()) {
            throw new BadRequestException("Pet ID is required to generate a prescription.");
        }
        if (items == null || items.isEmpty() || items.get(0).getMedicationName() == null || items.get(0).getMedicationName().trim().isEmpty()) {
            throw new BadRequestException("Please specify at least one medication item.");
        }

        Pet pet = petRepository.findByPetId(petId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + petId));

        Consultation consultation = null;
        String consultId = request.resolveConsultationId();
        if (consultId != null && !consultId.trim().isEmpty()) {
            consultation = consultationRepository.findByConsultationId(consultId.trim()).orElse(null);
        }

        User vet = null;
        String vetId = request.resolveVetId();
        if (vetId != null && !vetId.trim().isEmpty()) {
            vet = userRepository.findByUserId(vetId.trim()).orElse(null);
        }

        String newRxId = generatePrescriptionId();
        String petName = request.resolvePetName() != null ? request.resolvePetName().trim() : pet.getName();
        String ownerName = request.resolveOwnerName() != null ? request.resolveOwnerName().trim() :
                (pet.getOwner() != null ? pet.getOwner().getFullName() : "Client");
        String vetName = request.resolveVetName() != null ? request.resolveVetName().trim() :
                (vet != null ? vet.getFullName() : "Dr. Michael Chen, DVM");
        String vetLicense = request.resolveVetLicense() != null ? request.resolveVetLicense().trim() :
                (vet != null ? vet.getLicenseNumber() : "VET-NY-84920");

        Prescription rx = Prescription.builder()
                .prescriptionId(newRxId)
                .consultation(consultation)
                .consultationId(consultId)
                .pet(pet)
                .petId(pet.getPetId())
                .petName(petName)
                .ownerName(ownerName)
                .veterinarian(vet)
                .vetId(vetId)
                .vetName(vetName)
                .vetLicense(vetLicense)
                .issueDate(LocalDate.now())
                .validUntil(LocalDate.now().plusMonths(1))
                .status("Active")
                .instructions(request.resolveInstructions())
                .digitalSignature(request.resolveDigitalSignature() != null ? request.resolveDigitalSignature() :
                        (vetName + " [Verified Electronic Signature]"))
                .build();

        List<PrescriptionItem> prescriptionItems = new ArrayList<>();
        int itemIndex = 1;
        for (PrescriptionItemDto itemDto : items) {
            if (itemDto.getMedicationName() == null || itemDto.getMedicationName().trim().isEmpty()) {
                continue;
            }
            String itemId = (itemDto.getItemId() != null && !itemDto.getItemId().trim().isEmpty())
                    ? itemDto.getItemId().trim()
                    : ("RXI-" + System.currentTimeMillis() + "-" + (itemIndex++));

            PrescriptionItem pi = PrescriptionItem.builder()
                    .itemId(itemId)
                    .prescription(rx)
                    .prescriptionId(newRxId)
                    .medicationName(itemDto.getMedicationName().trim())
                    .dosage(itemDto.getDosage())
                    .frequency(itemDto.getFrequency())
                    .durationDays(itemDto.getDurationDays() != null ? itemDto.getDurationDays() : 7)
                    .quantityPrescribed(itemDto.getQuantityPrescribed() != null ? itemDto.getQuantityPrescribed() : 1)
                    .refillsAllowed(itemDto.getRefillsAllowed() != null ? itemDto.getRefillsAllowed() : 0)
                    .build();
            prescriptionItems.add(pi);
        }

        rx.setItems(prescriptionItems);
        Prescription saved = prescriptionRepository.save(rx);
        log.info("Prescription generated: {} with {} items for pet {}", newRxId, prescriptionItems.size(), pet.getPetId());
        return PrescriptionResponse.from(saved);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private String generatePrescriptionId() {
        long count = prescriptionRepository.count() + 1;
        String candidate;
        do {
            candidate = "RX-2026-" + String.format("%03d", count++);
        } while (prescriptionRepository.existsByPrescriptionId(candidate));
        return candidate;
    }
}
