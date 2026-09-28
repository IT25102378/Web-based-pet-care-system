package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for purchase order dispatch.
 * Matches Frontend supplierApi.js return object: { orderId, success, message }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponse {
    private String orderId;
    private boolean success;
    private String message;
}
