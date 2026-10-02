package com.petnexus.backend.dto;

import com.petnexus.backend.entity.Consultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationResponse {

    private Long id;
    private String consultationId;
    private String appointmentId;
    private String petId;
    private String petName;
    private String caseId;
    private String vetId;
    private String vetName;
    private LocalDateTime consultationDate;
    private BigDecimal temperatureC;
    private Integer heartRateBpm;
    private Integer respiratoryRateBpm;
    private BigDecimal weightKg;
    private String subjectiveNotes;
    private String objectiveFindings;
    private String assessmentDiagnosis;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String rescueMedicalSummary;
    private Boolean passToProvider;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ConsultationResponse from(Consultation c) {
        if (c == null) return null;
        return ConsultationResponse.builder()
                .id(c.getId())
                .consultationId(c.getConsultationId())
                .appointmentId(c.getAppointmentId())
                .petId(c.getPetId())
                .petName(c.getPetName())
                .caseId(c.getCaseId())
                .vetId(c.getVetId())
                .vetName(c.getVetName())
                .consultationDate(c.getConsultationDate())
                .temperatureC(c.getTemperatureC())
                .heartRateBpm(c.getHeartRateBpm())
                .respiratoryRateBpm(c.getRespiratoryRateBpm())
                .weightKg(c.getWeightKg())
                .subjectiveNotes(c.getSubjectiveNotes())
                .objectiveFindings(c.getObjectiveFindings())
                .assessmentDiagnosis(c.getAssessmentDiagnosis())
                .treatmentPlan(c.getTreatmentPlan())
                .followUpDate(c.getFollowUpDate())
                .rescueMedicalSummary(c.getRescueMedicalSummary())
                .passToProvider(c.getPassToProvider())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
