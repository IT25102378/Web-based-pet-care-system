package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Vaccination record — persisted to [PetNexus].[dbo].[vaccinations]
 *
 * Relationship: Many vaccinations belong to one Pet.
 * FK: vaccinations.pet_id → pets.id
 *
 * Fields match the frontend's initialVaccinationRecords exactly.
 */
@Entity
@Table(
    name = "vaccinations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_vaccinations_vaccine_id", columnNames = "vaccineId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: VAC-xxx */
    @Column(nullable = false, length = 20)
    private String vaccineId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_vaccinations_pet"))
    private Pet pet;

    /** Denormalized pet name for display (matches frontend shape) */
    @Column(length = 100)
    private String petName;

    @Column(nullable = false, length = 200)
    private String vaccineName;

    @Column(length = 50)
    private String batchNumber;

    @Column
    private LocalDate administeredDate;

    @Column
    private LocalDate nextDueDate;

    @Column(length = 150)
    private String administeredBy;

    /** Up-to-Date, Due Soon, Overdue */
    @Column(length = 30)
    private String status;
}
