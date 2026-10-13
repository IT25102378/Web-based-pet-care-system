package com.petnexus.backend.dto;





import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for creating or updating a RescueCase.
 * All fields are optional to support partial PUT updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueCaseRequest {

    @Size(max = 100, message = "Animal name cannot be longer than 100 characters")
    private String temporaryName;
    @Size(max = 50, message = "Species cannot be longer than 50 characters")
    private String species;
    @Size(max = 100, message = "Breed cannot be longer than 100 characters")
    private String breed;
    @Size(max = 50, message = "Estimated age cannot be longer than 50 characters")
    private String estimatedAge;
    @Pattern(regexp = "(?i)^$|^(male|female|unknown|male & female|male pair|female pair)$",
             message = "Gender must be Male, Female or Unknown")
    private String gender;
    @Size(max = 500, message = "Rescue location cannot be longer than 500 characters")
    private String rescueLocation;
    @PastOrPresent(message = "Intake date cannot be in the future")
    private LocalDate intakeDate;
    @Pattern(regexp = "(?i)^$|^\\s*(low|moderate|high|critical).{0,40}$",
             message = "Condition severity must be Low, Moderate, High or Critical")
    private String conditionSeverity;
    @Pattern(regexp = "^$|^(Reported|Intake|InTreatment|ReadyForFoster|InFoster|ReadyForAdoption|Adopted|Closed)$",
             message = "Invalid rescue case status")
    private String status;
    private Boolean isPublishedForAdoption;
    @Size(max = 50, message = "Microchip ID cannot be longer than 50 characters")
    private String microchipId;
    private String intakeOfficer;
    @Size(max = 2000, message = "Description cannot be longer than 2000 characters")
    private String description;
    @Size(max = 2000, message = "Medical summary cannot be longer than 2000 characters")
    private String medicalSummary;
    private String coverPhotoUrl;
    private String fosterParentId;
    private String fosterParentName;
    private String assignedVetId;
    private String assignedVetName;
    private String assignedProviderId;
    private String assignedProviderName;
    private String assignedOfficerId;
    private String assignedOfficerName;
    private String reportedByUserId;
    private String reportedByUserName;
    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String reportedByUserPhone;
}
