package com.petnexus.backend.entity;

import com.petnexus.backend.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pet entity — persisted to the centralized PetNexus SQL Server database.
 * Table: [PetNexus].[dbo].[pets]
 *
 * A Pet belongs to a User (owner). One user can own many pets.
 * Foreign key: pets.owner_id → users.id
 *
 * Vaccinations and documents are stored in separate tables linked to this pet.
 */
@Entity
@Table(
    name = "pets",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_pets_pet_id", columnNames = "petId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing pet identifier: PET-xxx format. Unique across system. */
    @Column(nullable = false, length = 20)
    private String petId;

    // -----------------------------------------------------------------------
    // Owner Relationship (FK → users.id)
    // -----------------------------------------------------------------------

    /**
     * The owner of this pet.
     * JPA FK: pets.owner_id → users.id
     * LAZY-loaded so user queries don't auto-join pets.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_pets_owner"))
    private User owner;

    // -----------------------------------------------------------------------
    // Core Pet Fields (from frontend initialData.js and MyPetsPage.jsx)
    // -----------------------------------------------------------------------

    @Column(nullable = false, length = 100)
    private String name;

    /** Dog, Cat, Rabbit, Bird, Other */
    @Column(nullable = false, length = 50)
    private String species;

    @Column(nullable = false, length = 100)
    private String breed;

    /** Male, Female, Male (Neutered), Female (Spayed) */
    @Column(length = 30)
    private String gender;

    /** Calculated display age in years (optional redundant field from frontend) */
    @Column
    private Integer ageYears;

    /** Calculated display age remainder in months */
    @Column
    private Integer ageMonths;

    @Column
    private LocalDate dateOfBirth;

    @Column(precision = 5, scale = 2)
    private BigDecimal weightKg;

    /** 15-digit ISO standard microchip number */
    @Column(length = 20)
    private String microchipId;

    @Column(length = 500)
    private String allergies;

    @Column(length = 2000)
    private String medicalNotes;

    @Column(length = 500)
    private String imageUrl;

    /**
     * Emergency contact — stored as a single string (e.g. "Name - +94 77 234 9988").
     * This matches the frontend's single-field representation in the form and data model.
     * Not a separate table.
     */
    @Column(length = 300)
    private String emergencyContact;

    // -----------------------------------------------------------------------
    // Timestamps
    // -----------------------------------------------------------------------

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    // -----------------------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------------------

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Vaccination> vaccinations = new ArrayList<>();

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PetDocument> documents = new ArrayList<>();

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
