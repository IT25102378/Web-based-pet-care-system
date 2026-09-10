package com.petnexus.backend.dto;

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

    private String temporaryName;
    private String species;
    private String breed;
    private String estimatedAge;
    private String gender;
    private String rescueLocation;
    private LocalDate intakeDate;
    private String conditionSeverity;
    private String status;
    private Boolean isPublishedForAdoption;
    private String microchipId;
    private String intakeOfficer;
    private String description;
    private String medicalSummary;
    private String coverPhotoUrl;
    private String fosterParentId;
    private String fosterParentName;
}
