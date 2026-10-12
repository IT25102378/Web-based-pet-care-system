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
    @Size(max = 150, message = "Name cannot be longer than 150 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category cannot be longer than 100 characters")
    private String category;

    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU cannot be longer than 50 characters")
    private String sku;

    @Size(max = 50, message = "Batch number cannot be longer than 50 characters")
    private String batchNumber;

    @NotNull(message = "Current stock is required")
    @PositiveOrZero(message = "Current stock cannot be negative")
    private Integer currentStock;

    @NotNull(message = "Minimum stock threshold is required")
    @PositiveOrZero(message = "Minimum stock threshold cannot be negative")
    private Integer minStockThreshold;

    @NotBlank(message = "Unit is required")
    @Size(max = 50, message = "Unit cannot be longer than 50 characters")
    private String unit;

    @NotNull(message = "Unit price is required")
    @PositiveOrZero(message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    @NotNull(message = "Selling price is required")
    @PositiveOrZero(message = "Selling price cannot be negative")
    private BigDecimal sellingPrice;

    private LocalDate expiryDate;

    @Size(max = 20, message = "Supplier ID cannot be longer than 20 characters")
    private String supplierId;

    @Size(max = 150, message = "Supplier name cannot be longer than 150 characters")
    private String supplierName;
}
