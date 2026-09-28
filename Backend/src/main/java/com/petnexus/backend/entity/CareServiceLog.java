package com.petnexus.backend.entity;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Stores a log entry for a pet care / grooming service.
 * Can be linked to a Pet (owned) or a RescueCase (caseId) but not both.
 */
@Entity
@Table(name = "care_service_logs",
    uniqueConstraints = @UniqueConstraint(name = "uk_care_service_log_id", columnNames = {"serviceLogId"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareServiceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String serviceLogId; // CSL-xxxx

    // Service details (provided by frontend)
    @Column(nullable = false, length = 100)
    private String serviceType;

    @Column(length = 500)
    private String intakeCondition;

    @Column(length = 1000)
    private String servicesPerformed;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private boolean returnToRescue;

    // Date of service (defaults to today if not supplied)
    @Column(nullable = false)
    private LocalDate serviceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ServiceStatus status;

    // Owner / Pet fields (owner of the pet)
    @Column(length = 20)
    private String ownerId;

    @Column(length = 100)
    private String ownerName;

    @Column(length = 20)
    private String petId; // nullable for rescue case

    @Column(length = 100)
    private String petName;

    // Optional rescue case linkage
    @Column(length = 20)
    private String caseId; // nullable, foreign key to rescue_cases.case_id (logical)

    // Provider fields
    @Column(length = 20)
    private String providerId;

    @Column(length = 100)
    private String providerName;

    // Timestamps
    @Column(nullable = false)
    private LocalDate createdAt;
}
