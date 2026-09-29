package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetRequest {
    private String ownerId;
    private String ownerName;

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    @NotBlank(message = "Breed is required")
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
}
