package com.petnexus.backend.entity;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Represents a care/grooming service offering.
 * Linked to the user who created the service (admin/provider).
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

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ServiceStatus status; // ACTIVE / INACTIVE

    // Creator of the service (admin or provider)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_care_service_user"))
    private com.petnexus.backend.entity.User createdBy;
}
