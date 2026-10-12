package com.petnexus.backend.dto;







import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
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
    private String applicationType;
    private String petName;
    @Size(max = 150, message = "Applicant name cannot be longer than 150 characters")
    @Pattern(regexp = ValidationRules.OPTIONAL_PERSON_NAME, message = ValidationRules.PERSON_NAME_MESSAGE)
    private String applicantName;
    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String applicantPhone;
    @Email(message = ValidationRules.EMAIL_MESSAGE)
    private String applicantEmail;
    @Size(max = 300, message = "Address cannot be longer than 300 characters")
    private String applicantAddress;
    private String occupation;
    private String housingType;
    private Boolean hasFencedYard;
    @Min(value = 0, message = "Pet experience cannot be negative")
    @Max(value = 80, message = "Pet experience cannot be more than 80 years")
    private Integer petExperienceYears;
    private String dailyAloneHours;
    private Boolean hasOtherPets;
    private String otherPetsDetails;
    @Size(max = 2000, message = "Reason for adoption cannot be longer than 2000 characters")
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
            if (this.applicationType == null && data.get("applicationType") != null) this.applicationType = String.valueOf(data.get("applicationType"));
            if (this.petName == null && data.get("petName") != null) this.petName = String.valueOf(data.get("petName"));
            if (this.applicantName == null && data.get("applicantName") != null) this.applicantName = String.valueOf(data.get("applicantName"));
            if (this.applicantPhone == null && data.get("applicantPhone") != null) this.applicantPhone = String.valueOf(data.get("applicantPhone"));
            if (this.applicantEmail == null && data.get("applicantEmail") != null) this.applicantEmail = String.valueOf(data.get("applicantEmail"));
            if (this.applicantAddress == null && data.get("applicantAddress") != null) this.applicantAddress = String.valueOf(data.get("applicantAddress"));
            if (this.reasonForAdoption == null && data.get("reasonForAdoption") != null) this.reasonForAdoption = String.valueOf(data.get("reasonForAdoption"));
        }
    }
}
