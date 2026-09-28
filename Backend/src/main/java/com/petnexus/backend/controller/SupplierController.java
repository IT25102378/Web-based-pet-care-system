package com.petnexus.backend.controller;

import com.petnexus.backend.dto.PurchaseOrderRequest;
import com.petnexus.backend.dto.PurchaseOrderResponse;
import com.petnexus.backend.dto.SupplierRequest;
import com.petnexus.backend.dto.SupplierResponse;
import com.petnexus.backend.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Suppliers.
 * Exactly matches Frontend/src/api/supplierApi.js contract.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin', 'ClinicStaff', 'Veterinarian')")
    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getSuppliers() {
        return ResponseEntity.ok(supplierService.listSuppliers());
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin', 'ClinicStaff', 'Veterinarian')")
    @GetMapping("/{supplierId}")
    public ResponseEntity<SupplierResponse> getSupplier(@PathVariable String supplierId) {
        return ResponseEntity.ok(supplierService.getSupplier(supplierId));
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
    @PostMapping
    public ResponseEntity<SupplierResponse> addSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse created = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
    @PutMapping("/{supplierId}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable String supplierId,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(supplierId, request));
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
    @DeleteMapping("/{supplierId}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String supplierId) {
        supplierService.deleteSupplier(supplierId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
    @PostMapping("/purchase-orders")
    public ResponseEntity<PurchaseOrderResponse> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = supplierService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
