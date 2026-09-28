package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Prescription entity — persisted to [PetNexus].[dbo].[prescriptions].
 * Belongs to the centralized PetNexus SQL Server database.
 */
@Entity
@Table(
    name = "prescriptions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_prescriptions_rx_id", columnNames = "prescriptionId")
    },
    indexes = {
        @Index(name = "idx_prescriptions_pet_id", columnList = "petId"),
        @Index(name = "idx_prescriptions_vet_id", columnList = "vetId"),
        @Index(name = "idx_prescriptions_consultation_id", columnList = "consultationId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business ID: RX-2026-xxx format */
    @Column(nullable = false, length = 30)
    private String prescriptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_prescriptions_consultation"))
    private Consultation consultation;

    @Column(length = 30)
    private String consultationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_prescriptions_pet"))
    private Pet pet;

    @Column(length = 20)
    private String petId;

    @Column(nullable = false, length = 100)
    private String petName;

    @Column(length = 150)
    private String ownerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_fk_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_prescriptions_vet"))
    private User veterinarian;

    @Column(length = 20)
    private String vetId;

    @Column(nullable = false, length = 150)
    private String vetName;

    @Column(length = 50)
    private String vetLicense;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column
    private LocalDate validUntil;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Active";

    @Column(length = 1000)
    private String instructions;

    @Column(length = 300)
    private String digitalSignature;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PrescriptionItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.issueDate == null) {
            this.issueDate = LocalDate.now();
        }
        if (this.validUntil == null) {
            this.validUntil = this.issueDate.plusMonths(1);
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
