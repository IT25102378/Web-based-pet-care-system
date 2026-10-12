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
import com.petnexus.backend.repository.PrescriptionItemRepository;
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
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final ConsultationRepository consultationRepository;
    private final InventoryService inventoryService;
    private final com.petnexus.backend.repository.InventoryItemRepository inventoryItemRepository;

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

        if (vet == null) {
            User signedIn = SecurityUtils.getCurrentUser();
            if (signedIn != null && signedIn.getRole() == UserRole.Veterinarian) {
                vet = signedIn;
                vetId = signedIn.getUserId();
            }
        }

        String newRxId = generatePrescriptionId();
        String petName = request.resolvePetName() != null ? request.resolvePetName().trim() : pet.getName();
        String ownerName = request.resolveOwnerName() != null ? request.resolveOwnerName().trim() :
                (pet.getOwner() != null ? pet.getOwner().getFullName() : "Client");
        String vetName = request.resolveVetName() != null ? request.resolveVetName().trim() :
                (vet != null ? vet.getFullName() : "Veterinarian");
        String vetLicense = request.resolveVetLicense() != null ? request.resolveVetLicense().trim() :
                (vet instanceof com.petnexus.backend.entity.Veterinarian v ? v.getLicenseNumber() : null);

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

        // Deduct prescribed medication products from clinical pharmacy inventory
        for (PrescriptionItem pi : prescriptionItems) {
            deductPrescriptionItemFromInventory(pi, newRxId, petName);
        }

        return PrescriptionResponse.from(saved);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private void deductPrescriptionItemFromInventory(PrescriptionItem pi, String prescriptionId, String petName) {
        if (pi.getMedicationName() == null || pi.getMedicationName().isBlank()) return;
        String medName = pi.getMedicationName().trim().toLowerCase();

        com.petnexus.backend.entity.InventoryItem matchedItem = findBestInventoryMatch(medName);

        if (matchedItem != null) {
            int qtyToDeduct = (pi.getQuantityPrescribed() != null && pi.getQuantityPrescribed() > 0) ? pi.getQuantityPrescribed() : 1;
            if (("Bottles".equalsIgnoreCase(matchedItem.getUnit()) || "Boxes".equalsIgnoreCase(matchedItem.getUnit()) || "Tubes".equalsIgnoreCase(matchedItem.getUnit())) && qtyToDeduct > 5) {
                qtyToDeduct = 1;
            }
            try {
                inventoryService.updateStock(matchedItem.getItemId(), -qtyToDeduct,
                        "Prescription " + prescriptionId + " (" + pi.getMedicationName() + ") dispensed for " + petName);
                log.info("Deducted {} unit(s) of {} for Rx {} (Remaining stock: {})",
                        qtyToDeduct, matchedItem.getName(), prescriptionId, matchedItem.getCurrentStock() - qtyToDeduct);
            } catch (Exception e) {
                log.warn("Could not deduct inventory item {} for prescription {}: {}", matchedItem.getItemId(), prescriptionId, e.getMessage());
            }
        } else {
            log.info("No matching clinical inventory item found for prescribed medication: {}", pi.getMedicationName());
        }
    }

    /**
     * Picks the inventory item that best matches a medication name:
     * exact name (100), exact SKU (90), name starts with the other (80), one contains the other (60),
     * same drug (first word) (50). Items with no match score 0 and are never selected.
     */
    private com.petnexus.backend.entity.InventoryItem findBestInventoryMatch(String medicationLowerCase) {
        com.petnexus.backend.entity.InventoryItem best = null;
        int bestScore = 0;
        for (com.petnexus.backend.entity.InventoryItem inv : inventoryItemRepository.findAll()) {
            int score = matchScore(medicationLowerCase, inv);
            if (score > bestScore) {
                best = inv;
                bestScore = score;
            }
        }
        return best;
    }

    public static int matchScore(String med, com.petnexus.backend.entity.InventoryItem inv) {
        String name = inv.getName() == null ? "" : inv.getName().trim().toLowerCase();
        String sku = inv.getSku() == null ? "" : inv.getSku().trim().toLowerCase();
        if (med.isEmpty()) return 0;
        if (name.equals(med)) return 100;
        if (!sku.isEmpty() && sku.equals(med)) return 90;
        if (!name.isEmpty() && (name.startsWith(med) || med.startsWith(name))) return 80;
        if (!name.isEmpty() && (name.contains(med) || med.contains(name))) return 60;
        String drug = med.split("[\\s,/(]+")[0];
        if (drug.length() >= 4 && name.startsWith(drug)) return 50;
        return 0;
    }

    private Prescription findOrThrow(String prescriptionId) {
        return prescriptionRepository.findByPrescriptionId(prescriptionId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + prescriptionId));
    }

    /** Revises the administration instructions of an active prescription. */
    @Transactional
    public PrescriptionResponse updateInstructions(String prescriptionId, String instructions) {
        Prescription p = findOrThrow(prescriptionId);
        if ("Revoked".equalsIgnoreCase(p.getStatus())) {
            throw new BadRequestException("A revoked prescription cannot be edited.");
        }
        if (instructions == null || instructions.trim().isEmpty()) {
            throw new BadRequestException("Instructions cannot be empty.");
        }
        if (instructions.trim().length() > 1000) {
            throw new BadRequestException("Instructions cannot be longer than 1000 characters.");
        }
        p.setInstructions(instructions.trim());
        return PrescriptionResponse.from(prescriptionRepository.save(p));
    }

    /** Cancels a prescription but keeps it on the patient's record. */
    @Transactional
    public PrescriptionResponse revokePrescription(String prescriptionId, String reason) {
        Prescription p = findOrThrow(prescriptionId);
        if ("Revoked".equalsIgnoreCase(p.getStatus())) {
            throw new BadRequestException("This prescription has already been revoked.");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("A reason is required to revoke a prescription.");
        }
        p.setStatus("Revoked");
        String note = " [Revoked: " + reason.trim() + "]";
        String current = p.getInstructions() != null ? p.getInstructions() : "";
        String combined = current + note;
        p.setInstructions(combined.length() > 1000 ? combined.substring(0, 1000) : combined);
        log.info("Prescription {} revoked", p.getPrescriptionId());
        return PrescriptionResponse.from(prescriptionRepository.save(p));
    }

    /** Permanently removes a prescription together with its medication lines. */
    @Transactional
    public void deletePrescription(String prescriptionId) {
        Prescription p = findOrThrow(prescriptionId);
        // Explicitly clear and delete child prescription items first to prevent FK constraint violations
        if (p.getItems() != null && !p.getItems().isEmpty()) {
            prescriptionItemRepository.deleteAll(p.getItems());
            p.getItems().clear();
        }
        prescriptionItemRepository.deleteByPrescription_PrescriptionId(p.getPrescriptionId());
        prescriptionRepository.delete(p);
        log.info("Prescription {} deleted successfully", prescriptionId);
    }

    private String generatePrescriptionId() {
        long count = prescriptionRepository.count() + 1;
        String candidate;
        do {
            candidate = "RX-2026-" + String.format("%03d", count++);
        } while (prescriptionRepository.existsByPrescriptionId(candidate));
        return candidate;
    }
}
