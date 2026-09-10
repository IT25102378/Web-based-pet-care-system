package com.petnexus.backend.dto;

import com.petnexus.backend.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetResponse {
    private Long id;
    private String petId;
    private String ownerId;
    private String ownerName;
    private String name;
    private String species;
    private String breed;
    private String gender;
    private Integer ageYears;
    private Integer ageMonths;
    private LocalDate dateOfBirth;
    private BigDecimal weightKg;
    private String microchipId;
    private String allergies;
    private String medicalNotes;
    private String imageUrl;
    private String emergencyContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PetResponse from(Pet pet) {
        if (pet == null) return null;
        return PetResponse.builder()
                .id(pet.getId())
                .petId(pet.getPetId())
                .ownerId(pet.getOwner() != null ? pet.getOwner().getUserId() : null)
                .ownerName(pet.getOwner() != null ? pet.getOwner().getFullName() : null)
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .gender(pet.getGender())
                .ageYears(pet.getAgeYears())
                .ageMonths(pet.getAgeMonths())
                .dateOfBirth(pet.getDateOfBirth())
                .weightKg(pet.getWeightKg())
                .microchipId(pet.getMicrochipId())
                .allergies(pet.getAllergies())
                .medicalNotes(pet.getMedicalNotes())
                .imageUrl(pet.getImageUrl())
                .emergencyContact(pet.getEmergencyContact())
                .createdAt(pet.getCreatedAt())
                .updatedAt(pet.getUpdatedAt())
                .build();
    }
}
