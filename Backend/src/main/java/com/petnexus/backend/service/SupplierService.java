package com.petnexus.backend.service;

import com.petnexus.backend.dto.PurchaseOrderRequest;
import com.petnexus.backend.dto.PurchaseOrderResponse;
import com.petnexus.backend.dto.SupplierRequest;
import com.petnexus.backend.dto.SupplierResponse;
import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.PurchaseOrder;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.InventoryItemRepository;
import com.petnexus.backend.repository.PurchaseOrderRepository;
import com.petnexus.backend.repository.SupplierRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Supplier operations and Purchase Orders.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SupplierResponse> listSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplier(String supplierId) {
        Supplier supplier = supplierRepository.findBySupplierId(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (request.getCompanyName() == null || request.getCompanyName().trim().isEmpty()) {
            throw new BadRequestException("Company name is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email address is required");
        }
        if (supplierRepository.existsByCompanyNameIgnoreCase(request.getCompanyName().trim())) {
            throw new BadRequestException("Supplier with company name already exists: " + request.getCompanyName());
        }

        long count = supplierRepository.count() + 1;
        String supplierId = String.format("SUP-%02d", count);

        Integer leadTime = (request.getLeadTimeDays() != null && request.getLeadTimeDays() >= 0)
                ? request.getLeadTimeDays() : 2;

        BigDecimal rating = (request.getRating() != null && request.getRating().compareTo(BigDecimal.ZERO) >= 0)
                ? request.getRating().min(new BigDecimal("5.0")) : new BigDecimal("5.0");

        Supplier supplier = Supplier.builder()
                .supplierId(supplierId)
                .companyName(request.getCompanyName().trim())
                .contactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null)
                .email(request.getEmail().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .category(request.getCategory() != null ? request.getCategory().trim() : "Pharmaceuticals & Vaccines")
                .leadTimeDays(leadTime)
                .rating(rating)
                .address(request.getAddress() != null ? request.getAddress().trim() : "")
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        supplierRepository.save(supplier);
        log.info("Created supplier {} ({})", supplier.getSupplierId(), supplier.getCompanyName());
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse updateSupplier(String supplierId, SupplierRequest request) {
        Supplier supplier = supplierRepository.findBySupplierId(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));

        if (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) {
            String oldName = supplier.getCompanyName();
            String newName = request.getCompanyName().trim();
            supplier.setCompanyName(newName);

            // Keep supplierName in associated inventory items aligned if changed
            if (!newName.equalsIgnoreCase(oldName)) {
                List<InventoryItem> items = inventoryItemRepository.findAll().stream()
                        .filter(i -> supplier.equals(i.getSupplier()) || (i.getSupplierId() != null && i.getSupplierId().equals(supplierId)))
                        .collect(Collectors.toList());
                for (InventoryItem item : items) {
                    item.setSupplierName(newName);
                    inventoryItemRepository.save(item);
                }
            }
        }
        if (request.getContactPerson() != null) supplier.setContactPerson(request.getContactPerson().trim());
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) supplier.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) supplier.setPhone(request.getPhone().trim());
        if (request.getCategory() != null) supplier.setCategory(request.getCategory().trim());
        if (request.getLeadTimeDays() != null) {
            if (request.getLeadTimeDays() < 0) throw new BadRequestException("Lead time cannot be negative");
            supplier.setLeadTimeDays(request.getLeadTimeDays());
        }
        if (request.getRating() != null) {
            if (request.getRating().compareTo(BigDecimal.ZERO) < 0 || request.getRating().compareTo(new BigDecimal("5.0")) > 0) {
                throw new BadRequestException("Rating must be between 0.0 and 5.0");
            }
            supplier.setRating(request.getRating());
        }
        if (request.getAddress() != null) supplier.setAddress(request.getAddress().trim());
        if (request.getActive() != null) supplier.setActive(request.getActive());

        supplierRepository.save(supplier);
        log.info("Updated supplier {}", supplierId);
        return toResponse(supplier);
    }

    @Transactional
    public void deleteSupplier(String supplierId) {
        Supplier supplier = supplierRepository.findBySupplierId(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));
        // Soft delete by deactivating
        supplier.setActive(false);
        supplierRepository.save(supplier);
        log.info("Deactivated supplier {}", supplierId);
    }

    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request) {
        if (request.getSupplierName() == null || request.getSupplierName().trim().isEmpty()) {
            throw new BadRequestException("Supplier name is required for purchase order");
        }
        if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Purchase order total amount must be greater than zero");
        }

        String orderId = String.format("PO-%06d", System.currentTimeMillis() % 1000000);

        PurchaseOrder po = PurchaseOrder.builder()
                .orderId(orderId)
                .supplierId(request.getSupplierId())
                .supplierName(request.getSupplierName().trim())
                .itemsDescription(request.getItemsDescription())
                .totalAmount(request.getTotalAmount())
                .status("Dispatched")
                .build();

        purchaseOrderRepository.save(po);
        log.info("Dispatched purchase order {} for {} amount {}", orderId, po.getSupplierName(), po.getTotalAmount());

        // Dispatch notification to Clinic Manager
        try {
            List<User> managers = userRepository.findByRole(UserRole.ClinicManager);
            String managerUserId = !managers.isEmpty() ? managers.get(0).getUserId() : "USR-005";
            notificationService.createNotification(
                    managerUserId,
                    NotificationType.Inventory,
                    "Purchase Order Dispatched",
                    String.format("PO #%s placed with %s for $%s.", orderId.replace("PO-", ""), po.getSupplierName(), po.getTotalAmount()),
                    "/manager/inventory"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch PO notification: {}", e.getMessage());
        }

        return PurchaseOrderResponse.builder()
                .orderId(orderId)
                .success(true)
                .message("Purchase order placed successfully!")
                .build();
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .supplierId(supplier.getSupplierId())
                .companyName(supplier.getCompanyName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .category(supplier.getCategory())
                .leadTimeDays(supplier.getLeadTimeDays())
                .rating(supplier.getRating())
                .address(supplier.getAddress())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
