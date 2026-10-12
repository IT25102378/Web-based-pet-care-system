package com.petnexus.backend.dto;







import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
public class ConsultationRequest {

    private String appointmentId;
    private String petId;
    private String petName;
    private String caseId;
    private String vetId;
    private String vetName;

    @DecimalMin(value = "30.0", message = "Temperature must be between 30.0 and 45.0 degrees Celsius")
    @DecimalMax(value = "45.0", message = "Temperature must be between 30.0 and 45.0 degrees Celsius")
    private BigDecimal temperatureC;
    @Min(value = 20, message = "Heart rate must be between 20 and 400 bpm")
    @Max(value = 400, message = "Heart rate must be between 20 and 400 bpm")
    private Integer heartRateBpm;
    @Min(value = 5, message = "Respiratory rate must be between 5 and 200 breaths per minute")
    @Max(value = 200, message = "Respiratory rate must be between 5 and 200 breaths per minute")
    private Integer respiratoryRateBpm;
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0 kg")
    @DecimalMax(value = "500.0", message = "Weight cannot be more than 500 kg")
    private BigDecimal weightKg;

    @Size(max = 2000, message = "Subjective notes cannot be longer than 2000 characters")
    private String subjectiveNotes;
    @Size(max = 2000, message = "Objective findings cannot be longer than 2000 characters")
    private String objectiveFindings;

    @NotBlank(message = "Assessment and diagnosis is required")
    @Size(max = 2000, message = "Assessment and diagnosis cannot be longer than 2000 characters")
    private String assessmentDiagnosis;

    @NotBlank(message = "Treatment plan is required")
    @Size(max = 2000, message = "Treatment plan cannot be longer than 2000 characters")
    private String treatmentPlan;

    @FutureOrPresent(message = "Follow-up date cannot be in the past")
    private LocalDate followUpDate;

    // Rescue animal specific fields
    @Size(max = 2000, message = "Rescue medical summary cannot be longer than 2000 characters")
    private String rescueMedicalSummary;
    private Boolean passToProvider;
}
