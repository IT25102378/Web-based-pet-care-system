package com.petnexus.backend.dto;

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
 * Request DTO for updating a purchase order.
 * Only mutable fields are exposed — orderId and createdAt are immutable.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderUpdateRequest {

    @Size(max = 1000, message = "Order line items cannot be longer than 1000 characters")
    private String itemsDescription;

    @Positive(message = "Total amount must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Total amount " + ValidationRules.MONEY_DECIMALS_MESSAGE)
    private BigDecimal totalAmount;

    private String status;

    @Size(max = 500, message = "Order notes cannot be longer than 500 characters")
    private String notes;
}
