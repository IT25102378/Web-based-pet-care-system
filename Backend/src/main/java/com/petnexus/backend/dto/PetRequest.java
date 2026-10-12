package com.petnexus.backend.dto;









import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
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
    @Size(max = 100, message = "Pet name cannot be longer than 100 characters")
    @Pattern(regexp = "^$|" + ValidationRules.PET_NAME, message = ValidationRules.PET_NAME_MESSAGE)
    private String name;

    @NotBlank(message = "Species is required")
    @Size(max = 50, message = "Species cannot be longer than 50 characters")
    private String species;

    @NotBlank(message = "Breed is required")
    @Size(max = 100, message = "Breed cannot be longer than 100 characters")
    private String breed;

    private String gender;
    @Min(value = 0, message = "Age in years cannot be negative")
    @Max(value = 40, message = "Age in years cannot be more than 40")
    private Integer ageYears;
    @Min(value = 0, message = "Age in months must be between 0 and 11")
    @Max(value = 11, message = "Age in months must be between 0 and 11")
    private Integer ageMonths;
    @PastOrPresent(message = "Date of birth cannot be in the future")
    private LocalDate dateOfBirth;
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0 kg")
    @DecimalMax(value = "500.0", message = "Weight cannot be more than 500 kg")
    private BigDecimal weightKg;
    @Size(max = 20, message = "Microchip ID cannot be longer than 20 characters")
    private String microchipId;
    @Size(max = 500, message = "Allergies cannot be longer than 500 characters")
    private String allergies;
    @Size(max = 2000, message = "Medical notes cannot be longer than 2000 characters")
    private String medicalNotes;
    private String imageUrl;
    @Size(max = 300, message = "Emergency contact cannot be longer than 300 characters")
    @Pattern(regexp = ValidationRules.EMERGENCY_CONTACT, message = ValidationRules.EMERGENCY_CONTACT_MESSAGE)
    private String emergencyContact;
}
