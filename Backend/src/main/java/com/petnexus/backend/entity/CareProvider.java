package com.petnexus.backend.entity;

import com.petnexus.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a pet care/grooming provider.
 * Linked to a User with role PET_CARE_PROVIDER.
 */
@Entity
@Table(name = "care_providers",
    uniqueConstraints = @UniqueConstraint(name = "uk_care_provider_user", columnNames = {"user_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String providerId; // e.g., PRV-001

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_care_provider_user"))
    private com.petnexus.backend.entity.User user;

    @Column(nullable = false, length = 100)
    private String providerName;

    @Column(length = 20)
    private String contactPhone;

    @Column(length = 100)
    private String contactEmail;

    @Column(nullable = false)
    private boolean active;
}
