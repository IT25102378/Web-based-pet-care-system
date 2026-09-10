package com.petnexus.backend.service;

import com.petnexus.backend.dto.PurchaseOrderDetailResponse;
import com.petnexus.backend.dto.PurchaseOrderRequest;
import com.petnexus.backend.dto.PurchaseOrderResponse;
import com.petnexus.backend.dto.PurchaseOrderUpdateRequest;
import com.petnexus.backend.entity.PurchaseOrder;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.PurchaseOrderRepository;
import com.petnexus.backend.repository.SupplierRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service layer for Purchase Order lifecycle management.
 *
 * The existing SupplierService.createPurchaseOrder() handles the frontend
 * contract (POST /suppliers/purchase-orders). This service provides the
 * additional CRUD operations needed for full purchase order management:
 * list, get-by-id, update, status transitions, and validation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /** Valid PO status values */
    private static final Set<String> VALID_STATUSES = Set.of(
            "Pending", "Approved", "Dispatched", "Shipped", "Delivered", "Cancelled"
    );

    /** Valid status transitions */
    private static final java.util.Map<String, Set<String>> STATUS_TRANSITIONS = java.util.Map.of(
            "Pending",    Set.of("Approved", "Cancelled"),
            "Approved",   Set.of("Dispatched", "Cancelled"),
            "Dispatched", Set.of("Shipped", "Cancelled"),
            "Shipped",    Set.of("Delivered"),
            "Delivered",  Set.of(),
            "Cancelled",  Set.of()
    );

    // =========================================================================
    // List / Retrieve
    // =========================================================================

    /**
     * List all purchase orders, most recent first.
     */
    @Transactional(readOnly = true)
    public List<PurchaseOrderDetailResponse> listPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PurchaseOrderDetailResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * List purchase orders filtered by supplier ID.
     */
    @Transactional(readOnly = true)
    public List<PurchaseOrderDetailResponse> listBySupplier(String supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId).stream()
                .map(PurchaseOrderDetailResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get a single purchase order by its business ID (e.g. PO-123456).
     */
    @Transactional(readOnly = true)
    public PurchaseOrderDetailResponse getPurchaseOrder(String orderId) {
        PurchaseOrder po = purchaseOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + orderId));
        return PurchaseOrderDetailResponse.from(po);
    }

    // =========================================================================
    // Create
    // =========================================================================

    /**
     * Create a new purchase order with full validation.
     * Validates supplier existence if supplierId is provided.
     */
    @Transactional
    public PurchaseOrderDetailResponse createPurchaseOrder(PurchaseOrderRequest request) {
        // Validate supplier name
        if (request.getSupplierName() == null || request.getSupplierName().trim().isEmpty()) {
            throw new BadRequestException("Supplier name is required for purchase order");
        }

        // Validate total amount
        if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Purchase order total amount must be greater than zero");
        }

        // Validate supplier exists if supplierId is provided
        if (request.getSupplierId() != null && !request.getSupplierId().trim().isEmpty()) {
            if (!supplierRepository.existsBySupplierId(request.getSupplierId().trim())) {
                throw new BadRequestException("Supplier not found with ID: " + request.getSupplierId());
            }
        }

        // Generate unique order ID
        String orderId = generateOrderId();

        PurchaseOrder po = PurchaseOrder.builder()
                .orderId(orderId)
                .supplierId(request.getSupplierId() != null ? request.getSupplierId().trim() : null)
                .supplierName(request.getSupplierName().trim())
                .itemsDescription(request.getItemsDescription())
                .totalAmount(request.getTotalAmount())
                .status("Dispatched")
                .build();

        purchaseOrderRepository.save(po);
        log.info("Created purchase order {} for supplier {} (amount={})",
                orderId, po.getSupplierName(), po.getTotalAmount());

        // Notify Clinic Manager
        notifyManager(po, "Purchase Order Created",
                String.format("PO #%s placed with %s for $%s.",
                        orderId.replace("PO-", ""), po.getSupplierName(), po.getTotalAmount()));

        return PurchaseOrderDetailResponse.from(po);
    }

    // =========================================================================
    // Update
    // =========================================================================

    /**
     * Update a purchase order's mutable fields.
     * Cannot update if order is Delivered or Cancelled.
     */
    @Transactional
    public PurchaseOrderDetailResponse updatePurchaseOrder(String orderId, PurchaseOrderUpdateRequest request) {
        PurchaseOrder po = purchaseOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + orderId));

        // Cannot update terminal-state orders
        if ("Delivered".equals(po.getStatus()) || "Cancelled".equals(po.getStatus())) {
            throw new BadRequestException(
                    "Cannot update purchase order in " + po.getStatus() + " status");
        }

        if (request.getItemsDescription() != null) {
            po.setItemsDescription(request.getItemsDescription());
        }
        if (request.getTotalAmount() != null) {
            if (request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Total amount must be greater than zero");
            }
            po.setTotalAmount(request.getTotalAmount());
        }
        if (request.getNotes() != null) {
            po.setNotes(request.getNotes());
        }
        if (request.getStatus() != null) {
            validateStatusTransition(po.getStatus(), request.getStatus());
            po.setStatus(request.getStatus());
        }

        purchaseOrderRepository.save(po);
        log.info("Updated purchase order {}", orderId);
        return PurchaseOrderDetailResponse.from(po);
    }

    // =========================================================================
    // Status Transitions
    // =========================================================================

    /**
     * Dispatch a purchase order — transition status to "Dispatched".
     * Valid only from "Pending" or "Approved" status.
     */
    @Transactional
    public PurchaseOrderDetailResponse dispatchOrder(String orderId) {
        PurchaseOrder po = purchaseOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + orderId));

        String currentStatus = po.getStatus();
        if ("Dispatched".equals(currentStatus)) {
            // Already dispatched — idempotent
            return PurchaseOrderDetailResponse.from(po);
        }

        validateStatusTransition(currentStatus, "Dispatched");
        po.setStatus("Dispatched");
        purchaseOrderRepository.save(po);

        log.info("Purchase order {} dispatched", orderId);

        notifyManager(po, "Purchase Order Dispatched",
                String.format("PO #%s dispatched to %s.",
                        orderId.replace("PO-", ""), po.getSupplierName()));

        return PurchaseOrderDetailResponse.from(po);
    }

    // =========================================================================
    // Delete (soft — cancel)
    // =========================================================================

    /**
     * Cancel a purchase order. Only non-terminal orders can be cancelled.
     */
    @Transactional
    public void cancelOrder(String orderId) {
        PurchaseOrder po = purchaseOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + orderId));

        if ("Delivered".equals(po.getStatus()) || "Cancelled".equals(po.getStatus())) {
            throw new BadRequestException(
                    "Cannot cancel purchase order in " + po.getStatus() + " status");
        }

        po.setStatus("Cancelled");
        purchaseOrderRepository.save(po);
        log.info("Purchase order {} cancelled", orderId);
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    private String generateOrderId() {
        long count = purchaseOrderRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PO-%06d", count++);
        } while (purchaseOrderRepository.existsByOrderId(candidate));
        return candidate;
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BadRequestException(
                    "Invalid purchase order status: " + newStatus +
                    ". Valid values: " + VALID_STATUSES);
        }
        Set<String> allowed = STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(
                    "Cannot transition purchase order from " + currentStatus + " to " + newStatus +
                    ". Allowed transitions: " + allowed);
        }
    }

    private void notifyManager(PurchaseOrder po, String title, String message) {
        try {
            List<User> managers = userRepository.findByRole(UserRole.ClinicManager);
            String managerUserId = !managers.isEmpty() ? managers.get(0).getUserId() : "USR-005";
            notificationService.createNotification(
                    managerUserId,
                    NotificationType.Inventory,
                    title,
                    message,
                    "/manager/inventory"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch PO notification: {}", e.getMessage());
        }
    }
}
