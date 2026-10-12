package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Major Function 6.4 - Pet Services & Health Management (FR-04, FR-07)
 * Techniques: boundary values on clinical measurements, workflow, access-control matrix.
 */
class BB4_PetServicesHealthTest extends BlackBoxSupport {

    private Map<String, Object> consult(String petId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("petId", petId);
        m.put("vetId", "USR-002");
        m.put("assessmentDiagnosis", "Mild gastroenteritis");
        m.put("treatmentPlan", "Bland diet and oral rehydration for 3 days");
        return m;
    }

    private Map<String, Object> prescription(String petId, String medication) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("medicationName", medication);
        item.put("dosage", "10 mg");
        item.put("frequency", "Twice daily");
        item.put("durationDays", 7);
        item.put("quantityPrescribed", 1);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("petId", petId);
        m.put("vetId", "USR-002");
        m.put("instructions", "Give with food");
        m.put("items", List.of(item));
        return m;
    }

    // ------------------------------------------------------------------ FR-04 consultations

    @Test
    @DisplayName("HE-01 [EP valid] vet records a consultation (SOAP) -> 201 with id and Completed status")
    void createConsultation() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Patient", 4);
        Map<String, Object> c = consult(petId);
        c.put("temperatureC", 38.5);
        c.put("heartRateBpm", 110);
        c.put("weightKg", 12.4);
        MvcResult res = post("/consultations", vet, c);
        assertEquals(201, status(res));
        assertTrue(body(res).get("consultationId").asText().startsWith("CNS-"));
        assertEquals("Completed", body(res).get("status").asText());
    }

    @Test
    @DisplayName("HE-02 [EP invalid] diagnosis or treatment plan missing -> 400")
    void consultationRequiredFields() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Incomplete", 4);
        Map<String, Object> c = consult(petId);
        c.put("assessmentDiagnosis", "");
        assertEquals(400, status(post("/consultations", vet, c)));
        c = consult(petId);
        c.put("treatmentPlan", "");
        assertEquals(400, status(post("/consultations", vet, c)));
    }

    @Test
    @DisplayName("HE-03 [BVA] body temperature: 29.9 rejected, 30.0 accepted, 45.0 accepted, 45.1 rejected")
    void temperatureBoundaries() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Temp", 4);
        double[] values = {29.9, 30.0, 45.0, 45.1};
        int[] expected = {400, 201, 201, 400};
        for (int i = 0; i < values.length; i++) {
            Map<String, Object> c = consult(petId);
            c.put("temperatureC", values[i]);
            assertEquals(expected[i], status(post("/consultations", vet, c)), "temperature " + values[i]);
        }
    }

    @Test
    @DisplayName("HE-04 [BVA] heart rate: 19 rejected, 20 accepted, 400 accepted, 401 rejected")
    void heartRateBoundaries() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Heart", 4);
        int[] values = {19, 20, 400, 401};
        int[] expected = {400, 201, 201, 400};
        for (int i = 0; i < values.length; i++) {
            Map<String, Object> c = consult(petId);
            c.put("heartRateBpm", values[i]);
            assertEquals(expected[i], status(post("/consultations", vet, c)), "heart rate " + values[i]);
        }
    }

    @Test
    @DisplayName("HE-05 [access control] only veterinarians may record consultations")
    void consultationRoles() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Roles", 4);
        assertEquals(403, status(post("/consultations", owner, consult(petId))));
        assertEquals(403, status(post("/consultations", login(STAFF), consult(petId))));
        assertEquals(403, status(post("/consultations", login(PROVIDER), consult(petId))));
    }

    @Test
    @DisplayName("HE-06 [rule] a consultation closes its appointment, and a second one for it is rejected")
    void consultationCompletesAppointment() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Closer", 4);
        Map<String, Object> book = new LinkedHashMap<>();
        book.put("petId", petId);
        book.put("ownerId", "USR-001");
        book.put("vetId", "USR-002");
        book.put("vetName", VET_NAME);
        book.put("serviceType", "Checkup");
        book.put("appointmentDate", farFuture(20).toString());
        book.put("timeSlot", "09:00 AM");
        book.put("reason", "Annual checkup");
        String apptId = body(post("/appointments", owner, book)).get("appointmentId").asText();

        Map<String, Object> c = consult(petId);
        c.put("appointmentId", apptId);
        assertEquals(201, status(post("/consultations", vet, c)));
        assertEquals("Completed", body(get("/appointments/" + apptId, owner)).get("status").asText());
        assertEquals(400, status(post("/consultations", vet, c)));
    }

    @Test
    @DisplayName("HE-07 [FR-04] prescription: vet issues it, items are stored, status Active")
    void createPrescription() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Rx", 4);
        MvcResult res = post("/prescriptions", vet, prescription(petId, "Amoxicillin 250mg"));
        assertEquals(201, status(res));
        assertTrue(body(res).get("prescriptionId").asText().startsWith("RX-"));
        assertEquals("Active", body(res).get("status").asText());
        assertEquals(1, body(res).get("items").size());
    }

    @Test
    @DisplayName("HE-08 [EP invalid] prescription without items, or non-vet role -> rejected")
    void prescriptionValidation() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "RxBad", 4);
        Map<String, Object> noItems = prescription(petId, "x");
        noItems.put("items", List.of());
        assertEquals(400, status(post("/prescriptions", vet, noItems)));
        assertEquals(403, status(post("/prescriptions", owner, prescription(petId, "Amoxicillin 250mg"))));
    }

    @Test
    @DisplayName("HE-09 [BVA] prescribed quantity 0 rejected, 1 accepted; duration 366 rejected")
    void prescriptionItemBoundaries() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "RxBva", 4);
        Map<String, Object> p = prescription(petId, "Meloxicam");
        @SuppressWarnings("unchecked") Map<String, Object> item = (Map<String, Object>) ((List<?>) p.get("items")).get(0);
        item.put("quantityPrescribed", 0);
        assertEquals(400, status(post("/prescriptions", vet, p)));
        p = prescription(petId, "Meloxicam");
        @SuppressWarnings("unchecked") Map<String, Object> item2 = (Map<String, Object>) ((List<?>) p.get("items")).get(0);
        item2.put("durationDays", 366);
        assertEquals(400, status(post("/prescriptions", vet, p)));
    }

    @Test
    @DisplayName("HE-10 [state] revoke needs a reason, works once, and the record stays on file")
    void revokePrescription() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Revoked", 4);
        String id = body(post("/prescriptions", vet, prescription(petId, "Prednisolone"))).get("prescriptionId").asText();

        assertEquals(400, status(post("/prescriptions/" + id + "/revoke", vet, Map.of())));
        MvcResult ok = post("/prescriptions/" + id + "/revoke", vet, Map.of("reason", "Allergic reaction"));
        assertEquals(200, status(ok));
        assertEquals("Revoked", body(ok).get("status").asText());
        assertEquals(400, status(post("/prescriptions/" + id + "/revoke", vet, Map.of("reason", "again"))));
        assertEquals(200, status(get("/prescriptions/" + id, vet)));
    }

    @Test
    @DisplayName("HE-11 [FR-04] medical history shows consultations, prescriptions and vaccinations; stranger blocked")
    void medicalHistory() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String other = login(OTHER_OWNER);
        String petId = createPet(owner, "Historian", 4);
        assertEquals(201, status(post("/consultations", vet, consult(petId))));
        assertEquals(201, status(post("/prescriptions", vet, prescription(petId, "Cefalexin"))));
        Map<String, Object> v = new LinkedHashMap<>();
        v.put("petId", petId);
        v.put("vaccineName", "DHPP");
        v.put("administeredDate", LocalDate.now().minusDays(2).toString());
        assertEquals(201, status(post("/vaccinations", vet, v)));

        MvcResult res = get("/pets/" + petId + "/medical-history", owner);
        assertEquals(200, status(res));
        assertEquals(1, body(res).get("consultations").size());
        assertEquals(1, body(res).get("prescriptions").size());
        assertEquals(1, body(res).get("vaccinations").size());
        assertEquals(403, status(get("/pets/" + petId + "/medical-history", other)));
    }

    @Test
    @DisplayName("HE-12 [data isolation] an owner's prescription list never contains another owner's pets")
    void prescriptionIsolation() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String other = login(OTHER_OWNER);
        String petId = createPet(owner, "Secret", 4);
        post("/prescriptions", vet, prescription(petId, "Cefalexin"));
        MvcResult res = get("/prescriptions", other);
        assertEquals(200, status(res));
        for (var n : body(res)) {
            assertNotEquals(petId, n.get("petId").asText());
        }
    }

    // ------------------------------------------------------------------ FR-07 grooming / care services

    private Map<String, Object> careLog(String petId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("petId", petId);
        m.put("serviceType", "Deluxe Spa Grooming");
        m.put("providerId", "PRV-001");
        m.put("providerName", "Dilshan Bandara");
        m.put("intakeCondition", "Matted coat");
        return m;
    }

    @Test
    @DisplayName("CS-01 [FR-07] provider records a grooming session -> 201, status CheckedIn, owner derived from pet")
    void createCareLog() throws Exception {
        String owner = login(OWNER);
        String provider = login(PROVIDER);
        String petId = createPet(owner, "Groomed", 4);
        MvcResult res = post("/care-services/logs", provider, careLog(petId));
        assertEquals(201, status(res), res.getResponse().getContentAsString());
        assertTrue(body(res).get("serviceLogId").asText().startsWith("CSL-"));
        assertEquals("USR-001", body(res).get("ownerId").asText());
        assertEquals("CheckedIn", body(res).get("status").asText());
    }

    @Test
    @DisplayName("CS-02 [FR-07] session progresses CheckedIn -> InProgress -> ReadyForPickup -> Completed")
    void careLogLifecycle() throws Exception {
        String owner = login(OWNER);
        String provider = login(PROVIDER);
        String petId = createPet(owner, "Lifecycle", 4);
        String id = body(post("/care-services/logs", provider, careLog(petId))).get("serviceLogId").asText();
        for (String s : new String[]{"InProgress", "ReadyForPickup", "Completed"}) {
            MvcResult res = put("/care-services/logs/" + id + "/status", provider, Map.of("status", s));
            assertEquals(200, status(res), s);
            assertEquals(s, body(res).get("status").asText());
        }
    }

    @Test
    @DisplayName("CS-03 [rule] the same pet cannot be scheduled twice on one date; neither petId nor caseId is rejected")
    void careLogRules() throws Exception {
        String owner = login(OWNER);
        String provider = login(PROVIDER);
        String petId = createPet(owner, "Dupe", 4);
        Map<String, Object> first = careLog(petId);
        first.put("serviceDate", LocalDate.now().plusDays(5).toString());
        assertEquals(201, status(post("/care-services/logs", provider, first)));
        assertEquals(400, status(post("/care-services/logs", provider, first)));
        assertEquals(400, status(post("/care-services/logs", provider, Map.of("serviceType", "Bath"))));
    }

    @Test
    @DisplayName("CS-04 [BVA] service date: 1 year ahead accepted, more than 1 year rejected")
    void careLogDateBoundary() throws Exception {
        String owner = login(OWNER);
        String provider = login(PROVIDER);
        String petId = createPet(owner, "DateLimit", 4);
        Map<String, Object> m = careLog(petId);
        m.put("serviceDate", LocalDate.now().plusYears(1).plusDays(1).toString());
        assertEquals(400, status(post("/care-services/logs", provider, m)));
        m.put("serviceDate", LocalDate.now().plusYears(1).toString());
        assertEquals(201, status(post("/care-services/logs", provider, m)));
    }

    @Test
    @DisplayName("CS-05 [access control] a pet owner cannot create or delete care logs")
    void careLogRoles() throws Exception {
        String owner = login(OWNER);
        String provider = login(PROVIDER);
        String petId = createPet(owner, "Guarded", 4);
        assertEquals(403, status(post("/care-services/logs", owner, careLog(petId))));
        String id = body(post("/care-services/logs", provider, careLog(petId))).get("serviceLogId").asText();
        assertEquals(403, status(delete("/care-services/logs/" + id, owner)));
    }
}
