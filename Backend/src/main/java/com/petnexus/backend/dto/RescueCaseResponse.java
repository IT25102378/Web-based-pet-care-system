package com.petnexus.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for a RescueCase.
 * When fetched by ID, includes nested progressLogs and photos.
 */
@Data
@Builder
public class RescueCaseResponse {

    private String caseId;
    private String caseNumber;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Populated only on getById — sorted newest-first */
    private List<RescueProgressLogResponse> progressLogs;

    /** Populated only on getById */
    private List<RescuePhotoResponse> photos;
}
