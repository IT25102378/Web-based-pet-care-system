package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Major Function 6.6 - Customer Feedback & Package Management (FR-10)
 * Techniques: boundary values (rating 1..5, text lengths), workflow, access-control matrix.
 */
class BB6_FeedbackPackagesTest extends BlackBoxSupport {

    private Map<String, Object> feedback(int rating) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId", "USR-001");
        m.put("serviceCategory", "Veterinary Consultation");
        m.put("rating", rating);
        m.put("title", "Great service");
        m.put("comments", "The vet was kind and explained everything clearly.");
        return m;
    }

    // ------------------------------------------------------------------ feedback

    @Test
    @DisplayName("FB-01 [EP valid] owner submits a review -> 201, manager is notified")
    void submitFeedback() throws Exception {
        String owner = login(OWNER);
        String manager = login(MANAGER);
        MvcResult res = post("/feedback", owner, feedback(5));
        assertEquals(201, status(res));
        assertTrue(body(res).get("feedbackId").asText().startsWith("FDB-"));

        boolean notified = false;
        for (var n : body(get("/notifications", manager))) {
            if ("New Client Feedback Submitted".equals(n.get("title").asText())) notified = true;
        }
        assertTrue(notified);
    }

    @Test
    @DisplayName("FB-02 [BVA] rating 0 rejected, 1 accepted, 5 accepted, 6 rejected")
    void ratingBoundaries() throws Exception {
        String owner = login(OWNER);
        assertEquals(400, status(post("/feedback", owner, feedback(0))));
        assertEquals(201, status(post("/feedback", owner, feedback(1))));
        assertEquals(201, status(post("/feedback", owner, feedback(5))));
        assertEquals(400, status(post("/feedback", owner, feedback(6))));
    }

    @Test
    @DisplayName("FB-03 [BVA] title 4 chars rejected / 5 accepted; comments 9 chars rejected / 10 accepted")
    void textLengthBoundaries() throws Exception {
        String owner = login(OWNER);
        Map<String, Object> f = feedback(4);
        f.put("title", "abcd");
        assertEquals(400, status(post("/feedback", owner, f)));
        f.put("title", "abcde");
        assertEquals(201, status(post("/feedback", owner, f)));
        f.put("comments", "123456789");
        assertEquals(400, status(post("/feedback", owner, f)));
        f.put("comments", "1234567890");
        assertEquals(201, status(post("/feedback", owner, f)));
    }

    @Test
    @DisplayName("FB-04 [access control] a review cannot be posted in another user's name; only owners may post")
    void feedbackIdentity() throws Exception {
        String other = login(OTHER_OWNER);
        assertEquals(403, status(post("/feedback", other, feedback(4))));   // userId USR-001 by USR-013
        assertEquals(403, status(post("/feedback", login(VET), feedback(4))));
        assertEquals(401, status(post("/feedback", null, feedback(4))));
    }

    @Test
    @DisplayName("FB-05 [workflow] manager responds; the owner is notified; owner cannot respond")
    void managerResponds() throws Exception {
        String owner = login(OWNER);
        String manager = login(MANAGER);
        String id = body(post("/feedback", owner, feedback(2))).get("feedbackId").asText();

        assertEquals(403, status(post("/feedback/" + id + "/respond", owner, Map.of("responseText", "I answer myself"))));
        assertEquals(400, status(post("/feedback/" + id + "/respond", manager, Map.of("responseText", ""))));
        MvcResult ok = post("/feedback/" + id + "/respond", manager, Map.of("responseText", "Sorry to hear that, we will improve."));
        assertEquals(200, status(ok));
        assertNotNull(body(ok).get("managerResponse"));

        boolean notified = false;
        for (var n : body(get("/notifications", owner))) {
            if (n.get("title").asText().contains("Responded")) notified = true;
        }
        assertTrue(notified);
    }

    @Test
    @DisplayName("FB-06 [FR-10] manager can filter reviews by category; delete is manager/admin only")
    void filterAndDelete() throws Exception {
        String owner = login(OWNER);
        String manager = login(MANAGER);
        Map<String, Object> f = feedback(3);
        f.put("serviceCategory", "Grooming & Spa");
        String id = body(post("/feedback", owner, f)).get("feedbackId").asText();

        MvcResult res = get("/feedback?category=Grooming%20%26%20Spa", manager);
        assertEquals(200, status(res));
        for (var n : body(res)) {
            assertEquals("Grooming & Spa", n.get("serviceCategory").asText());
        }
        assertEquals(403, status(delete("/feedback/" + id, owner)));
        assertTrue(status(delete("/feedback/" + id, manager)) / 100 == 2);
    }

    // ------------------------------------------------------------------ packages

    private Map<String, Object> pkg(String name, double price) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        m.put("description", "Monthly wellness bundle");
        m.put("price", price);
        m.put("originalValue", price + 5000);
        m.put("durationMinutes", 60);
        return m;
    }

    @Test
    @DisplayName("PK-01 [FR-10] manager creates a package; it is visible publicly without login")
    void createPackagePublic() throws Exception {
        String manager = login(MANAGER);
        String name = "BB Wellness " + System.nanoTime();
        MvcResult res = post("/packages", manager, pkg(name, 15000));
        assertEquals(201, status(res));
        boolean visible = false;
        for (var n : body(get("/packages", null))) {
            if (name.equals(n.get("name").asText())) visible = true;
        }
        assertTrue(visible);
    }

    @Test
    @DisplayName("PK-02 [EP invalid] price 0 / negative, duplicate name, discount 101 -> 400")
    void packageValidation() throws Exception {
        String manager = login(MANAGER);
        String name = "BB Pkg " + System.nanoTime();
        assertEquals(400, status(post("/packages", manager, pkg(name, 0))));
        assertEquals(400, status(post("/packages", manager, pkg(name, -100))));
        assertEquals(201, status(post("/packages", manager, pkg(name, 10000))));
        assertEquals(400, status(post("/packages", manager, pkg(name, 10000))));
        Map<String, Object> d = pkg(name + " D", 10000);
        d.put("discountPercent", 101);
        assertEquals(400, status(post("/packages", manager, d)));
    }

    @Test
    @DisplayName("PK-03 [access control] pet owner and vet cannot create packages")
    void packageRoles() throws Exception {
        assertEquals(403, status(post("/packages", login(OWNER), pkg("BB Owner Pkg " + System.nanoTime(), 1000))));
        assertEquals(403, status(post("/packages", login(VET), pkg("BB Vet Pkg " + System.nanoTime(), 1000))));
    }

    @Test
    @DisplayName("PK-04 [FR-10] deactivated package flag is stored; manager can reactivate")
    void activateDeactivate() throws Exception {
        String manager = login(MANAGER);
        String id = body(post("/packages", manager, pkg("BB Toggle " + System.nanoTime(), 9000))).get("serviceId").asText();
        MvcResult off = put("/packages/" + id + "/deactivate", manager, null);
        assertEquals(200, status(off));
        assertFalse(body(off).get("active").asBoolean());
        MvcResult on = put("/packages/" + id + "/activate", manager, null);
        assertTrue(body(on).get("active").asBoolean());
    }

    // ------------------------------------------------------------------ package bookings

    private Map<String, Object> booking(String ownerId, String packageName, int sessions) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ownerId", ownerId);
        m.put("ownerName", "Kavindu Perera");
        m.put("packageName", packageName);
        m.put("totalSessions", sessions);
        return m;
    }

    @Test
    @DisplayName("PK-05 [FR-10] owner buys a package; sessions can be redeemed until the package completes")
    void bookAndRedeem() throws Exception {
        String owner = login(OWNER);
        String provider = login(PROVIDER);
        String name = "BB Redeem " + System.nanoTime();
        MvcResult created = post("/packages/bookings", owner, booking("USR-001", name, 2));
        assertEquals(201, status(created));
        assertEquals(2, body(created).get("remainingSessions").asInt());
        String id = body(created).get("bookingId").asText();

        assertEquals(1, body(post("/packages/bookings/" + id + "/redeem", provider, null)).get("remainingSessions").asInt());
        MvcResult last = post("/packages/bookings/" + id + "/redeem", provider, null);
        assertEquals("Completed", body(last).get("status").asText());
        assertEquals(400, status(post("/packages/bookings/" + id + "/redeem", provider, null)));
    }

    @Test
    @DisplayName("PK-06 [BVA] total sessions 0 rejected, 1 accepted, 100 accepted, 101 rejected")
    void sessionBoundaries() throws Exception {
        String owner = login(OWNER);
        assertEquals(400, status(post("/packages/bookings", owner, booking("USR-001", "BB S0 " + System.nanoTime(), 0))));
        assertEquals(201, status(post("/packages/bookings", owner, booking("USR-001", "BB S1 " + System.nanoTime(), 1))));
        assertEquals(201, status(post("/packages/bookings", owner, booking("USR-001", "BB S100 " + System.nanoTime(), 100))));
        assertEquals(400, status(post("/packages/bookings", owner, booking("USR-001", "BB S101 " + System.nanoTime(), 101))));
    }

    @Test
    @DisplayName("PK-07 [rule] an owner cannot hold two active bookings of the same package")
    void duplicateActiveBooking() throws Exception {
        String owner = login(OWNER);
        String name = "BB Dup " + System.nanoTime();
        assertEquals(201, status(post("/packages/bookings", owner, booking("USR-001", name, 3))));
        assertEquals(400, status(post("/packages/bookings", owner, booking("USR-001", name, 3))));
    }

    @Test
    @DisplayName("PK-08 [access control] only owners buy; owners cannot redeem sessions")
    void bookingRoles() throws Exception {
        String owner = login(OWNER);
        String name = "BB Roles " + System.nanoTime();
        String id = body(post("/packages/bookings", owner, booking("USR-001", name, 3))).get("bookingId").asText();
        assertEquals(403, status(post("/packages/bookings/" + id + "/redeem", owner, null)));
        assertEquals(403, status(post("/packages/bookings", login(PROVIDER), booking("USR-001", name + "x", 3))));
    }

    @Test
    @DisplayName("PK-09 [data isolation] a booking is always recorded under the logged-in owner, never a spoofed ownerId")
    void cannotBookForSomeoneElse() throws Exception {
        String ownerA = login(OWNER);
        String ownerB = login(OTHER_OWNER);
        String name = "BB Impersonate " + System.nanoTime();
        MvcResult res = post("/packages/bookings", ownerB, booking("USR-001", name, 3));
        assertEquals(201, status(res));
        assertEquals("USR-013", body(res).get("ownerId").asText(), "booking must belong to the caller");

        for (var n : body(get("/packages/bookings", ownerA))) {
            assertNotEquals(name, n.get("packageName").asText(), "USR-001 must not receive a booking made by USR-013");
        }
    }

    @Test
    @DisplayName("PK-10 [data isolation] an owner listing bookings only sees their own, even when asking for someone else's")
    void bookingListIsolation() throws Exception {
        String ownerA = login(OWNER);
        String ownerB = login(OTHER_OWNER);
        post("/packages/bookings", ownerA, booking("USR-001", "BB Private " + System.nanoTime(), 3));
        for (String path : new String[]{"/packages/bookings", "/packages/bookings?ownerId=USR-001"}) {
            MvcResult res = get(path, ownerB);
            assertEquals(200, status(res));
            for (var n : body(res)) {
                assertEquals("USR-013", n.get("ownerId").asText(), path);
            }
        }
        // staff roles can still see the full list
        boolean sawOwnerA = false;
        for (var n : body(get("/packages/bookings", login(MANAGER)))) {
            if ("USR-001".equals(n.get("ownerId").asText())) sawOwnerA = true;
        }
        assertTrue(sawOwnerA);
    }

    @Test
    @DisplayName("PK-11 [rule] a booking with a packageId must reference an ACTIVE catalogue package; the catalogue name is recorded")
    void bookingValidatesCatalogue() throws Exception {
        String manager = login(MANAGER);
        String owner = login(OWNER);
        String name = "BB Catalogue " + System.nanoTime();
        MvcResult pkg = post("/packages", manager, pkg(name, 12000));
        String serviceId = body(pkg).get("serviceId").asText();

        Map<String, Object> b = booking("USR-001", "Name Typed By Owner", 3);
        b.put("packageId", "CSR-DOES-NOT-EXIST");
        assertEquals(400, status(post("/packages/bookings", owner, b)));

        b.put("packageId", serviceId);
        MvcResult ok = post("/packages/bookings", owner, b);
        assertEquals(201, status(ok));
        assertEquals(name, body(ok).get("packageName").asText(), "the catalogue name wins over the typed name");

        // deactivated packages cannot be bought
        put("/packages/" + serviceId + "/deactivate", manager, null);
        Map<String, Object> again = booking("USR-013", "x", 3);
        again.put("packageId", serviceId);
        assertEquals(400, status(post("/packages/bookings", login(OTHER_OWNER), again)));
    }
}
