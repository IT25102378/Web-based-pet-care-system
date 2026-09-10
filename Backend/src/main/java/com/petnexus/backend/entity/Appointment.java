package com.petnexus.backend.entity;

import com.petnexus.backend.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Appointment entity — persisted to [PetNexus].[dbo].[appointments].
 * Belongs to the centralized PetNexus SQL Server database.
 *
 * Relationships:
 * - Many appointments can link to one Pet (nullable for walk-ins).
 * - Many appointments can link to one User as owner (nullable for walk-ins).
 * - Many appointments can link to one User as veterinarian (nullable).
 */
@Entity
@Table(
    name = "appointments",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_appointments_appointment_id", columnNames = "appointmentId")
    },
    indexes = {
        @Index(name = "idx_appointments_date_slot", columnList = "appointmentDate, timeSlot"),
        @Index(name = "idx_appointments_vet_date", columnList = "vetId, appointmentDate"),
        @Index(name = "idx_appointments_owner", columnList = "ownerId"),
        @Index(name = "idx_appointments_pet", columnList = "petId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: APT-xxxx format */
    @Column(nullable = false, length = 20)
    private String appointmentId;

    // -----------------------------------------------------------------------
    // Pet Relationship & Details
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_appointments_pet"))
    private Pet pet;

    @Column(length = 20)
    private String petId;

    @Column(nullable = false, length = 100)
    private String petName;

    @Column(length = 50)
    private String species;

    @Column(length = 100)
    private String breed;

    // -----------------------------------------------------------------------
    // Owner Relationship & Details
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_appointments_owner"))
    private User owner;

    @Column(length = 20)
    private String ownerId;

    @Column(nullable = false, length = 150)
    private String ownerName;

    @Column(length = 50)
    private String ownerPhone;

    // -----------------------------------------------------------------------
    // Veterinarian Relationship & Details
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_appointments_vet"))
    private User veterinarian;

    @Column(length = 20)
    private String vetId;

    @Column(nullable = false, length = 150)
    private String vetName;

    // -----------------------------------------------------------------------
    // Schedule & Status
    // -----------------------------------------------------------------------

    @Column(nullable = false, length = 100)
    private String serviceType;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false, length = 30)
    private String timeSlot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AppointmentStatus status;

    /** Queue token: e.g. A-01 (scheduled) or W-01 (walk-in) */
    @Column(length = 20)
    private String tokenNumber;

    @Column(length = 1000)
    private String reason;

    @Column(length = 1000)
    private String symptoms;

    @Column(length = 2000)
    private String notes;

    // -----------------------------------------------------------------------
    // Cancellation & Rescheduling History
    // -----------------------------------------------------------------------

    @Column(length = 500)
    private String cancellationReason;

    @Column
    private LocalDateTime cancelledAt;

    @Column
    private LocalDate rescheduledFromDate;

    @Column(length = 30)
    private String rescheduledFromTimeSlot;

    @Column(length = 150)
    private String rescheduledFromVetName;

    @Column(length = 500)
    private String rescheduleReason;

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
