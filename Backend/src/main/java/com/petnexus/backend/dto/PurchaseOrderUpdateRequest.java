package com.petnexus.backend.dto;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for updating a purchase order.
 * Only mutable fields are exposed — orderId and createdAt are immutable.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderUpdateRequest {

    private String itemsDescription;

    @Positive(message = "Total amount must be greater than zero")
    private BigDecimal totalAmount;

    private String status;

    private String notes;
}
