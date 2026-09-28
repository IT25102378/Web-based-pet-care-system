package com.petnexus.backend.entity;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Represents a care/grooming service offering (Wellness Package).
 * Linked to the user who created the service (admin/provider).
 *
 * Extended with package-specific display fields used in the Package Management UI:
 * badge, tagline, originalValue, discountPercent, recommendedFor.
 */
@Entity
@Table(name = "care_services",
    uniqueConstraints = @UniqueConstraint(name = "uk_care_service_name", columnNames = {"name"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String serviceId; // e.g., CSR-001

    @Column(nullable = false, length = 100)
    private String name;

    /** Full description or comma-separated feature list */
    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** Original/full-value price before discount — for crossed-out display */
    @Column(precision = 10, scale = 2)
    private BigDecimal originalValue;

    /** Discount percentage (0-100) */
    @Column
    private Integer discountPercent;

    /** Marketing badge text (e.g. "Popular", "Best Seller", "Senior Special") */
    @Column(length = 50)
    private String badge;

    /** One-line marketing tagline displayed below the package name */
    @Column(length = 300)
    private String tagline;

    /** Recommended species/pet type (e.g. "Dogs & Cats", "All pets") */
    @Column(length = 100)
    private String recommendedFor;

    @Column(nullable = false)
    @Builder.Default
    private int durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ServiceStatus status = ServiceStatus.SCHEDULED; // SCHEDULED = active

    // Creator of the service (admin or provider)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_care_service_user"))
    private com.petnexus.backend.entity.User createdBy;
}
