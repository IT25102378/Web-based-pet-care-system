package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * RescueProgressLog entity — persisted to [PetNexus].[dbo].[rescue_progress_logs].
 * Records medical, behavioral, milestone, and foster events for a rescue case.
 */
@Entity
@Table(
    name = "rescue_progress_logs",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_rescue_progress_logs_log_id", columnNames = "logId")
    },
    indexes = {
        @Index(name = "idx_rescue_logs_case_id",  columnList = "caseId"),
        @Index(name = "idx_rescue_logs_log_date", columnList = "logDate")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueProgressLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: RPL-NNN */
    @Column(nullable = false, length = 30)
    private String logId;

    // -----------------------------------------------------------------------
    // Rescue Case Link
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescue_case_fk_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_rescue_logs_case"))
    private RescueCase rescueCase;

    /** Denormalized string for easy querying */
    @Column(nullable = false, length = 30)
    private String caseId;

    // -----------------------------------------------------------------------
    // Log Details
    // -----------------------------------------------------------------------

    @Column(nullable = false, length = 150)
    private String loggedBy;

    @Column(nullable = false)
    private LocalDateTime logDate;

    /** Medical | Behavioral | Milestone | Foster | Intake | Status */
    @Column(length = 30)
    private String logType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String notes;

    // -----------------------------------------------------------------------
    // Timestamp
    // -----------------------------------------------------------------------

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.logDate == null) {
            this.logDate = LocalDateTime.now();
        }
        this.createdAt = LocalDateTime.now();
    }
}
