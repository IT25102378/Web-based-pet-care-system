package com.petnexus.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.Email;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateApplicationRequest {
    private String caseId;
    private String applicantId;
    private String petName;
    private String applicantName;
    private String applicantPhone;
    @Email(message = ValidationRules.EMAIL_MESSAGE)
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
    private List<Map<String, Object>> documents;

    public CreateApplicationRequest(String caseId, String applicantId, String petName, String applicantName, String applicantPhone) {
        this.caseId = caseId;
        this.applicantId = applicantId;
        this.petName = petName;
        this.applicantName = applicantName;
        this.applicantPhone = applicantPhone;
    }

    public void setApplicationData(Map<String, Object> data) {
        if (data != null) {
            if (this.caseId == null && data.get("caseId") != null) this.caseId = String.valueOf(data.get("caseId"));
            if (this.applicantId == null && data.get("applicantId") != null) this.applicantId = String.valueOf(data.get("applicantId"));
            if (this.petName == null && data.get("petName") != null) this.petName = String.valueOf(data.get("petName"));
            if (this.applicantName == null && data.get("applicantName") != null) this.applicantName = String.valueOf(data.get("applicantName"));
            if (this.applicantPhone == null && data.get("applicantPhone") != null) this.applicantPhone = String.valueOf(data.get("applicantPhone"));
            if (this.applicantEmail == null && data.get("applicantEmail") != null) this.applicantEmail = String.valueOf(data.get("applicantEmail"));
            if (this.applicantAddress == null && data.get("applicantAddress") != null) this.applicantAddress = String.valueOf(data.get("applicantAddress"));
            if (this.reasonForAdoption == null && data.get("reasonForAdoption") != null) this.reasonForAdoption = String.valueOf(data.get("reasonForAdoption"));
        }
    }
}
