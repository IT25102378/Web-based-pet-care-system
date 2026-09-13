package com.petnexus.backend.service;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.PetDocument;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.entity.Vaccination;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.PetDocumentRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.repository.VaccinationRepository;
import com.petnexus.backend.security.SecurityUtils;
import com.petnexus.backend.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PetDocumentRepository petDocumentRepository;

    // =========================================================================
    // Pet Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<PetResponse> getAllPets(String ownerId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.PetOwner) {
            // Force filtering to the owner's own pets
            ownerId = currentUser.getUserId();
        } else if (ownerId == null || ownerId.trim().isEmpty()) {
            SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
        }

        List<Pet> pets;
        if (ownerId != null && !ownerId.trim().isEmpty()) {
            pets = petRepository.findByOwner_UserId(ownerId.trim());
        } else {
            pets = petRepository.findAll();
        }
        return pets.stream().map(PetResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PetResponse getPetById(String petId) {
        Pet pet = petRepository.findByPetId(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + petId));
        if (pet.getOwner() != null) {
            SecurityUtils.enforceOwnershipOrRole(pet.getOwner().getUserId(), UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
        }
        return PetResponse.from(pet);
    }

    @Transactional
    public PetResponse createPet(PetRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.PetOwner) {
            request.setOwnerId(currentUser.getUserId());
        } else {
            SecurityUtils.enforceOwnershipOrRole(request.getOwnerId(), UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
        }

        if (request.getOwnerId() == null || request.getOwnerId().trim().isEmpty()) {
            throw new BadRequestException("ownerId is required to register a pet.");
        }

        User owner = userRepository.findByUserId(request.getOwnerId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + request.getOwnerId()));

        String petId = generatePetId();

        Pet pet = Pet.builder()
                .petId(petId)
                .owner(owner)
                .name(request.getName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .gender(request.getGender())
                .ageYears(request.getAgeYears())
                .ageMonths(request.getAgeMonths())
                .dateOfBirth(request.getDateOfBirth())
                .weightKg(request.getWeightKg())
                .microchipId(request.getMicrochipId())
                .allergies(request.getAllergies())
                .medicalNotes(request.getMedicalNotes())
                .imageUrl(request.getImageUrl())
                .emergencyContact(request.getEmergencyContact())
                .build();

        Pet saved = petRepository.save(pet);
        log.info("Pet created: {} for owner: {}", petId, owner.getUserId());
        return PetResponse.from(saved);
    }

    @Transactional
    public PetResponse updatePet(String petId, PetRequest request) {
        Pet pet = petRepository.findByPetId(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + petId));

        if (pet.getOwner() != null) {
            SecurityUtils.enforceOwnershipOrRole(pet.getOwner().getUserId(), UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
        }

        if (request.getOwnerId() != null && !request.getOwnerId().trim().isEmpty()) {
            String requestedOwnerId = request.getOwnerId().trim();
            boolean ownerIsChanging = pet.getOwner() == null
                    || !requestedOwnerId.equals(pet.getOwner().getUserId());

            // Sending the pet's existing owner back unchanged is a normal edit,
            // so it is allowed for anyone who passed the ownership check above.
            // Handing the pet to a DIFFERENT owner is a staff action, which is
            // why PetOwner is deliberately absent from the role list below.
            if (ownerIsChanging) {
                SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);

                User newOwner = userRepository.findByUserId(requestedOwnerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + requestedOwnerId));
                pet.setOwner(newOwner);
            }
        }

        if (request.getName() != null) pet.setName(request.getName());
        if (request.getSpecies() != null) pet.setSpecies(request.getSpecies());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getAgeYears() != null) pet.setAgeYears(request.getAgeYears());
        if (request.getAgeMonths() != null) pet.setAgeMonths(request.getAgeMonths());
        if (request.getDateOfBirth() != null) pet.setDateOfBirth(request.getDateOfBirth());
        if (request.getWeightKg() != null) pet.setWeightKg(request.getWeightKg());
        if (request.getMicrochipId() != null) pet.setMicrochipId(request.getMicrochipId());
        if (request.getAllergies() != null) pet.setAllergies(request.getAllergies());
        if (request.getMedicalNotes() != null) pet.setMedicalNotes(request.getMedicalNotes());
        if (request.getImageUrl() != null) pet.setImageUrl(request.getImageUrl());
        if (request.getEmergencyContact() != null) pet.setEmergencyContact(request.getEmergencyContact());

        Pet saved = petRepository.save(pet);
        log.info("Pet updated: {}", petId);
        return PetResponse.from(saved);
    }

    @Transactional
    public void deletePet(String petId) {
        Pet pet = petRepository.findByPetId(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + petId));
        if (pet.getOwner() != null) {
            SecurityUtils.enforceOwnershipOrRole(pet.getOwner().getUserId(), UserRole.Admin);
        }
        petRepository.delete(pet);
        log.info("Pet deleted: {}", petId);
    }

    // =========================================================================
    // Vaccination Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<VaccinationResponse> getVaccinations(String petId) {
        if (petId != null && !petId.trim().isEmpty()) {
            Pet pet = petRepository.findByPetId(petId.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + petId));
            if (pet.getOwner() != null) {
                SecurityUtils.enforceOwnershipOrRole(pet.getOwner().getUserId(), UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
            }
        } else {
            SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
        }

        List<Vaccination> vacs;
        if (petId != null && !petId.trim().isEmpty()) {
            vacs = vaccinationRepository.findByPet_PetId(petId.trim());
        } else {
            vacs = vaccinationRepository.findAll();
        }
        return vacs.stream().map(VaccinationResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public VaccinationResponse addVaccination(VaccinationRequest request) {
        SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicStaff, UserRole.ClinicManager); // Only Vets/ClinicStaff/Admin can add vaccinations

        Pet pet = petRepository.findByPetId(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + request.getPetId()));

        String vaccineId = generateVaccineId();
        String status = (request.getStatus() != null && !request.getStatus().trim().isEmpty())

                ? request.getStatus().trim()
                : "Up-to-Date";

        Vaccination vaccination = Vaccination.builder()
                .vaccineId(vaccineId)
                .pet(pet)
                .petName(request.getPetName() != null ? request.getPetName() : pet.getName())
                .vaccineName(request.getVaccineName())
                .batchNumber(request.getBatchNumber())
                .administeredDate(request.getAdministeredDate())
                .nextDueDate(request.getNextDueDate())
                .administeredBy(request.getAdministeredBy())
                .status(status)
                .build();

        Vaccination saved = vaccinationRepository.save(vaccination);
        log.info("Vaccination added: {} for pet: {}", vaccineId, pet.getPetId());
        return VaccinationResponse.from(saved);
    }

    // =========================================================================
    // Pet Document Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<PetDocumentResponse> getPetDocuments(String petId, String ownerId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.PetOwner) {
            ownerId = currentUser.getUserId();
        } else if ((ownerId == null || ownerId.trim().isEmpty()) && (petId == null || petId.trim().isEmpty())) {
            SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
        } else if (petId != null && !petId.trim().isEmpty()) {
            Pet pet = petRepository.findByPetId(petId.trim()).orElse(null);
            if (pet != null && pet.getOwner() != null) {
                SecurityUtils.enforceOwnershipOrRole(pet.getOwner().getUserId(), UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
            }
        }

        List<PetDocument> docs;
        boolean hasPet = petId != null && !petId.trim().isEmpty();
        boolean hasOwner = ownerId != null && !ownerId.trim().isEmpty();

        if (hasPet && hasOwner) {
            docs = petDocumentRepository.findByPet_PetIdAndOwnerId(petId.trim(), ownerId.trim());
        } else if (hasPet) {
            docs = petDocumentRepository.findByPet_PetId(petId.trim());
        } else if (hasOwner) {
            docs = petDocumentRepository.findByOwnerId(ownerId.trim());
        } else {
            docs = petDocumentRepository.findAll();
        }
        return docs.stream().map(PetDocumentResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PetDocumentResponse getPetDocumentById(String documentId) {
        PetDocument doc = petDocumentRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet document not found with ID: " + documentId));
        SecurityUtils.enforceOwnershipOrRole(doc.getOwnerId(), UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);
        return PetDocumentResponse.from(doc);
    }

    @Transactional
    public PetDocumentResponse uploadPetDocument(PetDocumentRequest request) {
        Pet pet = petRepository.findByPetId(request.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + request.getPetId()));

        String documentId = generateDocumentId();
        String ownerId = (request.getOwnerId() != null && !request.getOwnerId().trim().isEmpty())
                ? request.getOwnerId().trim()
                : (pet.getOwner() != null ? pet.getOwner().getUserId() : null);

        if (ownerId == null) {
            throw new BadRequestException("Cannot determine owner ID for document upload.");
        }

        SecurityUtils.enforceOwnershipOrRole(ownerId, UserRole.Admin, UserRole.Veterinarian, UserRole.ClinicManager, UserRole.ClinicStaff);

        PetDocument doc = PetDocument.builder()
                .documentId(documentId)
                .pet(pet)
                .petName(request.getPetName() != null ? request.getPetName() : pet.getName())
                .ownerId(ownerId)
                .documentType(request.getDocumentType())
                .fileName(request.getFileName())
                .fileUrl(request.getFileUrl())
                .fileSize(request.getFileSize())
                .notes(request.getNotes())
                .uploadedAt(LocalDateTime.now())
                .build();

        PetDocument saved = petDocumentRepository.save(doc);
        log.info("Pet document uploaded: {} for pet: {}", documentId, pet.getPetId());
        return PetDocumentResponse.from(saved);
    }

    @Transactional
    public void deletePetDocument(String documentId) {
        PetDocument doc = petDocumentRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet document not found with ID: " + documentId));
        SecurityUtils.enforceOwnershipOrRole(doc.getOwnerId(), UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
        petDocumentRepository.delete(doc);
        log.info("Pet document deleted: {}", documentId);
    }

    // =========================================================================
    // ID Generators
    // =========================================================================

    private String generatePetId() {
        long count = petRepository.count() + 1;
        String candidate;
        do {
            candidate = "PET-" + String.format("%03d", count++);
        } while (petRepository.existsByPetId(candidate));
        return candidate;
    }

    private String generateVaccineId() {
        long count = vaccinationRepository.count() + 1;
        String candidate;
        do {
            candidate = "VAC-" + String.format("%03d", count++);
        } while (vaccinationRepository.existsByVaccineId(candidate));
        return candidate;
    }

    private String generateDocumentId() {
        long count = petDocumentRepository.count() + 101;
        String candidate;
        do {
            candidate = "DOC-" + String.format("%03d", count++);
        } while (petDocumentRepository.existsByDocumentId(candidate));
        return candidate;
    }
}
