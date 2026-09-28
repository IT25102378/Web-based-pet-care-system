package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating or updating an Inventory Item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    private String category;

    @NotBlank(message = "SKU is required")
    @Size(max = 50)
    private String sku;

    @Size(max = 50)
    private String batchNumber;

    @NotNull(message = "Current stock is required")
    @PositiveOrZero(message = "Current stock cannot be negative")
    private Integer currentStock;

    @NotNull(message = "Minimum stock threshold is required")
    @PositiveOrZero(message = "Minimum stock threshold cannot be negative")
    private Integer minStockThreshold;

    @NotBlank(message = "Unit is required")
    @Size(max = 50)
    private String unit;

    @NotNull(message = "Unit price is required")
    @PositiveOrZero(message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    @NotNull(message = "Selling price is required")
    @PositiveOrZero(message = "Selling price cannot be negative")
    private BigDecimal sellingPrice;

    private LocalDate expiryDate;

    @Size(max = 20)
    private String supplierId;

    @Size(max = 150)
    private String supplierName;
}
