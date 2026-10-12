package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Major Function 6.2 - Appointment & Booking Management (FR-02, FR-03)
 * Techniques: equivalence partitioning, boundary values, state-transition, access-control matrix.
 */
class BB2_AppointmentBookingTest extends BlackBoxSupport {

    private Map<String, Object> bookingBody(String ownerId, String petId, LocalDate date, String slot) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("petId", petId);
        m.put("ownerId", ownerId);
        m.put("vetId", "USR-002");
        m.put("vetName", VET_NAME);
        m.put("serviceType", "Routine Wellness Check");
        m.put("appointmentDate", date.toString());
        m.put("timeSlot", slot);
        m.put("reason", "Annual wellness check");
        return m;
    }

    private MvcResult book(String token, String ownerId, String petId, LocalDate date, String slot) throws Exception {
        return post("/appointments", token, bookingBody(ownerId, petId, date, slot));
    }

    private String bookOk(String token, String ownerId, String petId, LocalDate date, String slot) throws Exception {
        MvcResult res = book(token, ownerId, petId, date, slot);
        assertEquals(201, status(res), "booking should succeed: " + res.getResponse().getContentAsString());
        return body(res).get("appointmentId").asText();
    }

    // ------------------------------------------------------------------ FR-02 owner books

    @Test
    @DisplayName("AP-01 [EP valid] owner books an appointment -> 201, queue token and fee assigned")
    void bookValid() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Booker", 3);
        MvcResult res = book(owner, "USR-001", petId, farFuture(1), "09:00 AM");
        assertEquals(201, status(res));
        assertTrue(body(res).get("appointmentId").asText().startsWith("APT-"));
        assertTrue(body(res).get("tokenNumber").asText().startsWith("A-"));
        assertEquals("STANDARD", body(res).get("feeStrategy").asText());
        assertEquals(3500.0, body(res).get("consultationFee").asDouble(), 0.001);
    }

    @Test
    @DisplayName("AP-02 [EP invalid] missing vet name / reason shorter than 5 characters -> 400")
    void bookInvalidFields() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Invalid", 3);
        Map<String, Object> b = bookingBody("USR-001", petId, farFuture(2), "09:00 AM");
        b.put("vetName", "");
        assertEquals(400, status(post("/appointments", owner, b)));
        b = bookingBody("USR-001", petId, farFuture(2), "09:00 AM");
        b.put("reason", "abcd");
        assertEquals(400, status(post("/appointments", owner, b)));
    }

    @Test
    @DisplayName("AP-03 [BVA] yesterday rejected, today accepted")
    void pastDateBoundary() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Dates", 3);
        MvcResult past = book(owner, "USR-001", petId, LocalDate.now().minusDays(1), "09:00 AM");
        assertEquals(400, status(past));
        assertTrue(message(past).toLowerCase().contains("past"));
        // today: the last slot (04:30 PM) is bookable until it has passed, after that the clinic day is over
        boolean lastSlotStillAhead = java.time.LocalTime.now().isBefore(java.time.LocalTime.of(16, 30));
        MvcResult today = book(owner, "USR-001", petId, LocalDate.now(), "04:30 PM");
        assertEquals(lastSlotStillAhead ? 201 : 400, status(today), message(today));
        // once 09:00 has passed, the 09:00 slot of today is refused
        if (java.time.LocalTime.now().isAfter(java.time.LocalTime.of(9, 0))) {
            assertEquals(400, status(book(owner, "USR-001", petId, LocalDate.now(), "09:00 AM")));
        }
    }

    @Test
    @DisplayName("AP-04 [rule] the same vet cannot be double-booked for one date and slot")
    void vetDoubleBooking() throws Exception {
        String owner = login(OWNER);
        String pet1 = createPet(owner, "First", 3);
        String pet2 = createPet(owner, "Second", 4);
        LocalDate d = farFuture(3);
        bookOk(owner, "USR-001", pet1, d, "10:00 AM");
        MvcResult second = book(owner, "USR-001", pet2, d, "10:00 AM");
        assertEquals(400, status(second));
        assertTrue(message(second).toLowerCase().contains("already booked"));
    }

    @Test
    @DisplayName("AP-05 [rule] the same pet cannot have two appointments at one date and slot")
    void petDoubleBooking() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Twin", 3);
        LocalDate d = farFuture(4);
        bookOk(owner, "USR-001", petId, d, "10:30 AM");
        Map<String, Object> other = bookingBody("USR-001", petId, d, "10:30 AM");
        other.put("vetId", "USR-014");
        other.put("vetName", "Oshada");
        assertEquals(400, status(post("/appointments", owner, other)));
    }

    @Test
    @DisplayName("AP-06 [state] a cancelled slot becomes bookable again")
    void cancelledSlotReusable() throws Exception {
        String owner = login(OWNER);
        String pet1 = createPet(owner, "Cancelee", 3);
        String pet2 = createPet(owner, "Reuser", 3);
        LocalDate d = farFuture(5);
        String id = bookOk(owner, "USR-001", pet1, d, "11:00 AM");
        assertEquals(200, status(put("/appointments/" + id + "/cancel", owner, Map.of("cancellationReason", "Change of plans"))));
        assertEquals(201, status(book(owner, "USR-001", pet2, d, "11:00 AM")));
    }

    @Test
    @DisplayName("AP-07 [access control] an owner cannot book for another owner's pet")
    void bookForForeignPet() throws Exception {
        String ownerA = login(OWNER);
        String ownerB = login(OTHER_OWNER);
        String petOfA = createPet(ownerA, "NotYours", 3);
        MvcResult res = book(ownerB, "USR-013", petOfA, farFuture(6), "02:00 PM");
        assertEquals(400, status(res));
    }

    // ------------------------------------------------------------------ reschedule & cancel

    @Test
    @DisplayName("AP-08 [FR-02] reschedule keeps an audit trail of the previous schedule")
    void reschedule() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Mover", 3);
        LocalDate d = farFuture(7);
        String id = bookOk(owner, "USR-001", petId, d, "02:30 PM");
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("appointmentDate", d.plusDays(1).toString());
        r.put("timeSlot", "03:00 PM");
        r.put("rescheduleReason", "Work meeting");
        MvcResult res = put("/appointments/" + id + "/reschedule", owner, r);
        assertEquals(200, status(res));
        assertEquals("03:00 PM", body(res).get("timeSlot").asText());
        assertEquals("02:30 PM", body(res).get("rescheduledFrom").get("timeSlot").asText());
    }

    @Test
    @DisplayName("AP-09 [rule] reschedule into an occupied slot or into the past is rejected")
    void rescheduleConflicts() throws Exception {
        String owner = login(OWNER);
        String pet1 = createPet(owner, "MoverA", 3);
        String pet2 = createPet(owner, "MoverB", 3);
        LocalDate d = farFuture(8);
        String idA = bookOk(owner, "USR-001", pet1, d, "03:30 PM");
        bookOk(owner, "USR-001", pet2, d, "04:00 PM");

        Map<String, Object> toTaken = new LinkedHashMap<>();
        toTaken.put("appointmentDate", d.toString());
        toTaken.put("timeSlot", "04:00 PM");
        assertEquals(400, status(put("/appointments/" + idA + "/reschedule", owner, toTaken)));

        Map<String, Object> toPast = new LinkedHashMap<>();
        toPast.put("appointmentDate", LocalDate.now().minusDays(1).toString());
        toPast.put("timeSlot", "09:30 AM");
        assertEquals(400, status(put("/appointments/" + idA + "/reschedule", owner, toPast)));
    }

    @Test
    @DisplayName("AP-10 [state] cancel works once; a second cancel is rejected; a stranger cannot cancel")
    void cancelRules() throws Exception {
        String owner = login(OWNER);
        String stranger = login(OTHER_OWNER);
        String petId = createPet(owner, "Cancelable", 3);
        String id = bookOk(owner, "USR-001", petId, farFuture(9), "09:30 AM");

        assertEquals(403, status(put("/appointments/" + id + "/cancel", stranger, Map.of("cancellationReason", "x"))));
        MvcResult ok = put("/appointments/" + id + "/cancel", owner, Map.of("cancellationReason", "Pet recovered"));
        assertEquals(200, status(ok));
        assertEquals("Cancelled", body(ok).get("status").asText());
        assertEquals(400, status(put("/appointments/" + id + "/cancel", owner, Map.of("cancellationReason", "again"))));
    }

    // ------------------------------------------------------------------ FR-03 clinic staff

    @Test
    @DisplayName("AP-11 [FR-03] clinic staff can confirm a booking that an owner just made")
    void staffConfirmsFreshBooking() throws Exception {
        String owner = login(OWNER);
        String staff = login(STAFF);
        String petId = createPet(owner, "ToConfirm", 3);
        String id = bookOk(owner, "USR-001", petId, farFuture(10), "11:00 AM");
        MvcResult res = put("/appointments/" + id + "/confirm", staff, null);
        assertEquals(200, status(res),
                "FR-03: staff must be able to confirm bookings. Response: " + res.getResponse().getContentAsString());
        assertEquals("Confirmed", body(res).get("status").asText());
        // a confirmed appointment cannot be confirmed again
        assertEquals(400, status(put("/appointments/" + id + "/confirm", staff, null)));
    }

    @Test
    @DisplayName("AP-12 [FR-03] staff can view a veterinarian's schedule for a date")
    void staffViewsVetSchedule() throws Exception {
        String owner = login(OWNER);
        String staff = login(STAFF);
        String petId = createPet(owner, "Scheduled", 3);
        LocalDate d = farFuture(11);
        String id = bookOk(owner, "USR-001", petId, d, "02:00 PM");
        MvcResult res = get("/appointments?vetId=USR-002&date=" + d, staff);
        assertEquals(200, status(res));
        boolean found = false;
        for (var n : body(res)) {
            if (id.equals(n.get("appointmentId").asText())) found = true;
        }
        assertTrue(found, "booked appointment should appear on the vet schedule");
    }

    @Test
    @DisplayName("AP-13 [FR-03] staff can browse appointment history by status")
    void staffAppointmentHistory() throws Exception {
        String owner = login(OWNER);
        String staff = login(STAFF);
        String petId = createPet(owner, "History", 3);
        String id = bookOk(owner, "USR-001", petId, farFuture(12), "02:30 PM");
        put("/appointments/" + id + "/cancel", owner, Map.of("cancellationReason", "History test"));
        MvcResult res = get("/appointments?status=Cancelled", staff);
        assertEquals(200, status(res));
        boolean found = false;
        for (var n : body(res)) {
            assertEquals("Cancelled", n.get("status").asText());
            if (id.equals(n.get("appointmentId").asText())) found = true;
        }
        assertTrue(found);
    }

    @Test
    @DisplayName("AP-14 [FR-03] staff registers a walk-in; the owner role cannot")
    void walkIn() throws Exception {
        String staff = login(STAFF);
        String owner = login(OWNER);
        Map<String, Object> w = new LinkedHashMap<>();
        w.put("ownerName", "Walk In Person");
        w.put("petName", "Rex");
        w.put("species", "Dog");
        w.put("serviceType", "General Checkup");
        w.put("vetName", VET_NAME);
        w.put("reason", "Limping on right leg");
        MvcResult res = post("/appointments/walk-in", staff, w);
        assertEquals(201, status(res));
        assertTrue(body(res).get("tokenNumber").asText().startsWith("W-"));
        assertEquals("CheckedIn", body(res).get("status").asText());
        assertEquals(403, status(post("/appointments/walk-in", owner, w)));
    }

    @Test
    @DisplayName("AP-15 [EP invalid] status update rejects unknown status; owner is forbidden")
    void statusUpdate() throws Exception {
        String owner = login(OWNER);
        String staff = login(STAFF);
        String petId = createPet(owner, "Statused", 3);
        String id = bookOk(owner, "USR-001", petId, farFuture(13), "03:00 PM");
        assertEquals(400, status(put("/appointments/" + id + "/status", staff, Map.of("status", "Banana"))));
        assertEquals(403, status(put("/appointments/" + id + "/status", owner, Map.of("status", "CheckedIn"))));
        MvcResult ok = put("/appointments/" + id + "/status", staff, Map.of("status", "CheckedIn"));
        assertEquals(200, status(ok));
        assertEquals("CheckedIn", body(ok).get("status").asText());
    }

    // ------------------------------------------------------------------ availability / misc

    @Test
    @DisplayName("AP-21 [state transition] the queue only moves forward: Scheduled -> CheckedIn -> InRoom -> Completed, never back")
    void queueWorkflow() throws Exception {
        String owner = login(OWNER);
        String staff = login(STAFF);
        String petId = createPet(owner, "Queued", 3);
        String id = bookOk(owner, "USR-001", petId, farFuture(17), "09:00 AM");

        assertEquals(400, status(put("/appointments/" + id + "/status", staff, Map.of("status", "Completed"))), "cannot skip check-in");
        assertEquals(200, status(put("/appointments/" + id + "/status", staff, Map.of("status", "CheckedIn"))));
        assertEquals(200, status(put("/appointments/" + id + "/status", staff, Map.of("status", "InRoom"))));
        assertEquals(400, status(put("/appointments/" + id + "/status", staff, Map.of("status", "Scheduled"))), "cannot go backwards");
        assertEquals(200, status(put("/appointments/" + id + "/status", staff, Map.of("status", "Completed"))));
        assertEquals(400, status(put("/appointments/" + id + "/status", staff, Map.of("status", "CheckedIn"))), "completed is final");
    }

    @Test
    @DisplayName("AP-16 available-slots marks a booked slot as unavailable and the rest as available")
    void availableSlots() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Slotty", 3);
        LocalDate d = farFuture(14);
        bookOk(owner, "USR-001", petId, d, "04:00 PM");
        MvcResult res = mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/appointments/available-slots").servletPath("/api")
                        .header("Authorization", "Bearer " + owner)
                        .param("vetName", VET_NAME).param("date", d.toString()))
                .andReturn();
        assertEquals(200, status(res));
        boolean sawBooked = false;
        boolean sawFree = false;
        for (var n : body(res)) {
            if ("04:00 PM".equals(n.get("timeSlot").asText())) {
                assertFalse(n.get("isAvailable").asBoolean());
                sawBooked = true;
            } else if ("09:00 AM".equals(n.get("timeSlot").asText())) {
                assertTrue(n.get("isAvailable").asBoolean());
                sawFree = true;
            }
        }
        assertTrue(sawBooked && sawFree);
    }

    @Test
    @DisplayName("AP-17 [error guessing] unknown appointment id -> 404, no token -> 401")
    void notFoundAndUnauthenticated() throws Exception {
        String owner = login(OWNER);
        assertEquals(404, status(get("/appointments/APT-DOES-NOT-EXIST", owner)));
        assertEquals(401, status(get("/appointments", null)));
    }

    @Test
    @DisplayName("AP-18 [data isolation] an owner's appointment list contains only their own appointments")
    void ownerListIsolation() throws Exception {
        String owner = login(OWNER);
        MvcResult res = get("/appointments", owner);
        assertEquals(200, status(res));
        for (var n : body(res)) {
            assertEquals("USR-001", n.get("ownerId").asText());
        }
    }

    @Test
    @DisplayName("AP-20 [BVA / constraint] only clinic working-hour slots can be booked (09:00-11:00, 14:00-16:30)")
    void onlyClinicSlotsAccepted() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "NightOwl", 3);
        MvcResult res = book(owner, "USR-001", petId, farFuture(16), "03:17 AM");
        assertEquals(400, status(res), "slot outside the published clinic hours was accepted");
    }

    @Test
    @DisplayName("AP-19 fee: emergency service uses the emergency triage strategy and senior pet gets the discount")
    void feeStrategiesApplied() throws Exception {
        String owner = login(OWNER);
        String seniorPet = createPet(owner, "Oldie", 10);
        MvcResult senior = book(owner, "USR-001", seniorPet, farFuture(15), "09:00 AM");
        assertEquals(201, status(senior));
        assertEquals("SENIOR_PET_DISCOUNT", body(senior).get("feeStrategy").asText());
        assertEquals(2975.0, body(senior).get("consultationFee").asDouble(), 0.001);

        String youngPet = createPet(owner, "Emerg", 2);
        Map<String, Object> e = bookingBody("USR-001", youngPet, farFuture(15), "09:30 AM");
        e.put("serviceType", "Emergency Care");
        MvcResult em = post("/appointments", owner, e);
        assertEquals(201, status(em));
        assertEquals("EMERGENCY_TRIAGE", body(em).get("feeStrategy").asText());
        assertEquals(9000.0, body(em).get("consultationFee").asDouble(), 0.001);
    }
}
