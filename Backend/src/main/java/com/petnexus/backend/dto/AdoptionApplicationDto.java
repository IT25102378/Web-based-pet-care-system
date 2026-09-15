package com.petnexus.backend.dto;

import com.petnexus.backend.enums.AdoptionApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionApplicationDto {
    private String applicationId;
    private String caseId;
    private String applicantId;
    private String petName;
    private String applicantName;
    private String applicantPhone;
    private String applicantEmail;
    private String applicantAddress;
    private String occupation;
    private String housingType;
    private Boolean hasFencedYard;
    private Integer petExperienceYears;
    private String dailyAloneHours;
    private Boolean hasOtherPets;
    private String otherPetsDetails;
    private String reasonForAdoption;
    private Boolean termsAccepted;
    private String signatureDataUrl;
    private LocalDateTime signedAt;

    /**
     * Declared as the enum, not a String, so Jackson writes the value the
     * frontend compares against. Writing it as a String bypassed @JsonValue
     * and sent the constant name instead.
     */
    private AdoptionApplicationStatus status;
    private String reviewNotes;
    private String reviewedBy;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
