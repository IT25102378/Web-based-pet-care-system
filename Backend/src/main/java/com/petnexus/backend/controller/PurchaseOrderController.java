package com.petnexus.backend.controller;

import com.petnexus.backend.dto.PurchaseOrderDetailResponse;
import com.petnexus.backend.dto.PurchaseOrderRequest;
import com.petnexus.backend.dto.PurchaseOrderUpdateRequest;
import com.petnexus.backend.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Purchase Order management.
 *
 * Provides full CRUD endpoints for purchase orders.
 * Note: The existing POST /suppliers/purchase-orders endpoint in SupplierController
 * is preserved for frontend compatibility. This controller adds dedicated
 * purchase order management endpoints.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/purchase-orders")
@PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    /**
     * GET /api/purchase-orders — List all purchase orders (most recent first).
     */
    @GetMapping
    public ResponseEntity<List<PurchaseOrderDetailResponse>> listPurchaseOrders(
            @RequestParam(required = false) String supplierId) {
        if (supplierId != null && !supplierId.trim().isEmpty()) {
            return ResponseEntity.ok(purchaseOrderService.listBySupplier(supplierId));
        }
        return ResponseEntity.ok(purchaseOrderService.listPurchaseOrders());
    }

    /**
     * GET /api/purchase-orders/{orderId} — Get a specific purchase order.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<PurchaseOrderDetailResponse> getPurchaseOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrder(orderId));
    }

    /**
     * POST /api/purchase-orders — Create a new purchase order.
     */
    @PostMapping
    public ResponseEntity<PurchaseOrderDetailResponse> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/purchase-orders/{orderId} — Update a purchase order.
     */
    @PutMapping("/{orderId}")
    public ResponseEntity<PurchaseOrderDetailResponse> updatePurchaseOrder(
            @PathVariable String orderId,
            @Valid @RequestBody PurchaseOrderUpdateRequest request) {
        return ResponseEntity.ok(purchaseOrderService.updatePurchaseOrder(orderId, request));
    }

    /**
     * POST /api/purchase-orders/{orderId}/dispatch — Dispatch a purchase order.
     */
    @PostMapping("/{orderId}/dispatch")
    public ResponseEntity<PurchaseOrderDetailResponse> dispatchOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(purchaseOrderService.dispatchOrder(orderId));
    }

    /**
     * DELETE /api/purchase-orders/{orderId} — Cancel a purchase order (soft delete).
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelPurchaseOrder(@PathVariable String orderId) {
        purchaseOrderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
