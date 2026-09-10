package com.petnexus.backend.entity;

import com.petnexus.backend.enums.StockStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * InventoryItem entity — persisted to [PetNexus].[dbo].[inventory_items].
 */
@Entity
@Table(
    name = "inventory_items",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_inventory_items_item_id", columnNames = "itemId"),
        @UniqueConstraint(name = "uk_inventory_items_sku", columnNames = "sku")
    },
    indexes = {
        @Index(name = "idx_inventory_items_category", columnList = "category"),
        @Index(name = "idx_inventory_items_status", columnList = "status")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String itemId; // e.g., INV-101

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 50)
    private String sku;

    @Column(length = 50)
    private String batchNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentStock = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer minStockThreshold = 5;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String unit = "Units";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column
    private LocalDate expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_fk_id", foreignKey = @ForeignKey(name = "fk_inventory_items_supplier"))
    private Supplier supplier;

    @Column(length = 150)
    private String supplierName;

    public String getSupplierId() {
        return supplier != null ? supplier.getSupplierId() : null;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StockStatus status = StockStatus.IN_STOCK;

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
