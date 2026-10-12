package com.petnexus.backend.dto;




import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalkInRequest {

    private String ownerId;

    @NotBlank(message = "ownerName is required")
    @Size(min = 3, max = 150, message = "Owner name must be between 3 and 150 characters")
    @Pattern(regexp = ValidationRules.OPTIONAL_PERSON_NAME, message = "Owner name can only contain letters, spaces and . , ' -")
    private String ownerName;

    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String ownerPhone;

    private String petId;

    @NotBlank(message = "petName is required")
    @Size(max = 100, message = "Pet name cannot be longer than 100 characters")
    @Pattern(regexp = "^$|" + ValidationRules.PET_NAME, message = ValidationRules.PET_NAME_MESSAGE)
    private String petName;

    private String species;
    private String breed;

    @NotBlank(message = "serviceType is required")
    private String serviceType;

    @NotBlank(message = "vetName is required")
    private String vetName;

    private String vetId;

    @NotBlank(message = "reason is required")
    @Size(min = 5, max = 1000, message = "Reason for visit must be between 5 and 1000 characters")
    private String reason;

    @Size(max = 1000, message = "Symptoms cannot be longer than 1000 characters")
    private String symptoms;
    private String severity;
    private LocalDate appointmentDate;
    private String timeSlot;
    @Size(max = 2000, message = "Notes cannot be longer than 2000 characters")
    private String notes;
}
