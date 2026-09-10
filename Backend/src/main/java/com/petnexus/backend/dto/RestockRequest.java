package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for restocking / updating stock of an Inventory Item.
 * Matches Frontend inventoryApi.js: updateStock(itemId, quantityToAdd, reason)
 * POST /inventory/{itemId}/restock { quantityToAdd, reason }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestockRequest {

    @NotNull(message = "Quantity to add is required")
    private Integer quantityToAdd;

    private String reason;
}
