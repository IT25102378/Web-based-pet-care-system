package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * FosterRecord entity — persisted to [PetNexus].[dbo].[foster_records].
 * Registered foster family directory used by the Rescue Officer workspace.
 */
@Entity
@Table(
    name = "foster_records",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_foster_records_foster_id", columnNames = "fosterId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FosterRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business-facing ID: FST-NNN */
    @Column(nullable = false, length = 30)
    private String fosterId;

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 300)
    private String address;

    @Column(length = 200)
    private String homeType;

    @Column
    @Builder.Default
    private Integer activePlacements = 0;

    @Column
    @Builder.Default
    private Integer maxCapacity = 2;

    /** Rating out of 5.0 */
    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    /** Active | Inactive */
    @Column(length = 20)
    @Builder.Default
    private String status = "Active";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

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
