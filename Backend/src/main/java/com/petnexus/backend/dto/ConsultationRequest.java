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
public class ConsultationRequest {

    private String appointmentId;
    private String petId;
    private String petName;
    private String caseId;
    private String vetId;
    private String vetName;

    private BigDecimal temperatureC;
    private Integer heartRateBpm;
    private Integer respiratoryRateBpm;
    private BigDecimal weightKg;

    private String subjectiveNotes;
    private String objectiveFindings;

    @NotBlank(message = "Assessment and diagnosis is required")
    private String assessmentDiagnosis;

    @NotBlank(message = "Treatment plan is required")
    private String treatmentPlan;

    private LocalDate followUpDate;

    // Rescue animal specific fields
    private String rescueMedicalSummary;
    private Boolean passToProvider;
}
