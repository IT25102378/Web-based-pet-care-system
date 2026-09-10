package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Supplier entity — persisted to [PetNexus].[dbo].[suppliers].
 */
@Entity
@Table(
    name = "suppliers",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_suppliers_supplier_id", columnNames = "supplierId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String supplierId; // e.g., SUP-01

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(length = 100)
    private String contactPerson;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 100)
    private String category;

    @Column(nullable = false)
    @Builder.Default
    private Integer leadTimeDays = 2;

    @Column(precision = 3, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal rating = new BigDecimal("5.0");

    @Column(length = 300)
    private String address;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

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
