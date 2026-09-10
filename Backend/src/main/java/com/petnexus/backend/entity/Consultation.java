package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Consultation entity — persisted to [PetNexus].[dbo].[consultations].
 * Belongs to the centralized PetNexus SQL Server database.
 *
 * Relationships:
 * - Linked to Appointment (optional).
 * - Linked to Pet (optional for rescue animals).
 * - Linked to Veterinarian (User).
 */
@Entity
@Table(
    name = "consultations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_consultations_consultation_id", columnNames = "consultationId")
    },
    indexes = {
        @Index(name = "idx_consultations_pet_id", columnList = "petId"),
        @Index(name = "idx_consultations_case_id", columnList = "caseId"),
        @Index(name = "idx_consultations_vet_id", columnList = "vetId"),
        @Index(name = "idx_consultations_appointment_id", columnList = "appointmentId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: CNS-2026-xx format */
    @Column(nullable = false, length = 30)
    private String consultationId;

    // -----------------------------------------------------------------------
    // Appointment & Subject
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_consultations_appointment"))
    private Appointment appointment;

    @Column(length = 20)
    private String appointmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_consultations_pet"))
    private Pet pet;

    @Column(length = 20)
    private String petId;

    @Column(nullable = false, length = 100)
    private String petName;

    /** For rescue animals: caseId (e.g. RSC-2026-001) */
    @Column(length = 30)
    private String caseId;

    // -----------------------------------------------------------------------
    // Veterinarian
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_consultations_vet"))
    private User veterinarian;

    @Column(length = 20)
    private String vetId;

    @Column(nullable = false, length = 150)
    private String vetName;

    // -----------------------------------------------------------------------
    // Timing & Vitals
    // -----------------------------------------------------------------------

    @Column(nullable = false)
    private LocalDateTime consultationDate;

    @Column(precision = 4, scale = 1)
    private BigDecimal temperatureC;

    @Column
    private Integer heartRateBpm;

    @Column
    private Integer respiratoryRateBpm;

    @Column(precision = 5, scale = 2)
    private BigDecimal weightKg;

    // -----------------------------------------------------------------------
    // SOAP Clinical Notes
    // -----------------------------------------------------------------------

    @Column(length = 2000)
    private String subjectiveNotes;

    @Column(length = 2000)
    private String objectiveFindings;

    @Column(nullable = false, length = 2000)
    private String assessmentDiagnosis;

    @Column(nullable = false, length = 2000)
    private String treatmentPlan;

    @Column
    private LocalDate followUpDate;

    // -----------------------------------------------------------------------
    // Rescue Animal Fields
    // -----------------------------------------------------------------------

    @Column(length = 2000)
    private String rescueMedicalSummary;

    @Column
    private Boolean passToProvider;

    @Column(length = 30)
    @Builder.Default
    private String status = "Completed";

    // -----------------------------------------------------------------------
    // Timestamps
    // -----------------------------------------------------------------------

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.consultationDate == null) {
            this.consultationDate = LocalDateTime.now();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
