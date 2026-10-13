package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for purchase order creation.
 * Matches Frontend supplierApi.js createPurchaseOrder:
 * POST /suppliers/purchase-orders { supplierId, supplierName, itemsDescription, totalAmount, notes }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderRequest {

    private String supplierId;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @NotBlank(message = "Order line items are required (e.g. Rabies Vaccine (10 packs))")
    @Size(max = 1000, message = "Order line items cannot be longer than 1000 characters")
    private String itemsDescription;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Total amount " + ValidationRules.MONEY_DECIMALS_MESSAGE)
    private BigDecimal totalAmount;

    /** Optional instructions sent with the order, e.g. delivery time or cold-chain handling. */
    @Size(max = 500, message = "Order notes cannot be longer than 500 characters")
    private String notes;
}
