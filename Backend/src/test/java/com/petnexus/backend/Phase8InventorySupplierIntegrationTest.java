package com.petnexus.backend;

import com.petnexus.backend.controller.InventoryController;
import com.petnexus.backend.controller.SupplierController;
import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.InventoryItemRepository;
import com.petnexus.backend.repository.PurchaseOrderRepository;
import com.petnexus.backend.repository.SupplierRepository;
import com.petnexus.backend.service.InventoryService;
import com.petnexus.backend.service.SupplierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Transactional
@WithMockUser(username = "admin", roles = {"Admin"})
@ActiveProfiles("test")
public class Phase8InventorySupplierIntegrationTest {

    @Autowired
    private InventoryController inventoryController;

    @Autowired
    private SupplierController supplierController;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    private Supplier testSupplier;

    @BeforeEach
    void setUp() {
        // Ensure at least one known test supplier exists in database
        testSupplier = supplierRepository.findBySupplierId("SUP-TEST")
                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                        .supplierId("SUP-TEST")
                        .companyName("Test Medical Supplies Ltd")
                        .contactPerson("Dr. Test")
                        .email("test.supplier@petnexus.com")
                        .phone("+94 11 999 8888")
                        .category("Pharmaceuticals")
                        .leadTimeDays(3)
                        .rating(new BigDecimal("4.8"))
                        .address("100 Test Avenue, Colombo")
                        .active(true)
                        .build()));
    }

    // -------------------------------------------------------------
    // 1. Create Inventory Item
    // -------------------------------------------------------------
    @Test
    @DisplayName("1. Create Inventory Item - Success")
    void testCreateInventoryItem() {
        InventoryItemRequest request = InventoryItemRequest.builder()
                .name("Amoxicillin 250mg Clavulanate")
                .category("Pharmaceuticals")
                .sku("MED-AMX-250")
                .batchNumber("BT-99901")
                .currentStock(25)
                .minStockThreshold(10)
                .unit("Bottles")
                .unitPrice(new BigDecimal("1200.00"))
                .sellingPrice(new BigDecimal("1850.00"))
                .expiryDate(LocalDate.of(2027, 8, 30))
                .supplierId(testSupplier.getSupplierId())
                .build();

        ResponseEntity<InventoryItemResponse> response = inventoryController.addInventoryItem(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        InventoryItemResponse item = response.getBody();
        assertNotNull(item.getItemId());
        assertEquals("Amoxicillin 250mg Clavulanate", item.getName());
        assertEquals("MED-AMX-250", item.getSku());
        assertEquals(25, item.getCurrentStock());
        assertEquals("InStock", item.getStatus());
        assertEquals(testSupplier.getSupplierId(), item.getSupplierId());
        assertEquals(testSupplier.getCompanyName(), item.getSupplierName());
    }

    // -------------------------------------------------------------
    // 2. Get Inventory Item
    // -------------------------------------------------------------
    @Test
    @DisplayName("2. Get Inventory Item - Success")
    void testGetInventoryItem() {
        InventoryItemRequest request = InventoryItemRequest.builder()
                .name("Cephalexin 500mg Capsules")
                .category("Pharmaceuticals")
                .sku("MED-CPH-500")
                .unit("Boxes")
                .unitPrice(new BigDecimal("2200.00"))
                .sellingPrice(new BigDecimal("3100.00"))
                .currentStock(15)
                .minStockThreshold(5)
                .build();

        InventoryItemResponse created = inventoryController.addInventoryItem(request).getBody();
        assertNotNull(created);

        ResponseEntity<InventoryItemResponse> response = inventoryController.getItemById(created.getItemId());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Cephalexin 500mg Capsules", response.getBody().getName());
    }

    // -------------------------------------------------------------
    // 3. List Inventory with Category and Status Filters
    // -------------------------------------------------------------
    @Test
    @DisplayName("3. List Inventory & Filtering - Success")
    void testListInventoryWithFiltering() {
        InventoryItemRequest item1 = InventoryItemRequest.builder()
                .name("Sterile Saline 500ml")
                .category("Fluids")
                .sku("FLD-SAL-500")
                .unit("Bags")
                .unitPrice(new BigDecimal("450.00"))
                .sellingPrice(new BigDecimal("750.00"))
                .currentStock(30)
                .minStockThreshold(10)
                .build();

        InventoryItemRequest item2 = InventoryItemRequest.builder()
                .name("Lactated Ringer Solution 1000ml")
                .category("Fluids")
                .sku("FLD-LRS-1000")
                .unit("Bags")
                .unitPrice(new BigDecimal("600.00"))
                .sellingPrice(new BigDecimal("950.00"))
                .currentStock(2)
                .minStockThreshold(5)
                .build();

        inventoryController.addInventoryItem(item1);
        inventoryController.addInventoryItem(item2);

        // Filter by category
        ResponseEntity<List<InventoryItemResponse>> fluids = inventoryController.getInventory("Fluids", null);
        assertTrue(fluids.getBody().size() >= 2);

        // Filter by status LowStock
        ResponseEntity<List<InventoryItemResponse>> lowStock = inventoryController.getInventory(null, "LowStock");
        assertTrue(lowStock.getBody().stream().anyMatch(i -> i.getSku().equals("FLD-LRS-1000")));
    }

    // -------------------------------------------------------------
    // 4. Update Inventory Item
    // -------------------------------------------------------------
    @Test
    @DisplayName("4. Update Inventory Item - Success")
    void testUpdateInventoryItem() {
        InventoryItemRequest createReq = InventoryItemRequest.builder()
                .name("Catheter 22G Pink")
                .category("Consumables")
                .sku("CON-CAT-22G")
                .unit("Pieces")
                .unitPrice(new BigDecimal("150.00"))
                .sellingPrice(new BigDecimal("280.00"))
                .currentStock(50)
                .minStockThreshold(20)
                .build();

        InventoryItemResponse created = inventoryController.addInventoryItem(createReq).getBody();
        assertNotNull(created);

        InventoryItemRequest updateReq = InventoryItemRequest.builder()
                .name("Catheter 22G Pink (Premium Shielded)")
                .unitPrice(new BigDecimal("170.00"))
                .sellingPrice(new BigDecimal("320.00"))
                .build();

        ResponseEntity<InventoryItemResponse> updateRes = inventoryController.updateInventoryItem(created.getItemId(), updateReq);
        assertEquals(HttpStatus.OK, updateRes.getStatusCode());
        assertEquals("Catheter 22G Pink (Premium Shielded)", updateRes.getBody().getName());
        assertEquals(new BigDecimal("170.00"), updateRes.getBody().getUnitPrice());
    }

    // -------------------------------------------------------------
    // 5. Delete Inventory Item
    // -------------------------------------------------------------
    @Test
    @DisplayName("5. Delete Inventory Item - Success")
    void testDeleteInventoryItem() {
        InventoryItemRequest createReq = InventoryItemRequest.builder()
                .name("Expired Syringes to Purge")
                .category("Disposables")
                .sku("DIS-SYR-TEMP")
                .unit("Boxes")
                .unitPrice(new BigDecimal("100.00"))
                .sellingPrice(new BigDecimal("150.00"))
                .currentStock(5)
                .minStockThreshold(2)
                .build();

        InventoryItemResponse created = inventoryController.addInventoryItem(createReq).getBody();
        assertNotNull(created);

        ResponseEntity<Void> deleteRes = inventoryController.deleteInventoryItem(created.getItemId());
        assertEquals(HttpStatus.NO_CONTENT, deleteRes.getStatusCode());

        assertThrows(ResourceNotFoundException.class, () -> inventoryController.getItemById(created.getItemId()));
    }

    // -------------------------------------------------------------
    // 6. Inventory Validation - Missing required fields
    // -------------------------------------------------------------
    @Test
    @DisplayName("6. Inventory Validation - Missing required fields")
    void testInventoryValidation() {
        InventoryItemRequest emptyReq = InventoryItemRequest.builder().build();
        assertThrows(BadRequestException.class, () -> inventoryController.addInventoryItem(emptyReq));

        InventoryItemRequest noSku = InventoryItemRequest.builder()
                .name("Valid Name")
                .category("Pharma")
                .unit("Bottles")
                .build();
        assertThrows(BadRequestException.class, () -> inventoryController.addInventoryItem(noSku));
    }

    // -------------------------------------------------------------
    // 7. Negative Quantity Rejection
    // -------------------------------------------------------------
    @Test
    @DisplayName("7. Negative Quantity Rejection")
    void testNegativeQuantityRejection() {
        InventoryItemRequest negStock = InventoryItemRequest.builder()
                .name("Negative Item")
                .category("Test")
                .sku("NEG-STK-001")
                .unit("Pieces")
                .currentStock(-10)
                .unitPrice(new BigDecimal("100.00"))
                .sellingPrice(new BigDecimal("150.00"))
                .build();

        assertThrows(BadRequestException.class, () -> inventoryController.addInventoryItem(negStock));
    }

    // -------------------------------------------------------------
    // 8. Negative Price Rejection
    // -------------------------------------------------------------
    @Test
    @DisplayName("8. Negative Price Rejection")
    void testNegativePriceRejection() {
        InventoryItemRequest negPrice = InventoryItemRequest.builder()
                .name("Negative Price Item")
                .category("Test")
                .sku("NEG-PRC-001")
                .unit("Pieces")
                .unitPrice(new BigDecimal("-50.00"))
                .sellingPrice(new BigDecimal("100.00"))
                .build();

        assertThrows(BadRequestException.class, () -> inventoryController.addInventoryItem(negPrice));
    }

    // -------------------------------------------------------------
    // 9. Low-Stock Calculation / Status
    // -------------------------------------------------------------
    @Test
    @DisplayName("9. Low-Stock and OutOfStock Calculation")
    void testLowStockCalculation() {
        // In Stock
        InventoryItemRequest itemInStock = InventoryItemRequest.builder()
                .name("Stocked Gauze")
                .category("Consumables")
                .sku("STK-GAU-001")
                .unit("Packs")
                .unitPrice(new BigDecimal("50.00"))
                .sellingPrice(new BigDecimal("80.00"))
                .currentStock(20)
                .minStockThreshold(5)
                .build();
        InventoryItemResponse resIn = inventoryController.addInventoryItem(itemInStock).getBody();
        assertEquals("InStock", resIn.getStatus());

        // Low Stock
        InventoryItemRequest itemLowStock = InventoryItemRequest.builder()
                .name("Low Stock Gauze")
                .category("Consumables")
                .sku("STK-GAU-002")
                .unit("Packs")
                .unitPrice(new BigDecimal("50.00"))
                .sellingPrice(new BigDecimal("80.00"))
                .currentStock(3)
                .minStockThreshold(5)
                .build();
        InventoryItemResponse resLow = inventoryController.addInventoryItem(itemLowStock).getBody();
        assertEquals("LowStock", resLow.getStatus());

        // Out of Stock
        InventoryItemRequest itemOutOfStock = InventoryItemRequest.builder()
                .name("Empty Stock Gauze")
                .category("Consumables")
                .sku("STK-GAU-003")
                .unit("Packs")
                .unitPrice(new BigDecimal("50.00"))
                .sellingPrice(new BigDecimal("80.00"))
                .currentStock(0)
                .minStockThreshold(5)
                .build();
        InventoryItemResponse resOut = inventoryController.addInventoryItem(itemOutOfStock).getBody();
        assertEquals("OutOfStock", resOut.getStatus());
    }

    // -------------------------------------------------------------
    // 10. Stock Update / Restock
    // -------------------------------------------------------------
    @Test
    @DisplayName("10. Restock Operation and Status Recalculation")
    void testRestockOperation() {
        InventoryItemRequest itemReq = InventoryItemRequest.builder()
                .name("Deworming Tablets")
                .category("Pharmaceuticals")
                .sku("MED-DEW-100")
                .unit("Tablets")
                .unitPrice(new BigDecimal("20.00"))
                .sellingPrice(new BigDecimal("40.00"))
                .currentStock(2)
                .minStockThreshold(10)
                .build();

        InventoryItemResponse created = inventoryController.addInventoryItem(itemReq).getBody();
        assertEquals("LowStock", created.getStatus());

        RestockRequest restock = RestockRequest.builder()
                .quantityToAdd(30)
                .reason("Weekly Restock shipment")
                .build();

        ResponseEntity<InventoryItemResponse> restockRes = inventoryController.updateStock(created.getItemId(), restock);
        assertEquals(HttpStatus.OK, restockRes.getStatusCode());
        assertEquals(32, restockRes.getBody().getCurrentStock());
        assertEquals("InStock", restockRes.getBody().getStatus());

        // Invalid restock that makes stock negative
        RestockRequest invalidDeduction = RestockRequest.builder()
                .quantityToAdd(-50)
                .reason("Deduction error")
                .build();
        assertThrows(BadRequestException.class, () -> inventoryController.updateStock(created.getItemId(), invalidDeduction));
    }

    // -------------------------------------------------------------
    // 11. Invalid Supplier Reference on Inventory Creation
    // -------------------------------------------------------------
    @Test
    @DisplayName("11. Invalid Supplier Reference Rejection")
    void testInvalidSupplierReference() {
        InventoryItemRequest itemReq = InventoryItemRequest.builder()
                .name("Item With Ghost Supplier")
                .category("Pharmaceuticals")
                .sku("GST-SUP-001")
                .unit("Bottles")
                .unitPrice(new BigDecimal("500.00"))
                .sellingPrice(new BigDecimal("800.00"))
                .supplierId("SUP-NON-EXISTENT")
                .build();

        assertThrows(ResourceNotFoundException.class, () -> inventoryController.addInventoryItem(itemReq));
    }

    // -------------------------------------------------------------
    // 12. Create Supplier
    // -------------------------------------------------------------
    @Test
    @DisplayName("12. Create Supplier - Success")
    void testCreateSupplier() {
        SupplierRequest request = SupplierRequest.builder()
                .companyName("Apex MedTech Sri Lanka")
                .contactPerson("Kusal Mendis")
                .email("kusal@apexmedtech.lk")
                .phone("+94 11 345 6789")
                .category("Diagnostics & Labs")
                .leadTimeDays(5)
                .rating(new BigDecimal("4.9"))
                .address("55 Dharmapala Mawatha, Colombo 03")
                .active(true)
                .build();

        ResponseEntity<SupplierResponse> response = supplierController.addSupplier(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getSupplierId());
        assertEquals("Apex MedTech Sri Lanka", response.getBody().getCompanyName());
    }

    // -------------------------------------------------------------
    // 13. Get Supplier
    // -------------------------------------------------------------
    @Test
    @DisplayName("13. Get Supplier - Success")
    void testGetSupplier() {
        ResponseEntity<SupplierResponse> response = supplierController.getSupplier(testSupplier.getSupplierId());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testSupplier.getCompanyName(), response.getBody().getCompanyName());
    }

    // -------------------------------------------------------------
    // 14. List Suppliers
    // -------------------------------------------------------------
    @Test
    @DisplayName("14. List Suppliers - Success")
    void testListSuppliers() {
        ResponseEntity<List<SupplierResponse>> response = supplierController.getSuppliers();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isEmpty());
    }

    // -------------------------------------------------------------
    // 15. Update Supplier
    // -------------------------------------------------------------
    @Test
    @DisplayName("15. Update Supplier - Success")
    void testUpdateSupplier() {
        SupplierRequest updateReq = SupplierRequest.builder()
                .contactPerson("Dr. Test Senior")
                .phone("+94 11 888 7777")
                .leadTimeDays(4)
                .build();

        ResponseEntity<SupplierResponse> response = supplierController.updateSupplier(testSupplier.getSupplierId(), updateReq);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Dr. Test Senior", response.getBody().getContactPerson());
        assertEquals(4, response.getBody().getLeadTimeDays());
    }

    // -------------------------------------------------------------
    // 16. Delete Supplier (Soft Delete)
    // -------------------------------------------------------------
    @Test
    @DisplayName("16. Delete Supplier - Soft Delete")
    void testDeleteSupplier() {
        Supplier temp = supplierRepository.save(Supplier.builder()
                .supplierId("SUP-TEMP")
                .companyName("Temporary Supplier Ltd")
                .email("temp@supplier.com")
                .active(true)
                .build());

        ResponseEntity<Void> response = supplierController.deleteSupplier(temp.getSupplierId());
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());

        Supplier refreshed = supplierRepository.findBySupplierId(temp.getSupplierId()).orElseThrow();
        assertFalse(refreshed.isActive());
    }

    // -------------------------------------------------------------
    // 17. Supplier Validation
    // -------------------------------------------------------------
    @Test
    @DisplayName("17. Supplier Validation - Missing Company Name or Email")
    void testSupplierValidation() {
        SupplierRequest noName = SupplierRequest.builder().email("info@test.com").build();
        assertThrows(BadRequestException.class, () -> supplierController.addSupplier(noName));

        SupplierRequest noEmail = SupplierRequest.builder().companyName("No Email Company").build();
        assertThrows(BadRequestException.class, () -> supplierController.addSupplier(noEmail));
    }

    // -------------------------------------------------------------
    // 18. Duplicate Supplier Handling
    // -------------------------------------------------------------
    @Test
    @DisplayName("18. Duplicate Supplier Handling")
    void testDuplicateSupplier() {
        SupplierRequest dupReq = SupplierRequest.builder()
                .companyName(testSupplier.getCompanyName())
                .email("other@test.com")
                .build();

        assertThrows(BadRequestException.class, () -> supplierController.addSupplier(dupReq));
    }

    // -------------------------------------------------------------
    // 19. Inventory ↔ Supplier Relationship & Cascade Name Update
    // -------------------------------------------------------------
    @Test
    @DisplayName("19. Supplier Name Alignment across Inventory Items")
    void testSupplierNameCascadeUpdate() {
        InventoryItemRequest itemReq = InventoryItemRequest.builder()
                .name("Vaccine Syringes 3ml")
                .category("Consumables")
                .sku("SYR-3ML-VAC")
                .unit("Boxes")
                .unitPrice(new BigDecimal("1000.00"))
                .sellingPrice(new BigDecimal("1500.00"))
                .currentStock(50)
                .minStockThreshold(10)
                .supplierId(testSupplier.getSupplierId())
                .build();

        InventoryItemResponse item = inventoryController.addInventoryItem(itemReq).getBody();
        assertNotNull(item);
        assertEquals(testSupplier.getCompanyName(), item.getSupplierName());

        // Update supplier company name
        SupplierRequest updateSup = SupplierRequest.builder()
                .companyName("Test Medical Supplies Global")
                .build();
        supplierController.updateSupplier(testSupplier.getSupplierId(), updateSup);

        // Verify inventory item reflects updated supplier name
        InventoryItemResponse refreshedItem = inventoryController.getItemById(item.getItemId()).getBody();
        assertEquals("Test Medical Supplies Global", refreshedItem.getSupplierName());
    }

    // -------------------------------------------------------------
    // 20. Low Stock Alerts Endpoint
    // -------------------------------------------------------------
    @Test
    @DisplayName("20. Low Stock Alerts Endpoint")
    void testGetLowStockAlerts() {
        InventoryItemRequest lowItem = InventoryItemRequest.builder()
                .name("Critical Antibiotic")
                .category("Pharmaceuticals")
                .sku("MED-CRT-001")
                .unit("Vials")
                .unitPrice(new BigDecimal("5000.00"))
                .sellingPrice(new BigDecimal("7500.00"))
                .currentStock(1)
                .minStockThreshold(10)
                .build();

        inventoryController.addInventoryItem(lowItem);

        ResponseEntity<List<InventoryItemResponse>> alerts = inventoryController.getLowStockAlerts();
        assertEquals(HttpStatus.OK, alerts.getStatusCode());
        assertTrue(alerts.getBody().stream().anyMatch(i -> i.getSku().equals("MED-CRT-001")));
    }

    // -------------------------------------------------------------
    // 21. Purchase Order Dispatch
    // -------------------------------------------------------------
    @Test
    @DisplayName("21. Purchase Order Dispatch - Success & Validation")
    void testPurchaseOrderDispatch() {
        PurchaseOrderRequest poRequest = PurchaseOrderRequest.builder()
                .supplierId(testSupplier.getSupplierId())
                .supplierName(testSupplier.getCompanyName())
                .itemsDescription("50x Amoxicillin, 30x Sterile Saline")
                .totalAmount(new BigDecimal("45000.00"))
                .build();

        ResponseEntity<PurchaseOrderResponse> poResponse = supplierController.createPurchaseOrder(poRequest);
        assertEquals(HttpStatus.CREATED, poResponse.getStatusCode());
        assertNotNull(poResponse.getBody());
        assertTrue(poResponse.getBody().isSuccess());
        assertTrue(poResponse.getBody().getOrderId().startsWith("PO-"));

        // Invalid PO (negative or zero amount)
        PurchaseOrderRequest invalidPo = PurchaseOrderRequest.builder()
                .supplierName("Test")
                .totalAmount(BigDecimal.ZERO)
                .build();
        assertThrows(BadRequestException.class, () -> supplierController.createPurchaseOrder(invalidPo));
    }

    // -------------------------------------------------------------
    // 22. Invalid Item and Supplier ID Handling
    // -------------------------------------------------------------
    @Test
    @DisplayName("22. Invalid Item and Supplier IDs Return 404")
    void testInvalidIds() {
        assertThrows(ResourceNotFoundException.class, () -> inventoryController.getItemById("INV-99999"));
        assertThrows(ResourceNotFoundException.class, () -> supplierController.getSupplier("SUP-99999"));
    }
}
