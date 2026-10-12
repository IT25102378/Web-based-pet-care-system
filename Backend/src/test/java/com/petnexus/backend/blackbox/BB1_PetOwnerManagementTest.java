package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Major Function 6.1 - Pet & Owner Management  (FR-01)
 * Techniques: equivalence partitioning, boundary value analysis, error guessing, access-control matrix.
 */
class BB1_PetOwnerManagementTest extends BlackBoxSupport {

    private Map<String, Object> registration(String email, String password, String name, String phone) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("email", email);
        m.put("password", password);
        m.put("fullName", name);
        m.put("phone", phone);
        m.put("address", "45/3 Galle Road, Colombo 06");
        m.put("role", "PetOwner");
        return m;
    }

    private Map<String, Object> pet(String name) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        m.put("species", "Dog");
        m.put("breed", "Golden Retriever");
        m.put("gender", "Male");
        return m;
    }

    // ------------------------------------------------------------------ owner registration

    @Test
    @DisplayName("PO-01 [EP valid] register a new pet owner -> 201 and account is pending approval")
    void registerValidOwner() throws Exception {
        MvcResult res = post("/auth/register", null, registration(uniqueEmail("kav"), "Kav@2024", "Kavindu Perera", "0712345678"));
        assertEquals(201, status(res));
        assertTrue(body(res).get("userId").asText().startsWith("USR-"));
        assertTrue(message(res).toLowerCase().contains("pending"));
    }

    @Test
    @DisplayName("PO-02 [EP invalid] duplicate e-mail is rejected with 409")
    void registerDuplicateEmail() throws Exception {
        assertEquals(409, status(post("/auth/register", null,
                registration(OWNER, "Kav@2024", "Kavindu Perera", "0712345678"))));
    }

    @Test
    @DisplayName("PO-03 [EP invalid] Admin role cannot be self-registered")
    void registerAdminBlocked() throws Exception {
        Map<String, Object> r = registration(uniqueEmail("adm"), "Kav@2024", "Fake Admin", "0712345678");
        r.put("role", "Admin");
        MvcResult res = post("/auth/register", null, r);
        assertEquals(400, status(res));
    }

    @Test
    @DisplayName("PO-04 [BVA] password length 7 rejected, 8 accepted")
    void passwordLengthBoundary() throws Exception {
        assertEquals(400, status(post("/auth/register", null,
                registration(uniqueEmail("p7"), "Abcde12", "Kavindu Perera", "0712345678"))));
        assertEquals(201, status(post("/auth/register", null,
                registration(uniqueEmail("p8"), "Abcdef12", "Kavindu Perera", "0712345678"))));
    }

    @Test
    @DisplayName("PO-05 [EP invalid] password without a digit is rejected")
    void passwordNeedsDigit() throws Exception {
        assertEquals(400, status(post("/auth/register", null,
                registration(uniqueEmail("nd"), "OnlyLetters", "Kavindu Perera", "0712345678"))));
    }

    @Test
    @DisplayName("PO-06 [BVA] phone: 9 digits rejected, 10 digits accepted, 11 digits rejected, not starting with 0 rejected")
    void phoneBoundary() throws Exception {
        assertEquals(400, status(post("/auth/register", null, registration(uniqueEmail("ph9"), "Kav@2024", "Kavindu Perera", "071234567"))));
        assertEquals(201, status(post("/auth/register", null, registration(uniqueEmail("ph10"), "Kav@2024", "Kavindu Perera", "0712345678"))));
        assertEquals(400, status(post("/auth/register", null, registration(uniqueEmail("ph11"), "Kav@2024", "Kavindu Perera", "07123456789"))));
        assertEquals(400, status(post("/auth/register", null, registration(uniqueEmail("phx"), "Kav@2024", "Kavindu Perera", "7123456789"))));
    }

    @Test
    @DisplayName("PO-07 [EP invalid] malformed e-mail and numeric name are rejected")
    void emailAndNameValidation() throws Exception {
        assertEquals(400, status(post("/auth/register", null, registration("not-an-email", "Kav@2024", "Kavindu Perera", "0712345678"))));
        assertEquals(400, status(post("/auth/register", null, registration(uniqueEmail("nm"), "Kav@2024", "12345", "0712345678"))));
    }

    @Test
    @DisplayName("PO-08 [error guessing] empty request body is rejected, not a 500")
    void emptyBody() throws Exception {
        int s = status(post("/auth/register", null, "{}"));
        assertEquals(400, s);
    }

    // ------------------------------------------------------------------ pet profile CRUD

    @Test
    @DisplayName("PO-09 [EP valid] owner registers a pet -> 201 with petId and ownerId of the caller")
    void createPet() throws Exception {
        String token = login(OWNER);
        MvcResult res = post("/pets", token, pet("Buddy"));
        assertEquals(201, status(res));
        assertTrue(body(res).get("petId").asText().startsWith("PET-"));
        assertEquals("USR-001", body(res).get("ownerId").asText());
    }

    @Test
    @DisplayName("PO-10 [EP invalid] missing pet name -> 400 with readable message")
    void createPetMissingName() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("");
        MvcResult res = post("/pets", token, p);
        assertEquals(400, status(res));
        assertTrue(message(res).toLowerCase().contains("name"));
    }

    @Test
    @DisplayName("PO-11 [BVA] weight 0 rejected, 0.01 accepted")
    void weightBoundary() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("Weighty");
        p.put("weightKg", 0);
        assertEquals(400, status(post("/pets", token, p)));
        p.put("weightKg", 0.01);
        assertEquals(201, status(post("/pets", token, p)));
    }

    @Test
    @DisplayName("PO-12 [BVA] ageMonths 11 accepted, 12 rejected; ageYears 40 accepted, 41 rejected")
    void ageBoundaries() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("Aged");
        p.put("ageYears", 1);
        p.put("ageMonths", 11);
        assertEquals(201, status(post("/pets", token, p)));
        p.put("ageMonths", 12);
        assertEquals(400, status(post("/pets", token, p)));
        p.put("ageMonths", 0);
        p.put("ageYears", 40);
        assertEquals(201, status(post("/pets", token, p)));
        p.put("ageYears", 41);
        assertEquals(400, status(post("/pets", token, p)));
    }

    @Test
    @DisplayName("PO-13 [EP invalid] date of birth in the future is rejected")
    void futureDob() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("Future");
        p.put("dateOfBirth", LocalDate.now().plusDays(1).toString());
        assertEquals(400, status(post("/pets", token, p)));
    }

    @Test
    @DisplayName("PO-14 [rule] stated age that contradicts the date of birth is rejected")
    void ageMustMatchDob() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("Mismatch");
        p.put("dateOfBirth", LocalDate.now().minusYears(5).toString());
        p.put("ageYears", 1);
        assertEquals(400, status(post("/pets", token, p)));
    }

    @Test
    @DisplayName("PO-15 [EP invalid] pet name with illegal characters is rejected")
    void petNameCharacters() throws Exception {
        String token = login(OWNER);
        assertEquals(400, status(post("/pets", token, pet("@@@###"))));
    }

    @Test
    @DisplayName("PO-16 [EP valid] emergency contact stored on the pet profile")
    void emergencyContactStored() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("Contacty");
        p.put("emergencyContact", "Nimal Perera (Brother) - 0771234567");
        MvcResult res = post("/pets", token, p);
        assertEquals(201, status(res));
        assertEquals("Nimal Perera (Brother) - 0771234567", body(res).get("emergencyContact").asText());
    }

    @Test
    @DisplayName("PO-17 [EP invalid] emergency contact without a phone number is rejected")
    void emergencyContactNeedsPhone() throws Exception {
        String token = login(OWNER);
        Map<String, Object> p = pet("Contacty");
        p.put("emergencyContact", "my brother");
        assertEquals(400, status(post("/pets", token, p)));
    }

    @Test
    @DisplayName("PO-18 [CRUD] update then delete own pet")
    void updateAndDelete() throws Exception {
        String token = login(OWNER);
        String petId = createPet(token, "Updatable", 2);
        Map<String, Object> upd = pet("Renamed");
        MvcResult up = put("/pets/" + petId, token, upd);
        assertEquals(200, status(up));
        assertEquals("Renamed", body(up).get("name").asText());
        assertTrue(status(delete("/pets/" + petId, token)) / 100 == 2, "delete should succeed");
        assertEquals(404, status(get("/pets/" + petId, token)));
    }

    @Test
    @DisplayName("PO-19 [data isolation] an owner only sees their own pets in the list")
    void listIsScopedToOwner() throws Exception {
        String ownerA = login(OWNER);
        String ownerB = login(OTHER_OWNER);
        String petId = createPet(ownerA, "OnlyMine", 2);
        MvcResult res = get("/pets", ownerB);
        assertEquals(200, status(res));
        for (var n : body(res)) {
            assertNotEquals(petId, n.get("petId").asText());
            assertEquals("USR-013", n.get("ownerId").asText());
        }
    }

    @Test
    @DisplayName("PO-20 [access control] owner B cannot read, edit or delete owner A's pet")
    void crossOwnerAccessDenied() throws Exception {
        String ownerA = login(OWNER);
        String ownerB = login(OTHER_OWNER);
        String petId = createPet(ownerA, "Private", 2);
        assertEquals(403, status(get("/pets/" + petId, ownerB)));
        assertEquals(403, status(put("/pets/" + petId, ownerB, pet("Hacked"))));
        assertEquals(403, status(delete("/pets/" + petId, ownerB)));
    }

    // ------------------------------------------------------------------ vaccination details

    @Test
    @DisplayName("PO-21 [role] vet records a vaccination; owner can view it on the pet profile")
    void vaccinationRecordedByVetVisibleToOwner() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "Vaxed", 2);

        Map<String, Object> v = new LinkedHashMap<>();
        v.put("petId", petId);
        v.put("vaccineName", "Rabies");
        v.put("administeredDate", LocalDate.now().minusDays(1).toString());
        v.put("nextDueDate", LocalDate.now().plusYears(1).toString());
        MvcResult add = post("/vaccinations", vet, v);
        assertEquals(201, status(add));

        MvcResult list = get("/vaccinations?petId=" + petId, owner);
        assertEquals(200, status(list));
        assertEquals(1, body(list).size());
        assertEquals("Rabies", body(list).get(0).get("vaccineName").asText());
    }

    @Test
    @DisplayName("PO-22 [rule] vaccination date in the future and due date before administered date are rejected")
    void vaccinationDateRules() throws Exception {
        String owner = login(OWNER);
        String vet = login(VET);
        String petId = createPet(owner, "VaxDates", 2);

        Map<String, Object> v = new LinkedHashMap<>();
        v.put("petId", petId);
        v.put("vaccineName", "Rabies");
        v.put("administeredDate", LocalDate.now().plusDays(3).toString());
        assertEquals(400, status(post("/vaccinations", vet, v)));

        v.put("administeredDate", LocalDate.now().minusDays(1).toString());
        v.put("nextDueDate", LocalDate.now().minusDays(10).toString());
        assertEquals(400, status(post("/vaccinations", vet, v)));
    }

    @Test
    @Tag("known-defect")
    @DisplayName("PO-23 [FR-01 gap check] can a PET OWNER record a vaccination on their own pet?")
    void ownerRecordsVaccination() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "OwnerVax", 2);
        Map<String, Object> v = new LinkedHashMap<>();
        v.put("petId", petId);
        v.put("vaccineName", "Rabies");
        v.put("administeredDate", LocalDate.now().minusDays(1).toString());
        // FR-01: "pet owners ... manage pet and owner profiles, including vaccination ... details"
        assertEquals(201, status(post("/vaccinations", owner, v)),
                "FR-01 says owners manage vaccination details; backend currently restricts writes to vet/staff");
    }

    // ------------------------------------------------------------------ owner profile

    @Test
    @DisplayName("PO-24 [EP valid] owner updates own profile (phone, address, emergency contact)")
    void updateOwnProfile() throws Exception {
        String token = login(OWNER);
        Map<String, Object> upd = new LinkedHashMap<>();
        upd.put("phone", "0771234567");
        upd.put("address", "99 New Street, Kandy");
        upd.put("emergencyContact", "Thilini Perera (Spouse) - 0772349988");
        MvcResult res = put("/users/USR-001", token, upd);
        assertEquals(200, status(res));
        assertEquals("99 New Street, Kandy", body(res).get("address").asText());
    }

    @Test
    @DisplayName("PO-25 [access control] owner cannot edit another user's profile, and cannot change own role")
    void profileAccessControl() throws Exception {
        String token = login(OWNER);
        Map<String, Object> upd = new LinkedHashMap<>();
        upd.put("address", "Hijack Lane");
        assertEquals(403, status(put("/users/USR-013", token, upd)));

        Map<String, Object> escalate = new LinkedHashMap<>();
        escalate.put("role", "Admin");
        escalate.put("address", "Same Street");
        put("/users/USR-001", token, escalate);
        assertEquals("PetOwner", body(get("/auth/me", token)).get("role").asText());
    }
}
