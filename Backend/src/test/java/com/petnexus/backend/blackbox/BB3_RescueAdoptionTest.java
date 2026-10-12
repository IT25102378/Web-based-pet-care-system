package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Major Function 6.3 - Pet Rescue & Adoption Management (FR-05, FR-06)
 * Techniques: state-transition testing of the rescue workflow, EP/BVA, access-control matrix.
 */
class BB3_RescueAdoptionTest extends BlackBoxSupport {

    private Map<String, Object> caseBody(String name) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("temporaryName", name);
        m.put("species", "Dog");
        m.put("breed", "Mixed");
        m.put("rescueLocation", "Galle Road, Colombo 03");
        m.put("conditionSeverity", "Moderate");
        return m;
    }

    private String createCase(String officer, String name) throws Exception {
        MvcResult res = post("/rescue/cases", officer, caseBody(name));
        assertEquals(201, status(res), res.getResponse().getContentAsString());
        return body(res).get("caseId").asText();
    }

    private void moveTo(String officer, String caseId, String newStatus) throws Exception {
        MvcResult res = put("/rescue/cases/" + caseId, officer, Map.of("status", newStatus));
        assertEquals(200, status(res), "-> " + newStatus + ": " + res.getResponse().getContentAsString());
    }

    // ------------------------------------------------------------------ FR-05 rescue cases

    @Test
    @DisplayName("RS-01 [EP valid] rescue officer registers a case -> status Intake, intake log created")
    void createCaseValid() throws Exception {
        String officer = login(RESCUE);
        MvcResult res = post("/rescue/cases", officer, caseBody("Stray Rex"));
        assertEquals(201, status(res));
        assertEquals("Intake", body(res).get("status").asText());
        assertTrue(body(res).get("caseId").asText().startsWith("RSC-"));
        assertEquals(1, body(res).get("progressLogs").size());
    }

    @Test
    @DisplayName("RS-02 [EP invalid] missing name / species / location -> 400 listing missing fields")
    void createCaseMissingFields() throws Exception {
        String officer = login(RESCUE);
        MvcResult res = post("/rescue/cases", officer, Map.of("breed", "Mixed"));
        assertEquals(400, status(res));
        assertTrue(message(res).contains("temporaryName"));
    }

    @Test
    @DisplayName("RS-03 [access control] only rescue officers/admin may register a case")
    void createCaseRoles() throws Exception {
        assertEquals(403, status(post("/rescue/cases", login(OWNER), caseBody("Nope"))));
        assertEquals(403, status(post("/rescue/cases", login(STAFF), caseBody("Nope"))));
        assertEquals(201, status(post("/rescue/cases", login(ADMIN), caseBody("AdminCase"))));
    }

    @Test
    @DisplayName("RS-04 [workflow] community report -> officer accepts -> case moves Reported to Intake")
    void reportAndAccept() throws Exception {
        String owner = login(OWNER);
        String officer = login(RESCUE);
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("species", "Cat");
        report.put("rescueLocation", "Temple Road, Nugegoda");
        report.put("conditionSeverity", "High");
        report.put("reportedByUserId", "USR-001");
        report.put("reportedByUserName", "Kavindu Perera");
        MvcResult rep = post("/rescue/cases/report", owner, report);
        assertEquals(201, status(rep));
        assertEquals("Reported", body(rep).get("status").asText());
        String caseId = body(rep).get("caseId").asText();

        MvcResult acc = post("/rescue/cases/" + caseId + "/accept-report", officer, Map.of("notes", "On the way"));
        assertEquals(200, status(acc));
        assertEquals("Intake", body(acc).get("status").asText());

        // cannot accept twice
        assertEquals(400, status(post("/rescue/cases/" + caseId + "/accept-report", officer, Map.of())));
    }

    @Test
    @DisplayName("RS-05 [state transition] valid path Intake -> InTreatment -> ReadyForFoster -> InFoster -> ReadyForAdoption")
    void validTransitions() throws Exception {
        String officer = login(RESCUE);
        String id = createCase(officer, "Pathfinder");
        moveTo(officer, id, "InTreatment");
        moveTo(officer, id, "ReadyForFoster");
        moveTo(officer, id, "InFoster");
        moveTo(officer, id, "ReadyForAdoption");
        assertEquals("ReadyForAdoption", body(get("/rescue/cases/" + id, officer)).get("status").asText());
    }

    @Test
    @DisplayName("RS-06 [state transition] illegal jumps are rejected (Intake->Adopted, Closed->anything)")
    void illegalTransitions() throws Exception {
        String officer = login(RESCUE);
        String id = createCase(officer, "Jumper");
        MvcResult bad = put("/rescue/cases/" + id, officer, Map.of("status", "Adopted"));
        assertEquals(400, status(bad));
        assertTrue(message(bad).contains("Invalid status transition"));

        moveTo(officer, id, "Closed");
        assertEquals(400, status(put("/rescue/cases/" + id, officer, Map.of("status", "Intake"))));
    }

    @Test
    @DisplayName("RS-07 [rule] a case that is not ReadyForAdoption cannot be published")
    void publishRequiresReadyForAdoption() throws Exception {
        String officer = login(RESCUE);
        String id = createCase(officer, "Early");
        MvcResult res = put("/rescue/cases/" + id, officer, Map.of("isPublishedForAdoption", true));
        assertEquals(400, status(res));
    }

    @Test
    @DisplayName("RS-08 [FR-05] progress logs and photos are attached to a case")
    void logsAndPhotos() throws Exception {
        String officer = login(RESCUE);
        String vet = login(VET);
        String id = createCase(officer, "Documented");

        Map<String, Object> log = new LinkedHashMap<>();
        log.put("loggedBy", "Dr. Sachini");
        log.put("logType", "Medical");
        log.put("title", "Wound cleaned");
        log.put("notes", "Antibiotic started");
        assertEquals(201, status(post("/rescue/cases/" + id + "/logs", vet, log)));

        Map<String, Object> photo = Map.of("photoUrl", "https://example.com/rex.jpg", "caption", "After treatment");
        assertEquals(201, status(post("/rescue/cases/" + id + "/photos", officer, photo)));

        MvcResult res = get("/rescue/cases/" + id, officer);
        assertEquals(2, body(res).get("progressLogs").size());   // intake log + vet log
        assertEquals(1, body(res).get("photos").size());
    }

    @Test
    @DisplayName("RS-09 [FR-05] foster records: create, list, update, validate capacity")
    void fosterRecords() throws Exception {
        String officer = login(RESCUE);
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("fullName", "Perera Family");
        f.put("phone", "0771234567");
        f.put("email", "perera.family@example.com");
        f.put("maxCapacity", 2);
        f.put("activePlacements", 0);
        MvcResult created = post("/rescue/fosters", officer, f);
        assertEquals(201, status(created));
        String fosterId = body(created).get("fosterId").asText();

        f.put("activePlacements", 3);   // more than capacity 2
        assertEquals(400, status(put("/rescue/fosters/" + fosterId, officer, f)));

        f.put("activePlacements", 1);
        MvcResult upd = put("/rescue/fosters/" + fosterId, officer, f);
        assertEquals(200, status(upd));
        assertEquals(1, body(upd).get("activePlacements").asInt());

        assertEquals(403, status(get("/rescue/fosters", login(OWNER))));
    }

    @Test
    @DisplayName("RS-10 [FR-05] assigning a foster moves the case to InFoster")
    void assignFoster() throws Exception {
        String officer = login(RESCUE);
        String id = createCase(officer, "Fostered");
        MvcResult res = post("/rescue/cases/" + id + "/foster", officer, Map.of("fosterId", "FST-001", "fosterName", "Perera Family"));
        assertEquals(200, status(res));
        assertEquals("InFoster", body(res).get("status").asText());
    }

    // ------------------------------------------------------------------ FR-06 adoption

    private String readyAndPublished(String officer, String name) throws Exception {
        String id = createCase(officer, name);
        moveTo(officer, id, "InTreatment");
        moveTo(officer, id, "ReadyForAdoption");
        MvcResult pub = post("/adoptions/listings", officer, Map.of("caseId", id));
        assertEquals(201, status(pub), pub.getResponse().getContentAsString());
        return id;
    }

    @Test
    @DisplayName("AD-01 [FR-06] officer lists a ReadyForAdoption pet; it appears in the PUBLIC gallery without login")
    void publishAppearsInPublicGallery() throws Exception {
        String officer = login(RESCUE);
        String id = readyAndPublished(officer, "Gallery Star");
        MvcResult res = get("/adoptions/listings", null);
        assertEquals(200, status(res));
        boolean found = false;
        for (var n : body(res)) {
            if (id.equals(n.get("caseId").asText())) found = true;
        }
        assertTrue(found, "published listing should be visible publicly");
    }

    @Test
    @DisplayName("AD-02 [rule] listing a case that is only in Intake is rejected")
    void listingNeedsReadyForAdoption() throws Exception {
        String officer = login(RESCUE);
        String id = createCase(officer, "TooSoon");
        assertEquals(400, status(post("/adoptions/listings", officer, Map.of("caseId", id))));
    }

    @Test
    @DisplayName("AD-03 [FR-06] owner applies; officer approves; case becomes Adopted and is unpublished")
    void applyAndApprove() throws Exception {
        String officer = login(RESCUE);
        String owner = login(OWNER);
        String id = readyAndPublished(officer, "Lucky");

        Map<String, Object> app = new LinkedHashMap<>();
        app.put("caseId", id);
        app.put("applicationType", "Adoption");
        app.put("applicantPhone", "0771234567");
        MvcResult submitted = post("/adoptions/applications", owner, app);
        assertEquals(201, status(submitted));
        assertEquals("Submitted", body(submitted).get("status").asText());
        String appId = body(submitted).get("applicationId").asText();

        Map<String, Object> review = Map.of("status", "Approved", "reviewNotes", "Home visit passed");
        MvcResult approved = post("/adoptions/applications/" + appId + "/review", officer, review);
        assertEquals(200, status(approved));
        assertEquals("Approved", body(approved).get("status").asText());

        assertEquals("Adopted", body(get("/rescue/cases/" + id, officer)).get("status").asText());
        for (var n : body(get("/adoptions/listings", null))) {
            assertNotEquals(id, n.get("caseId").asText(), "adopted pet must leave the public gallery");
        }
    }

    @Test
    @DisplayName("AD-04 [access control] an owner cannot review an application, and cannot see others' applications")
    void applicationAccessControl() throws Exception {
        String officer = login(RESCUE);
        String owner = login(OWNER);
        String other = login(OTHER_OWNER);
        String id = readyAndPublished(officer, "Contested");
        MvcResult submitted = post("/adoptions/applications", owner, Map.of("caseId", id, "applicationType", "Adoption"));
        assertEquals(201, status(submitted));
        String appId = body(submitted).get("applicationId").asText();

        assertEquals(403, status(post("/adoptions/applications/" + appId + "/review", owner, Map.of("status", "Approved"))));
        assertEquals(403, status(get("/adoptions/applications/" + appId, other)));
    }

    @Test
    @DisplayName("AD-05 [EP invalid] review with unknown status is rejected; application for unknown case is 404")
    void reviewValidation() throws Exception {
        String officer = login(RESCUE);
        String owner = login(OWNER);
        String id = readyAndPublished(officer, "Reviewed");
        String appId = body(post("/adoptions/applications", owner, Map.of("caseId", id))).get("applicationId").asText();
        assertEquals(400, status(post("/adoptions/applications/" + appId + "/review", officer, Map.of("status", "Banana"))));
        assertEquals(404, status(post("/adoptions/applications", owner, Map.of("caseId", "RSC-0000-000"))));
    }

    @Test
    @DisplayName("AD-06 [FR-06] rejecting an application keeps the pet published")
    void rejectKeepsPublished() throws Exception {
        String officer = login(RESCUE);
        String owner = login(OWNER);
        String id = readyAndPublished(officer, "StillWaiting");
        String appId = body(post("/adoptions/applications", owner, Map.of("caseId", id))).get("applicationId").asText();
        MvcResult rej = post("/adoptions/applications/" + appId + "/review", officer, Map.of("status", "Rejected", "reviewNotes", "Unsuitable home"));
        assertEquals(200, status(rej));
        assertEquals("ReadyForAdoption", body(get("/rescue/cases/" + id, officer)).get("status").asText());
    }

    @Test
    @DisplayName("AD-07 [error guessing] deleting a case removes it; unknown case -> 404")
    void deleteCase() throws Exception {
        String officer = login(RESCUE);
        String id = createCase(officer, "Disposable");
        assertEquals(204, status(delete("/rescue/cases/" + id, officer)));
        assertEquals(404, status(get("/rescue/cases/" + id, officer)));
        assertEquals(403, status(delete("/rescue/cases/" + id, login(OWNER))));
    }
}
