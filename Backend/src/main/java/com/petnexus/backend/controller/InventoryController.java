package com.petnexus.backend.controller;

import com.petnexus.backend.dto.InventoryItemRequest;
import com.petnexus.backend.dto.InventoryItemResponse;
import com.petnexus.backend.dto.RestockRequest;
import com.petnexus.backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Inventory and Stock Management.
 * Exactly matches Frontend/src/api/inventoryApi.js contract.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin', 'ClinicStaff', 'Veterinarian')")
    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> getInventory(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(inventoryService.listInventory(category, status));
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin', 'ClinicStaff', 'Veterinarian')")
    @GetMapping("/low-stock-alerts")
    public ResponseEntity<List<InventoryItemResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin', 'ClinicStaff', 'Veterinarian')")
    @GetMapping("/{itemId}")
    public ResponseEntity<InventoryItemResponse> getItemById(@PathVariable String itemId) {
        return ResponseEntity.ok(inventoryService.getItem(itemId));
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
    @PostMapping
    public ResponseEntity<InventoryItemResponse> addInventoryItem(
            @Valid @RequestBody InventoryItemRequest request) {
        InventoryItemResponse created = inventoryService.addInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ClinicManager', 'Admin')")
    @PutMapping("/{itemId}")
    public ResponseEntity<InventoryItemResponse> updateInventoryItem(
            @PathVariable String itemId,
            @Valid @RequestBody InventoryItemRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventoryItem(itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable String itemId) {
        inventoryService.deleteInventoryItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/restock")
    public ResponseEntity<InventoryItemResponse> updateStock(
            @PathVariable String itemId,
            @Valid @RequestBody RestockRequest request) {
        InventoryItemResponse updated = inventoryService.updateStock(
                itemId, request.getQuantityToAdd(), request.getReason());
        return ResponseEntity.ok(updated);
    }
}
