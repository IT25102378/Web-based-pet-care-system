package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * RescuePhoto entity — persisted to [PetNexus].[dbo].[rescue_photos].
 * Tagged photo gallery entries for a rescue case.
 */
@Entity
@Table(
    name = "rescue_photos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_rescue_photos_photo_id", columnNames = "photoId")
    },
    indexes = {
        @Index(name = "idx_rescue_photos_case_id", columnList = "caseId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescuePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: RPH-NN */
    @Column(nullable = false, length = 30)
    private String photoId;

    // -----------------------------------------------------------------------
    // Rescue Case Link
    // -----------------------------------------------------------------------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescue_case_fk_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_rescue_photos_case"))
    private RescueCase rescueCase;

    /** Denormalized string for easy querying */
    @Column(nullable = false, length = 30)
    private String caseId;

    // -----------------------------------------------------------------------
    // Photo Details
    // -----------------------------------------------------------------------

    @Column(nullable = false, length = 500)
    private String photoUrl;

    @Column(length = 300)
    private String caption;

    @Column
    private LocalDateTime uploadedAt;

    /** Intake Evidence | Adoption Profile | Foster Life | Medical | Other */
    @Column(length = 50)
    private String tag;

    @PrePersist
    protected void onCreate() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }
    }
}
