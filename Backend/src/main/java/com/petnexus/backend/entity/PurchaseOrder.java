package com.petnexus.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PurchaseOrder entity — persisted to [PetNexus].[dbo].[purchase_orders].
 */
@Entity
@Table(
    name = "purchase_orders",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_purchase_orders_order_id", columnNames = "orderId")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String orderId; // e.g., PO-123456

    @Column(length = 20)
    private String supplierId;

    @Column(nullable = false, length = 150)
    private String supplierName;

    @Column(length = 1000)
    private String itemsDescription;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Dispatched";

    @Column(length = 500)
    private String notes;

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

