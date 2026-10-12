package com.petnexus.backend.blackbox;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Minor functions of the proposal (section 7) and cross-cutting security (NFR-02).
 * Login / Password recovery / Document upload / Notifications / Account approval workflow / RBAC.
 */
class BB7_MinorFunctionsAndSecurityTest extends BlackBoxSupport {

    @Autowired
    private UserRepository userRepository;      // grey-box: stands in for "reading the e-mail"
    @Autowired
    private JwtService jwtService;

    private String registerOwner(String email) throws Exception {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("email", email);
        r.put("password", "Kav@2024");
        r.put("fullName", "Test Person");
        r.put("phone", "0712345678");
        r.put("role", "PetOwner");
        MvcResult res = post("/auth/register", null, r);
        assertEquals(201, status(res));
        return body(res).get("userId").asText();
    }

    // ------------------------------------------------------------------ login / logout

    @Test
    @DisplayName("MN-01 [EP valid] login returns a signed JWT and the user profile without password data")
    void loginValid() throws Exception {
        MvcResult res = post("/auth/login", null, Map.of("email", OWNER, "password", PASSWORD));
        assertEquals(200, status(res));
        assertFalse(body(res).get("token").asText().isEmpty());
        assertEquals("PetOwner", body(res).get("user").get("role").asText());
        assertFalse(res.getResponse().getContentAsString().toLowerCase().contains("passwordhash"));
    }

    @Test
    @DisplayName("MN-02 [EP invalid] wrong password and unknown e-mail give the same generic message (no enumeration)")
    void loginInvalid() throws Exception {
        MvcResult wrong = post("/auth/login", null, Map.of("email", OWNER, "password", "WrongPass999"));
        MvcResult unknown = post("/auth/login", null, Map.of("email", "nobody@nowhere.com", "password", "WrongPass999"));
        assertEquals(400, status(wrong));
        assertEquals(400, status(unknown));
        assertEquals(message(wrong), message(unknown));
        assertFalse(wrong.getResponse().getContentAsString().contains("token"));
    }

    @Test
    @DisplayName("MN-03 [EP invalid] blank e-mail / password / malformed e-mail -> 400")
    void loginBlank() throws Exception {
        assertEquals(400, status(post("/auth/login", null, Map.of("email", "", "password", PASSWORD))));
        assertEquals(400, status(post("/auth/login", null, Map.of("email", OWNER, "password", ""))));
        assertEquals(400, status(post("/auth/login", null, Map.of("email", "not-an-email", "password", PASSWORD))));
    }

    @Test
    @DisplayName("MN-04 [error guessing] SQL-injection style input is treated as plain text")
    void sqlInjectionAttempt() throws Exception {
        MvcResult res = post("/auth/login", null, Map.of("email", "' OR '1'='1", "password", "' OR '1'='1"));
        assertEquals(400, status(res));
        assertEquals(400, status(post("/auth/login", null, Map.of("email", "owner@petnexus.com' --", "password", "x"))));
    }

    // ------------------------------------------------------------------ approval workflow

    @Test
    @DisplayName("MN-05 [workflow] new account cannot log in until the admin approves it")
    void approvalWorkflow() throws Exception {
        String email = uniqueEmail("flow");
        String userId = registerOwner(email);
        MvcResult pending = post("/auth/login", null, Map.of("email", email, "password", "Kav@2024"));
        assertEquals(400, status(pending));
        assertTrue(message(pending).toLowerCase().contains("approval"));

        String admin = login(ADMIN);
        assertEquals(200, status(post("/users/" + userId + "/approve", admin, null)));
        assertEquals(200, status(post("/auth/login", null, Map.of("email", email, "password", "Kav@2024"))));
    }

    @Test
    @DisplayName("MN-06 [workflow] rejected account sees the reason; suspended is blocked; reactivated can log in again")
    void rejectSuspendReactivate() throws Exception {
        String email = uniqueEmail("rsr");
        String userId = registerOwner(email);
        String admin = login(ADMIN);

        assertEquals(200, status(post("/users/" + userId + "/reject", admin, Map.of("rejectionReason", "Documents unclear"))));
        MvcResult rej = post("/auth/login", null, Map.of("email", email, "password", "Kav@2024"));
        assertEquals(400, status(rej));
        assertTrue(message(rej).contains("Documents unclear"));

        assertEquals(200, status(post("/users/" + userId + "/reactivate", admin, null)));
        assertEquals(200, status(post("/auth/login", null, Map.of("email", email, "password", "Kav@2024"))));

        assertEquals(200, status(post("/users/" + userId + "/suspend", admin, Map.of("suspensionReason", "Policy breach"))));
        MvcResult sus = post("/auth/login", null, Map.of("email", email, "password", "Kav@2024"));
        assertEquals(400, status(sus));
        assertTrue(message(sus).contains("suspended"));
    }

    @Test
    @DisplayName("MN-07 [rule] the System Administrator account cannot be suspended")
    void adminCannotBeSuspended() throws Exception {
        String admin = login(ADMIN);
        assertEquals(400, status(post("/users/USR-007/suspend", admin, Map.of("suspensionReason", "test"))));
    }

    @Test
    @DisplayName("MN-08 [workflow] approval token: pending until approved, then exchanged once for a JWT")
    void approvalTokenFlow() throws Exception {
        String email = uniqueEmail("tok");
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("email", email);
        r.put("password", "Kav@2024");
        r.put("fullName", "Token Person");
        r.put("role", "PetOwner");
        MvcResult reg = post("/auth/register", null, r);
        String userId = body(reg).get("userId").asText();
        String token = body(reg).get("approvalToken").asText();

        assertEquals(400, status(post("/auth/approval-login", null, Map.of("approvalToken", token))));
        assertFalse(body(get("/auth/approval-status?token=" + token, null)).get("approved").asBoolean());

        post("/users/" + userId + "/approve", login(ADMIN), null);
        assertTrue(body(get("/auth/approval-status?token=" + token, null)).get("approved").asBoolean());
        MvcResult ok = post("/auth/approval-login", null, Map.of("approvalToken", token));
        assertEquals(200, status(ok));
        assertNotNull(body(ok).get("token"));
        assertEquals(400, status(post("/auth/approval-login", null, Map.of("approvalToken", token))), "token is single use");
    }

    // ------------------------------------------------------------------ password recovery

    @Test
    @DisplayName("MN-09 [security] forgot-password gives the same answer for existing and unknown e-mails")
    void forgotPasswordNoEnumeration() throws Exception {
        MvcResult known = post("/auth/forgot-password", null, Map.of("email", OWNER));
        MvcResult unknown = post("/auth/forgot-password", null, Map.of("email", "ghost@nowhere.com"));
        assertEquals(200, status(known));
        assertEquals(200, status(unknown));
        assertEquals(body(known).get("message").asText(), body(unknown).get("message").asText());
    }

    @Test
    @DisplayName("MN-10 [workflow] reset password with the e-mailed token; old password stops working; token is single use")
    void resetPasswordFlow() throws Exception {
        post("/auth/forgot-password", null, Map.of("email", OTHER_OWNER));
        User u = userRepository.findByEmail(OTHER_OWNER).orElseThrow();
        String resetToken = u.getPasswordResetToken();
        assertNotNull(resetToken, "token must be generated and e-mailed");

        assertEquals(400, status(post("/auth/reset-password", null, Map.of("token", resetToken, "newPassword", "short"))));
        assertEquals(200, status(post("/auth/reset-password", null, Map.of("token", resetToken, "newPassword", "NewPass123"))));
        assertEquals(400, status(post("/auth/login", null, Map.of("email", OTHER_OWNER, "password", PASSWORD))));
        assertEquals(200, status(post("/auth/login", null, Map.of("email", OTHER_OWNER, "password", "NewPass123"))));
        assertEquals(400, status(post("/auth/reset-password", null, Map.of("token", resetToken, "newPassword", "Another123"))));
    }

    @Test
    @DisplayName("MN-11 [EP invalid] reset with a made-up token -> 400")
    void resetWithBadToken() throws Exception {
        assertEquals(400, status(post("/auth/reset-password", null, Map.of("token", "made-up-token", "newPassword", "NewPass123"))));
    }

    @Test
    @DisplayName("MN-12 change password needs the correct current password and only works for yourself")
    void changePassword() throws Exception {
        String owner = login(OWNER);
        Map<String, Object> wrong = Map.of("currentPassword", "WrongOne1", "newPassword", "Brand0New1");
        assertEquals(400, status(post("/users/USR-001/change-password", owner, wrong)));
        assertEquals(403, status(post("/users/USR-013/change-password", owner,
                Map.of("currentPassword", PASSWORD, "newPassword", "Brand0New1"))));
        assertEquals(200, status(post("/users/USR-001/change-password", owner,
                Map.of("currentPassword", PASSWORD, "newPassword", "Brand0New1"))));
        assertEquals(200, status(post("/auth/login", null, Map.of("email", OWNER, "password", "Brand0New1"))));
    }

    // ------------------------------------------------------------------ document upload

    @Test
    @DisplayName("MN-13 [EP valid] owner uploads a vaccination certificate for their pet; stranger cannot read it")
    void documentUpload() throws Exception {
        String owner = login(OWNER);
        String other = login(OTHER_OWNER);
        String petId = createPet(owner, "Documented", 3);
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("petId", petId);
        d.put("documentType", "Vaccination Certificate");
        d.put("fileName", "rabies.pdf");
        d.put("fileUrl", "data:application/pdf;base64,JVBERi0xLjQK");
        d.put("fileSize", "12 KB");
        MvcResult up = post("/pet-documents", owner, d);
        assertEquals(201, status(up));
        String docId = body(up).get("documentId").asText();
        assertEquals(200, status(get("/pet-documents/" + docId, owner)));
        assertEquals(403, status(get("/pet-documents/" + docId, other)));
    }

    @Test
    @DisplayName("MN-14 [EP invalid] document without type or file name -> 400")
    void documentValidation() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Docless", 3);
        assertEquals(400, status(post("/pet-documents", owner, Map.of("petId", petId, "fileName", "a.pdf"))));
        assertEquals(400, status(post("/pet-documents", owner, Map.of("petId", petId, "documentType", "Report"))));
    }

    // ------------------------------------------------------------------ notifications

    @Test
    @DisplayName("MN-15 notifications: list own, mark one read, mark all read; others' notifications are forbidden")
    void notifications() throws Exception {
        String owner = login(OWNER);
        String petId = createPet(owner, "Notified", 3);
        Map<String, Object> book = new LinkedHashMap<>();
        book.put("petId", petId);
        book.put("ownerId", "USR-001");
        book.put("vetId", "USR-002");
        book.put("vetName", VET_NAME);
        book.put("serviceType", "Checkup");
        book.put("appointmentDate", farFuture(30).toString());
        book.put("timeSlot", "09:00 AM");
        book.put("reason", "Annual checkup");
        assertEquals(201, status(post("/appointments", owner, book)));

        MvcResult list = get("/notifications", owner);
        assertEquals(200, status(list));
        assertTrue(body(list).size() > 0);
        String first = null;
        for (var n : body(list)) {
            if (n.get("title").asText().startsWith("Appointment")) {
                first = n.get("notificationId").asText();
                break;
            }
        }
        assertNotNull(first, "booking an appointment must create an appointment notification");

        assertEquals(200, status(put("/notifications/" + first + "/read", owner, null)));
        assertEquals(200, status(put("/notifications/read-all?userId=USR-001", owner, null)));
        for (var n : body(get("/notifications", owner))) {
            assertTrue(n.get("isRead").asBoolean() || n.get("read").asBoolean());
        }
        assertEquals(403, status(get("/notifications?userId=USR-013", owner)));
        assertEquals(403, status(put("/notifications/read-all?userId=USR-013", owner, null)));
    }

    // ------------------------------------------------------------------ NFR-02 security / RBAC

    @Test
    @DisplayName("SE-01 protected endpoints return 401 without a token; public endpoints stay open")
    void authenticationRequired() throws Exception {
        for (String p : new String[]{"/pets", "/appointments", "/inventory", "/users", "/notifications", "/feedback", "/prescriptions", "/suppliers"}) {
            assertEquals(401, status(get(p, null)), p);
        }
        for (String p : new String[]{"/care-services", "/packages", "/adoptions/listings", "/rescue/cases"}) {
            assertEquals(200, status(get(p, null)), p);
        }
    }

    @Test
    @DisplayName("SE-02 garbage, tampered and expired tokens are rejected")
    void badTokens() throws Exception {
        assertEquals(401, status(get("/pets", "not.a.jwt")));
        String valid = login(OWNER);
        assertEquals(401, status(get("/pets", valid.substring(0, valid.length() - 3) + "abc")));
        User u = userRepository.findByEmail(OWNER).orElseThrow();
        String expired = jwtService.generateTokenWithExpiration(u, -1000);
        assertEquals(401, status(get("/pets", expired)));
    }

    @Test
    @DisplayName("SE-03 a suspended user's existing token stops working immediately")
    void suspendedTokenRevoked() throws Exception {
        String email = uniqueEmail("susp");
        String userId = registerOwner(email);
        String admin = login(ADMIN);
        post("/users/" + userId + "/approve", admin, null);
        String token = body(post("/auth/login", null, Map.of("email", email, "password", "Kav@2024"))).get("token").asText();
        assertEquals(200, status(get("/pets", token)));
        post("/users/" + userId + "/suspend", admin, Map.of("suspensionReason", "test"));
        assertEquals(401, status(get("/pets", token)));
    }

    @Test
    @DisplayName("SE-04 role matrix: admin-only user management is closed to every other role")
    void adminOnlyEndpoints() throws Exception {
        for (String who : new String[]{OWNER, VET, STAFF, PROVIDER, MANAGER, RESCUE}) {
            String t = login(who);
            assertEquals(403, status(get("/users/pending-approvals", t)), who);
            assertEquals(403, status(get("/admin/approval-history", t)), who);
            assertEquals(403, status(post("/users/USR-001/suspend", t, Map.of())), who);
        }
        assertEquals(200, status(get("/users/pending-approvals", login(ADMIN))));
    }

    @Test
    @DisplayName("SE-05 role claim in a forged token cannot grant privileges (role is read from the database)")
    void forgedRoleClaim() throws Exception {
        // A valid token for a PetOwner must stay a PetOwner whatever it claims.
        String owner = login(OWNER);
        assertEquals(403, status(get("/users/pending-approvals", owner)));
        assertEquals("PetOwner", body(get("/auth/me", owner)).get("role").asText());
    }

    @Test
    @DisplayName("SE-06 error responses never leak stack traces or SQL")
    void noStackTraceLeak() throws Exception {
        String owner = login(OWNER);
        MvcResult res = post("/pets", owner, "{ this is not json");
        assertEquals(400, status(res));
        String text = res.getResponse().getContentAsString();
        assertFalse(text.contains("Exception") || text.contains("at com.") || text.toLowerCase().contains("select "));
    }
}
