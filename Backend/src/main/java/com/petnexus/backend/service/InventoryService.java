package com.petnexus.backend.service;

import com.petnexus.backend.dto.InventoryItemRequest;
import com.petnexus.backend.dto.InventoryItemResponse;
import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.InventoryItemRepository;
import com.petnexus.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for clinical pharmacy inventory and stock tracking.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> listInventory(String category, String status) {
        List<InventoryItem> items = inventoryItemRepository.findAll();
        return items.stream()
                .filter(i -> category == null || category.isBlank() || category.equalsIgnoreCase(i.getCategory()))
                .filter(i -> status == null || status.isBlank() || status.equalsIgnoreCase(i.getStatus().name())
                        || (i.getStatus().getJsonValue() != null && i.getStatus().getJsonValue().equalsIgnoreCase(status)))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventoryItemResponse getItem(String itemId) {
        InventoryItem item = inventoryItemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + itemId));
        return toResponse(item);
    }

    @Transactional
    public InventoryItemResponse addInventoryItem(InventoryItemRequest request) {
        validateItemRequest(request);

        if (inventoryItemRepository.existsBySku(request.getSku().trim())) {
            throw new BadRequestException("Inventory item with SKU already exists: " + request.getSku());
        }

        Supplier supplier = null;
        String supplierName = request.getSupplierName();
        if (request.getSupplierId() != null && !request.getSupplierId().isBlank()) {
            supplier = supplierRepository.findBySupplierId(request.getSupplierId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
            supplierName = supplier.getCompanyName();
        }

        long count = inventoryItemRepository.count() + 1;
        String itemId = String.format("INV-%03d", 100 + count);

        int currentStock = request.getCurrentStock() != null ? request.getCurrentStock() : 0;
        int minThreshold = request.getMinStockThreshold() != null ? request.getMinStockThreshold() : 5;
        StockStatus status = calculateStatus(currentStock, minThreshold);

        InventoryItem item = InventoryItem.builder()
                .itemId(itemId)
                .name(request.getName().trim())
                .category(request.getCategory().trim())
                .sku(request.getSku().trim())
                .batchNumber(request.getBatchNumber() != null ? request.getBatchNumber().trim() : null)
                .currentStock(currentStock)
                .minStockThreshold(minThreshold)
                .unit(request.getUnit().trim())
                .unitPrice(request.getUnitPrice())
                .sellingPrice(request.getSellingPrice())
                .expiryDate(request.getExpiryDate())
                .supplier(supplier)
                .supplierName(supplierName)
                .status(status)
                .build();

        inventoryItemRepository.save(item);
        log.info("Added inventory item {} ({}) - Stock: {}, Status: {}", item.getItemId(), item.getName(), currentStock, status);
        return toResponse(item);
    }

    @Transactional
    public InventoryItemResponse updateInventoryItem(String itemId, InventoryItemRequest request) {
        InventoryItem item = inventoryItemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + itemId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            item.setName(request.getName().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            item.setCategory(request.getCategory().trim());
        }
        if (request.getSku() != null && !request.getSku().trim().equalsIgnoreCase(item.getSku())) {
            if (inventoryItemRepository.existsBySku(request.getSku().trim())) {
                throw new BadRequestException("SKU already in use: " + request.getSku());
            }
            item.setSku(request.getSku().trim());
        }
        if (request.getBatchNumber() != null) item.setBatchNumber(request.getBatchNumber().trim());
        if (request.getUnit() != null) item.setUnit(request.getUnit().trim());
        if (request.getUnitPrice() != null) {
            if (request.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Unit price cannot be negative");
            }
            item.setUnitPrice(request.getUnitPrice());
        }
        if (request.getSellingPrice() != null) {
            if (request.getSellingPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Selling price cannot be negative");
            }
            item.setSellingPrice(request.getSellingPrice());
        }
        if (request.getExpiryDate() != null) item.setExpiryDate(request.getExpiryDate());

        if (request.getCurrentStock() != null) {
            if (request.getCurrentStock() < 0) throw new BadRequestException("Current stock cannot be negative");
            item.setCurrentStock(request.getCurrentStock());
        }
        if (request.getMinStockThreshold() != null) {
            if (request.getMinStockThreshold() < 0) throw new BadRequestException("Min stock threshold cannot be negative");
            item.setMinStockThreshold(request.getMinStockThreshold());
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findBySupplierId(request.getSupplierId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
            item.setSupplier(supplier);
            item.setSupplierName(supplier.getCompanyName());
        } else if (request.getSupplierName() != null) {
            item.setSupplierName(request.getSupplierName().trim());
        }

        item.setStatus(calculateStatus(item.getCurrentStock(), item.getMinStockThreshold()));
        inventoryItemRepository.save(item);
        log.info("Updated inventory item {}", itemId);
        return toResponse(item);
    }

    @Transactional
    public InventoryItemResponse updateStock(String itemId, Integer quantityToAdd, String reason) {
        if (quantityToAdd == null || quantityToAdd == 0) {
            throw new BadRequestException("Quantity to add must be non-zero");
        }
        InventoryItem item = inventoryItemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + itemId));

        int newStock = item.getCurrentStock() + quantityToAdd;
        if (newStock < 0) {
            throw new BadRequestException(String.format(
                    "Insufficient stock for item %s. Current: %d, Requested change: %d",
                    itemId, item.getCurrentStock(), quantityToAdd));
        }

        item.setCurrentStock(newStock);
        item.setStatus(calculateStatus(newStock, item.getMinStockThreshold()));
        inventoryItemRepository.save(item);

        log.info("Restocked item {} by {} (New stock: {}). Reason: {}", itemId, quantityToAdd, newStock, reason);
        return toResponse(item);
    }

    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getLowStockAlerts() {
        return inventoryItemRepository.findLowStockItems().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteInventoryItem(String itemId) {
        InventoryItem item = inventoryItemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with ID: " + itemId));
        inventoryItemRepository.delete(item);
        log.info("Deleted inventory item {}", itemId);
    }

    private void validateItemRequest(InventoryItemRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new BadRequestException("Item name is required");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new BadRequestException("Category is required");
        }
        if (request.getSku() == null || request.getSku().trim().isEmpty()) {
            throw new BadRequestException("SKU is required");
        }
        if (request.getUnit() == null || request.getUnit().trim().isEmpty()) {
            throw new BadRequestException("Unit is required");
        }
        if (request.getCurrentStock() != null && request.getCurrentStock() < 0) {
            throw new BadRequestException("Current stock cannot be negative");
        }
        if (request.getMinStockThreshold() != null && request.getMinStockThreshold() < 0) {
            throw new BadRequestException("Min stock threshold cannot be negative");
        }
        if (request.getUnitPrice() != null && request.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Unit price cannot be negative");
        }
        if (request.getSellingPrice() != null && request.getSellingPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Selling price cannot be negative");
        }
    }

    private StockStatus calculateStatus(int currentStock, int minThreshold) {
        if (currentStock == 0) return StockStatus.OUT_OF_STOCK;
        if (currentStock <= minThreshold) return StockStatus.LOW_STOCK;
        return StockStatus.IN_STOCK;
    }

    private InventoryItemResponse toResponse(InventoryItem item) {
        return InventoryItemResponse.builder()
                .itemId(item.getItemId())
                .name(item.getName())
                .category(item.getCategory())
                .sku(item.getSku())
                .batchNumber(item.getBatchNumber())
                .currentStock(item.getCurrentStock())
                .minStockThreshold(item.getMinStockThreshold())
                .unit(item.getUnit())
                .unitPrice(item.getUnitPrice())
                .sellingPrice(item.getSellingPrice())
                .expiryDate(item.getExpiryDate())
                .supplierId(item.getSupplierId())
                .supplierName(item.getSupplierName())
                .status(item.getStatus().getJsonValue())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
