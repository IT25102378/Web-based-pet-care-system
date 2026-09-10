package com.petnexus.backend.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionListing {
    @Id
    @Column(name = "listing_id", nullable = false, updatable = false)
    private String listingId; // e.g., ADL-0001

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private RescueCase rescueCase;

    @Column(name = "is_published_for_adoption", nullable = false)
    private boolean isPublishedForAdoption = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
