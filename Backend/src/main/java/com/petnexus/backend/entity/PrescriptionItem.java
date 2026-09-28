package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PrescriptionItem entity — persisted to [PetNexus].[dbo].[prescription_items].
 * Belongs to the centralized PetNexus SQL Server database.
 */
@Entity
@Table(
    name = "prescription_items",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_prescription_items_item_id", columnNames = "itemId")
    },
    indexes = {
        @Index(name = "idx_prescription_items_rx_id", columnList = "prescriptionId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business ID: RXI-xx or RXI-timestamp-idx */
    @Column(nullable = false, length = 50)
    private String itemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_fk_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_rx_items_prescription"))
    private Prescription prescription;

    @Column(length = 30)
    private String prescriptionId;

    @Column(nullable = false, length = 200)
    private String medicationName;

    @Column(length = 100)
    private String dosage;

    @Column(length = 100)
    private String frequency;

    @Column
    @Builder.Default
    private Integer durationDays = 7;

    @Column
    @Builder.Default
    private Integer quantityPrescribed = 1;

    @Column
    @Builder.Default
    private Integer refillsAllowed = 0;
}
