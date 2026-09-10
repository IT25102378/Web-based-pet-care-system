package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * RescueCase entity — persisted to [PetNexus].[dbo].[rescue_cases].
 * Belongs to the centralized PetNexus SQL Server database.
 *
 * State machine (must be enforced in service layer):
 *   Intake → InTreatment | Closed
 *   InTreatment → ReadyForFoster | Closed
 *   ReadyForFoster → InFoster | Closed
 *   InFoster → ReadyForAdoption | Closed
 *   ReadyForAdoption → Adopted | InFoster | Closed
 *   Adopted → Closed
 *   Closed → (terminal)
 */
@Entity
@Table(
    name = "rescue_cases",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_rescue_cases_case_id", columnNames = "caseId")
    },
    indexes = {
        @Index(name = "idx_rescue_cases_status",    columnList = "status"),
        @Index(name = "idx_rescue_cases_published", columnList = "isPublishedForAdoption")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: RSC-YYYY-NNN */
    @Column(nullable = false, length = 30)
    private String caseId;

    /** Short reference number: RC-YYYY-NN */
    @Column(length = 20)
    private String caseNumber;

    // -----------------------------------------------------------------------
    // Animal Details
    // -----------------------------------------------------------------------

    @Column(nullable = false, length = 100)
    private String temporaryName;

    @Column(length = 50)
    private String species;

    @Column(length = 100)
    private String breed;

    @Column(length = 50)
    private String estimatedAge;

    @Column(length = 20)
    private String gender;

    // -----------------------------------------------------------------------
    // Rescue Intake
    // -----------------------------------------------------------------------

    @Column(nullable = false, length = 500)
    private String rescueLocation;

    @Column(nullable = false)
    private LocalDate intakeDate;

    /** Low | Moderate | High | Critical */
    @Column(length = 20)
    private String conditionSeverity;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Intake";

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublishedForAdoption = false;

    @Column(length = 50)
    private String microchipId;

    @Column(length = 150)
    private String intakeOfficer;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String medicalSummary;

    @Column(length = 500)
    private String coverPhotoUrl;

    // -----------------------------------------------------------------------
    // Foster Assignment
    // -----------------------------------------------------------------------

    /** References foster_records.fosterId string (not a FK) */
    @Column(length = 30)
    private String fosterParentId;

    @Column(length = 150)
    private String fosterParentName;

    // -----------------------------------------------------------------------
    // Optional link to Rescue Officer (User)
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescue_officer_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_rescue_cases_officer"))
    private User rescueOfficer;

    // -----------------------------------------------------------------------
    // Timestamps
    // -----------------------------------------------------------------------

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
