package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PetDocument entity — persisted to [PetNexus].[dbo].[pet_documents]
 *
 * Relationship: Many pet documents belong to one Pet.
 * FK: pet_documents.pet_id -> pets.id
 */
@Entity
@Table(
    name = "pet_documents",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_pet_documents_document_id", columnNames = "documentId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: DOC-xxx */
    @Column(nullable = false, length = 20)
    private String documentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_pet_documents_pet"))
    private Pet pet;

    /** Denormalized pet name for display */
    @Column(length = 100)
    private String petName;

    /** Owner ID (e.g. USR-001) for fast filtering */
    @Column(nullable = false, length = 20)
    private String ownerId;

    /** E.g. Vaccination Certificate, Prescription, Medical Report, Other */
    @Column(nullable = false, length = 100)
    private String documentType;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(length = 1000)
    private String fileUrl;

    @Column(length = 50)
    private String fileSize;

    @Column(length = 2000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }
    }
}
