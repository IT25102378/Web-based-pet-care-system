package com.petnexus.backend.dto;

import com.petnexus.backend.entity.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Detailed response DTO for purchase order retrieval (list / get-by-id).
 * Exposes all order fields without leaking internal entity details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDetailResponse {

    private String orderId;
    private String supplierId;
    private String supplierName;
    private String itemsDescription;
    private BigDecimal totalAmount;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Factory method — converts a PurchaseOrder entity to a detail response DTO.
     */
    public static PurchaseOrderDetailResponse from(PurchaseOrder po) {
        return PurchaseOrderDetailResponse.builder()
                .orderId(po.getOrderId())
                .supplierId(po.getSupplierId())
                .supplierName(po.getSupplierName())
                .itemsDescription(po.getItemsDescription())
                .totalAmount(po.getTotalAmount())
                .status(po.getStatus())
                .notes(po.getNotes())
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }
}
