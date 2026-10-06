package com.petnexus.backend;

import com.petnexus.backend.controller.PurchaseOrderController;
import com.petnexus.backend.controller.SupplierController;
import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.PurchaseOrder;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.PurchaseOrderRepository;
import com.petnexus.backend.repository.SupplierRepository;
import com.petnexus.backend.service.PurchaseOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for Phase 10A.6 — Purchase Order Management.
 */
@SpringBootTest

@Transactional
@ActiveProfiles("test")
@WithMockUser(username = "admin", roles = {"Admin"})
public class Phase10A6PurchaseOrderIntegrationTest {

    @Autowired
    private PurchaseOrderController purchaseOrderController;

    @Autowired
    private SupplierController supplierController;

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    private Supplier testSupplier;

    @BeforeEach
    void setUp() {
        // Ensure a known test supplier exists
        testSupplier = supplierRepository.findBySupplierId("SUP-PO-TEST")
                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                        .supplierId("SUP-PO-TEST")
                        .companyName("PO Test Supplies Inc")
                        .contactPerson("Jane PO Tester")
                        .email("po.test@petnexus.com")
                        .phone("+94 11 777 6666")
                        .category("Medical Supplies")
                        .leadTimeDays(3)
                        .rating(new BigDecimal("4.5"))
                        .address("200 Test Blvd, Colombo")
                        .active(true)
                        .build()));
    }

    // =========================================================================
    // 1. Create Purchase Order
    // =========================================================================

    @Test
    @DisplayName("1. Create purchase order — success")
    void testCreatePurchaseOrder_Success() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .itemsDescription("Vaccine vials x50, Syringes x200")
                .totalAmount(new BigDecimal("1500.00"))
                .build();

        ResponseEntity<PurchaseOrderDetailResponse> response =
                purchaseOrderController.createPurchaseOrder(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        PurchaseOrderDetailResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.getOrderId());
        assertTrue(body.getOrderId().startsWith("PO-"));
        assertEquals(testSupplier.getSupplierId(), body.getSupplierId());
        assertEquals(testSupplier.getCompanyName(), body.getSupplierName());
        assertEquals("Dispatched", body.getStatus());
        assertEquals(0, new BigDecimal("1500.00").compareTo(body.getTotalAmount()));
        assertNotNull(body.getCreatedAt());
    }

    // =========================================================================
    // 2. Retrieve Purchase Order by ID
    // =========================================================================

    @Test
    @DisplayName("2. Get purchase order by ID — success")
    void testGetPurchaseOrderById_Success() {
        // Create one first
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("500.00"))
                        .build());

        ResponseEntity<PurchaseOrderDetailResponse> response =
                purchaseOrderController.getPurchaseOrder(created.getOrderId());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        PurchaseOrderDetailResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(created.getOrderId(), body.getOrderId());
        assertEquals(testSupplier.getCompanyName(), body.getSupplierName());
    }

    @Test
    @DisplayName("2b. Get purchase order — not found")
    void testGetPurchaseOrder_NotFound() {
        assertThrows(ResourceNotFoundException.class, () ->
                purchaseOrderController.getPurchaseOrder("PO-NONEXISTENT"));
    }

    // =========================================================================
    // 3. List Purchase Orders
    // =========================================================================

    @Test
    @DisplayName("3. List purchase orders")
    void testListPurchaseOrders() {
        // Create two orders
        purchaseOrderService.createPurchaseOrder(PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .totalAmount(new BigDecimal("100.00"))
                .build());
        purchaseOrderService.createPurchaseOrder(PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .totalAmount(new BigDecimal("200.00"))
                .build());

        ResponseEntity<List<PurchaseOrderDetailResponse>> response =
                purchaseOrderController.listPurchaseOrders(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<PurchaseOrderDetailResponse> list = response.getBody();
        assertNotNull(list);
        assertTrue(list.size() >= 2);
    }

    // =========================================================================
    // 4. Update Purchase Order
    // =========================================================================

    @Test
    @DisplayName("4. Update purchase order — success")
    void testUpdatePurchaseOrder_Success() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("300.00"))
                        .build());

        PurchaseOrderUpdateRequest updateRequest = PurchaseOrderUpdateRequest.builder()
                .itemsDescription("Updated: Bandages x100")
                .totalAmount(new BigDecimal("450.00"))
                .notes("Urgent order")
                .build();

        ResponseEntity<PurchaseOrderDetailResponse> response =
                purchaseOrderController.updatePurchaseOrder(created.getOrderId(), updateRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        PurchaseOrderDetailResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("Updated: Bandages x100", body.getItemsDescription());
        assertEquals(0, new BigDecimal("450.00").compareTo(body.getTotalAmount()));
        assertEquals("Urgent order", body.getNotes());
    }

    // =========================================================================
    // 5. Invalid Supplier Rejected
    // =========================================================================

    @Test
    @DisplayName("5. Create PO with invalid supplier ID — rejected")
    void testCreatePurchaseOrder_InvalidSupplier() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .supplierId("SUP-FAKE-999")
                .supplierName("Fake Supplier")
                .totalAmount(new BigDecimal("100.00"))
                .build();

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.createPurchaseOrder(request));
    }

    // =========================================================================
    // 6. Invalid Quantity / Price Rejected
    // =========================================================================

    @Test
    @DisplayName("6a. Create PO with zero amount — rejected")
    void testCreatePurchaseOrder_ZeroAmount() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .totalAmount(BigDecimal.ZERO)
                .build();

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.createPurchaseOrder(request));
    }

    @Test
    @DisplayName("6b. Create PO with negative amount — rejected")
    void testCreatePurchaseOrder_NegativeAmount() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .totalAmount(new BigDecimal("-50.00"))
                .build();

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.createPurchaseOrder(request));
    }

    @Test
    @DisplayName("6c. Update PO with invalid amount — rejected")
    void testUpdatePurchaseOrder_InvalidAmount() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        PurchaseOrderUpdateRequest updateRequest = PurchaseOrderUpdateRequest.builder()
                .totalAmount(new BigDecimal("-10.00"))
                .build();

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.updatePurchaseOrder(created.getOrderId(), updateRequest));
    }

    // =========================================================================
    // 7. Missing Supplier Name Rejected
    // =========================================================================

    @Test
    @DisplayName("7. Create PO without supplier name — rejected")
    void testCreatePurchaseOrder_MissingSupplierName() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .totalAmount(new BigDecimal("100.00"))
                .build();

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.createPurchaseOrder(request));
    }

    // =========================================================================
    // 8. Dispatch / Status Transition
    // =========================================================================

    @Test
    @DisplayName("8a. Dispatch order — already dispatched is idempotent")
    void testDispatchOrder_AlreadyDispatched() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        // Default status is "Dispatched", dispatching again should be idempotent
        ResponseEntity<PurchaseOrderDetailResponse> response =
                purchaseOrderController.dispatchOrder(created.getOrderId());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Dispatched", response.getBody().getStatus());
    }

    @Test
    @DisplayName("8b. Status transition — Dispatched → Shipped → Delivered")
    void testStatusTransition_DispatchedToDelivered() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        // Dispatched → Shipped
        PurchaseOrderDetailResponse shipped = purchaseOrderService.updatePurchaseOrder(
                created.getOrderId(),
                PurchaseOrderUpdateRequest.builder().status("Shipped").build());
        assertEquals("Shipped", shipped.getStatus());

        // Shipped → Delivered
        PurchaseOrderDetailResponse delivered = purchaseOrderService.updatePurchaseOrder(
                created.getOrderId(),
                PurchaseOrderUpdateRequest.builder().status("Delivered").build());
        assertEquals("Delivered", delivered.getStatus());
    }

    @Test
    @DisplayName("8c. Invalid status transition — rejected")
    void testInvalidStatusTransition() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        // Dispatched → Delivered (skipping Shipped) should fail
        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.updatePurchaseOrder(
                        created.getOrderId(),
                        PurchaseOrderUpdateRequest.builder().status("Delivered").build()));
    }

    // =========================================================================
    // 9. Cancel Purchase Order
    // =========================================================================

    @Test
    @DisplayName("9a. Cancel purchase order — success")
    void testCancelPurchaseOrder_Success() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        ResponseEntity<Void> response = purchaseOrderController.cancelPurchaseOrder(created.getOrderId());
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

        // Verify status changed
        PurchaseOrderDetailResponse cancelled = purchaseOrderService.getPurchaseOrder(created.getOrderId());
        assertEquals("Cancelled", cancelled.getStatus());
    }

    @Test
    @DisplayName("9b. Cannot cancel delivered order")
    void testCancelDeliveredOrder_Rejected() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        // Advance to Delivered
        purchaseOrderService.updatePurchaseOrder(created.getOrderId(),
                PurchaseOrderUpdateRequest.builder().status("Shipped").build());
        purchaseOrderService.updatePurchaseOrder(created.getOrderId(),
                PurchaseOrderUpdateRequest.builder().status("Delivered").build());

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.cancelOrder(created.getOrderId()));
    }

    // =========================================================================
    // 10. Persistence / Data Integrity
    // =========================================================================

    @Test
    @DisplayName("10. Purchase order persists in database")
    void testPurchaseOrderPersistence() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .itemsDescription("Persistence test items")
                        .totalAmount(new BigDecimal("999.99"))
                        .build());

        // Verify directly via repository
        PurchaseOrder fromDb = purchaseOrderRepository.findByOrderId(created.getOrderId())
                .orElseThrow();
        assertEquals(testSupplier.getSupplierId(), fromDb.getSupplierId());
        assertEquals(testSupplier.getCompanyName(), fromDb.getSupplierName());
        assertEquals("Persistence test items", fromDb.getItemsDescription());
        assertEquals(0, new BigDecimal("999.99").compareTo(fromDb.getTotalAmount()));
        assertNotNull(fromDb.getCreatedAt());
    }

    // =========================================================================
    // 11. Frontend Compatibility — POST /suppliers/purchase-orders still works
    // =========================================================================

    @Test
    @DisplayName("11. Frontend POST /suppliers/purchase-orders — still works")
    void testFrontendCreatePO_StillWorks() {
        PurchaseOrderRequest request = PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .itemsDescription("Frontend compat test")
                .totalAmount(new BigDecimal("250.00"))
                .build();

        ResponseEntity<PurchaseOrderResponse> response =
                supplierController.createPurchaseOrder(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        PurchaseOrderResponse body = response.getBody();
        assertNotNull(body);
        assertTrue(body.isSuccess());
        assertNotNull(body.getOrderId());
        assertTrue(body.getOrderId().startsWith("PO-"));
    }

    // =========================================================================
    // 12. Cannot update terminal-state orders
    // =========================================================================

    @Test
    @DisplayName("12. Cannot update cancelled order")
    void testUpdateCancelledOrder_Rejected() {
        PurchaseOrderDetailResponse created = purchaseOrderService.createPurchaseOrder(
                PurchaseOrderRequest.builder()
                        .supplierId(testSupplier.getSupplierId())
                        .supplierName(testSupplier.getCompanyName())
                        .totalAmount(new BigDecimal("100.00"))
                        .build());

        purchaseOrderService.cancelOrder(created.getOrderId());

        assertThrows(BadRequestException.class, () ->
                purchaseOrderService.updatePurchaseOrder(
                        created.getOrderId(),
                        PurchaseOrderUpdateRequest.builder().notes("Should fail").build()));
    }
}
