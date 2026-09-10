package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for Inventory Item queries.
 * Matches Frontend inventoryApi.js and InventoryPage.jsx.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemResponse {
    private String itemId;
    private String name;
    private String category;
    private String sku;
    private String batchNumber;
    private Integer currentStock;
    private Integer minStockThreshold;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal sellingPrice;
    private LocalDate expiryDate;
    private String supplierId;
    private String supplierName;
    private String status; // "InStock", "LowStock", "OutOfStock", "Expired"
    private LocalDateTime createdAt;
}
