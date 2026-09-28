package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for purchase order creation.
 * Matches Frontend supplierApi.js createPurchaseOrder:
 * POST /suppliers/purchase-orders { supplierId, supplierName, itemsDescription, totalAmount }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderRequest {

    private String supplierId;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    private String itemsDescription;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be greater than zero")
    private BigDecimal totalAmount;
}
