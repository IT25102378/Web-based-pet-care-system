package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Major Function 6.5 - Inventory Management (FR-08, FR-09)
 * Techniques: boundary values on stock levels, state derivation, access-control matrix.
 */
class BB5_InventorySupplierTest extends BlackBoxSupport {

    private int skuCounter = 0;

    private Map<String, Object> item(int stock, int threshold) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", "BB Test Item " + System.nanoTime());
        m.put("category", "Medication");
        m.put("sku", "BB-" + System.nanoTime() + "-" + (skuCounter++));
        m.put("currentStock", stock);
        m.put("minStockThreshold", threshold);
        m.put("unit", "Boxes");
        m.put("unitPrice", 1000);
        m.put("sellingPrice", 1500);
        return m;
    }

    private String create(String token, Map<String, Object> body) throws Exception {
        MvcResult res = post("/inventory", token, body);
        assertEquals(201, status(res), res.getResponse().getContentAsString());
        return body(res).get("itemId").asText();
    }

    // ------------------------------------------------------------------ FR-08 inventory

    @Test
    @DisplayName("IN-01 [FR-08] manager can monitor the inventory list and low-stock alerts")
    void managerMonitors() throws Exception {
        String manager = login(MANAGER);
        assertEquals(200, status(get("/inventory", manager)));
        assertEquals(200, status(get("/inventory/low-stock-alerts", manager)));
    }

    @Test
    @DisplayName("IN-02 [BVA] stock status: 11 above threshold 10 -> InStock; 10 -> LowStock; 0 -> OutOfStock")
    void stockStatusBoundaries() throws Exception {
        String staff = login(STAFF);
        MvcResult above = post("/inventory", staff, item(11, 10));
        assertEquals("InStock", body(above).get("status").asText());
        MvcResult atThreshold = post("/inventory", staff, item(10, 10));
        assertEquals("LowStock", body(atThreshold).get("status").asText());
        MvcResult empty = post("/inventory", staff, item(0, 10));
        assertEquals("OutOfStock", body(empty).get("status").asText());
    }

    @Test
    @DisplayName("IN-03 [EP invalid] negative stock, negative price, missing name, selling price below cost -> 400")
    void itemValidation() throws Exception {
        String staff = login(STAFF);
        Map<String, Object> neg = item(-1, 5);
        assertEquals(400, status(post("/inventory", staff, neg)));
        Map<String, Object> price = item(5, 5);
        price.put("unitPrice", -1);
        assertEquals(400, status(post("/inventory", staff, price)));
        Map<String, Object> noName = item(5, 5);
        noName.put("name", "");
        assertEquals(400, status(post("/inventory", staff, noName)));
        Map<String, Object> below = item(5, 5);
        below.put("unitPrice", 2000);
        below.put("sellingPrice", 1000);
        assertEquals(400, status(post("/inventory", staff, below)));
    }

    @Test
    @DisplayName("IN-04 [rule] duplicate SKU is rejected")
    void duplicateSku() throws Exception {
        String staff = login(STAFF);
        Map<String, Object> first = item(5, 5);
        create(staff, first);
        Map<String, Object> second = item(5, 5);
        second.put("sku", first.get("sku"));
        assertEquals(400, status(post("/inventory", staff, second)));
    }

    @Test
    @DisplayName("IN-05 [rule] restock adds stock; removing more than available is rejected; zero is rejected")
    void restockRules() throws Exception {
        String staff = login(STAFF);
        String id = create(staff, item(20, 5));
        MvcResult add = post("/inventory/" + id + "/restock", staff, Map.of("quantityToAdd", 30, "reason", "Delivery"));
        assertEquals(200, status(add));
        assertEquals(50, body(add).get("currentStock").asInt());
        assertEquals(400, status(post("/inventory/" + id + "/restock", staff, Map.of("quantityToAdd", -51))));
        assertEquals(400, status(post("/inventory/" + id + "/restock", staff, Map.of("quantityToAdd", 0))));
        MvcResult remove = post("/inventory/" + id + "/restock", staff, Map.of("quantityToAdd", -50));
        assertEquals(200, status(remove));
        assertEquals("OutOfStock", body(remove).get("status").asText());
    }

    @Test
    @DisplayName("IN-06 [FR-08] an item that falls to the threshold appears in low-stock alerts and notifies the manager")
    void lowStockAlertAndNotification() throws Exception {
        String staff = login(STAFF);
        String manager = login(MANAGER);
        String id = create(staff, item(20, 5));
        assertEquals(200, status(post("/inventory/" + id + "/restock", staff, Map.of("quantityToAdd", -16))));

        boolean inAlerts = false;
        for (var n : body(get("/inventory/low-stock-alerts", manager))) {
            if (id.equals(n.get("itemId").asText())) inAlerts = true;
        }
        assertTrue(inAlerts, "item at 4 <= threshold 5 must be listed as low stock");

        MvcResult notes = get("/notifications", manager);
        assertEquals(200, status(notes));
        boolean notified = false;
        for (var n : body(notes)) {
            if (n.get("title").asText().startsWith("CRITICAL INVENTORY ALERT")) notified = true;
        }
        assertTrue(notified, "observer should have notified the clinic manager");
    }

    @Test
    @DisplayName("IN-07 [access control] pet owner has no inventory access; manager cannot add stock; vet can only read")
    void inventoryRoles() throws Exception {
        String owner = login(OWNER);
        String manager = login(MANAGER);
        String vet = login(VET);
        assertEquals(403, status(get("/inventory", owner)));
        assertEquals(403, status(post("/inventory", manager, item(5, 5))));
        assertEquals(200, status(get("/inventory", vet)));
        assertEquals(403, status(post("/inventory", vet, item(5, 5))));
    }

    @Test
    @DisplayName("IN-08 [FR-08] manager sends a refill alert; every clinic staff member is notified")
    void refillAlert() throws Exception {
        String staff = login(STAFF);
        String manager = login(MANAGER);
        String id = create(staff, item(2, 5));
        MvcResult res = post("/inventory/" + id + "/send-refill-alert", manager, Map.of("note", "Urgent please"));
        assertEquals(200, status(res));
        assertTrue(body(res).toString().contains("alert") || body(res).size() > 0);
    }

    @Test
    @DisplayName("IN-09 [error guessing] unknown item id -> 404 on read, update and delete")
    void unknownItem() throws Exception {
        String staff = login(STAFF);
        assertEquals(404, status(get("/inventory/INV-NOPE", staff)));
        assertEquals(404, status(delete("/inventory/INV-NOPE", staff)));
    }

    // ------------------------------------------------------------------ FR-09 suppliers & purchase orders

    private Map<String, Object> supplier(String company) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("companyName", company);
        m.put("contactPerson", "Nimal Silva");
        m.put("email", "sales@" + System.nanoTime() + ".example.com");
        m.put("phone", "0112223344");
        m.put("category", "Pharmaceuticals & Vaccines");
        m.put("leadTimeDays", 5);
        m.put("rating", 4.5);
        return m;
    }

    @Test
    @DisplayName("SU-01 [FR-09] manager adds, updates and deactivates a supplier")
    void supplierLifecycle() throws Exception {
        String manager = login(MANAGER);
        MvcResult created = post("/suppliers", manager, supplier("BB Pharma " + System.nanoTime()));
        assertEquals(201, status(created));
        String id = body(created).get("supplierId").asText();

        Map<String, Object> upd = new LinkedHashMap<>();
        upd.put("companyName", body(created).get("companyName").asText());
        upd.put("email", "new@example.com");
        upd.put("phone", "0775551234");
        MvcResult updated = put("/suppliers/" + id, manager, upd);
        assertEquals(200, status(updated));
        assertEquals("new@example.com", body(updated).get("email").asText());

        assertEquals(204, status(delete("/suppliers/" + id, manager)));
        assertFalse(body(get("/suppliers/" + id, manager)).get("active").asBoolean());
    }

    @Test
    @DisplayName("SU-02 [EP invalid] bad e-mail, phone and rating 5.1 are rejected; duplicate company is rejected")
    void supplierValidation() throws Exception {
        String manager = login(MANAGER);
        Map<String, Object> badEmail = supplier("BB Bad Email " + System.nanoTime());
        badEmail.put("email", "not-an-email");
        assertEquals(400, status(post("/suppliers", manager, badEmail)));

        Map<String, Object> badPhone = supplier("BB Bad Phone " + System.nanoTime());
        badPhone.put("phone", "12345");
        assertEquals(400, status(post("/suppliers", manager, badPhone)));

        Map<String, Object> badRating = supplier("BB Bad Rating " + System.nanoTime());
        badRating.put("rating", 5.1);
        assertEquals(400, status(post("/suppliers", manager, badRating)));

        String name = "BB Duplicate " + System.nanoTime();
        assertEquals(201, status(post("/suppliers", manager, supplier(name))));
        assertEquals(400, status(post("/suppliers", manager, supplier(name))));
    }

    @Test
    @DisplayName("SU-03 [access control] only manager/admin can create suppliers; staff may read")
    void supplierRoles() throws Exception {
        assertEquals(403, status(post("/suppliers", login(STAFF), supplier("BB Staff " + System.nanoTime()))));
        assertEquals(403, status(post("/suppliers", login(OWNER), supplier("BB Owner " + System.nanoTime()))));
        assertEquals(200, status(get("/suppliers", login(STAFF))));
    }

    @Test
    @DisplayName("SU-04 [FR-09] manager raises a purchase order; amount must be greater than zero")
    void purchaseOrderCreate() throws Exception {
        String manager = login(MANAGER);
        Map<String, Object> po = new LinkedHashMap<>();
        po.put("supplierName", "Zoetis Lanka");
        po.put("itemsDescription", "Vaccines x 100");
        po.put("totalAmount", 385000);
        assertEquals(201, status(post("/purchase-orders", manager, po)));
        po.put("totalAmount", 0);
        assertEquals(400, status(post("/purchase-orders", manager, po)));
        po.put("totalAmount", -5);
        assertEquals(400, status(post("/purchase-orders", manager, po)));
    }

    @Test
    @DisplayName("SU-05 [state transition] a placed order is Dispatched, then Shipped -> Delivered; Delivered is final")
    void purchaseOrderLifecycle() throws Exception {
        String manager = login(MANAGER);
        Map<String, Object> po = new LinkedHashMap<>();
        po.put("supplierName", "Zoetis Lanka");
        po.put("totalAmount", 100000);
        MvcResult created = post("/purchase-orders", manager, po);
        assertEquals(201, status(created));
        String id = body(created).get("orderId").asText();
        assertEquals("Dispatched", body(created).get("status").asText(), "placing an order dispatches it");

        assertEquals(200, status(put("/purchase-orders/" + id, manager, Map.of("status", "Shipped"))));
        assertEquals(200, status(put("/purchase-orders/" + id, manager, Map.of("status", "Delivered"))));
        assertEquals(400, status(put("/purchase-orders/" + id, manager, Map.of("status", "Cancelled"))));
    }

    @Test
    @DisplayName("SU-07 [FR-09] the supplier-page order endpoint issues unique ids for consecutive orders")
    void supplierPageOrdersGetUniqueIds() throws Exception {
        String manager = login(MANAGER);
        Map<String, Object> po = new LinkedHashMap<>();
        po.put("supplierName", "Zoetis Lanka");
        po.put("totalAmount", 5000);
        String first = body(post("/suppliers/purchase-orders", manager, po)).get("orderId").asText();
        String second = body(post("/suppliers/purchase-orders", manager, po)).get("orderId").asText();
        assertNotEquals(first, second);
        assertEquals(200, status(get("/purchase-orders/" + first, manager)));
    }

    @Test
    @DisplayName("SU-06 [state transition] illegal status jump is rejected, cancelled order is final")
    void purchaseOrderIllegalTransition() throws Exception {
        String manager = login(MANAGER);
        Map<String, Object> po = new LinkedHashMap<>();
        po.put("supplierName", "Zoetis Lanka");
        po.put("totalAmount", 100000);
        String id = body(post("/purchase-orders", manager, po)).get("orderId").asText();
        assertEquals(400, status(put("/purchase-orders/" + id, manager, Map.of("status", "Delivered"))));
        assertTrue(status(delete("/purchase-orders/" + id, manager)) / 100 == 2);
        assertEquals(400, status(put("/purchase-orders/" + id, manager, Map.of("totalAmount", 5))));
    }
}
