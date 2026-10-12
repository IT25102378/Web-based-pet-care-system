package com.petnexus.backend.blackbox;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * BLACK-BOX: Pet care provider directory (supports FR-07 / stakeholder "Pet care provider").
 * Closes the gap found by the coverage report (CareProviderService had no tests).
 */
class BB8_CareProviderDirectoryTest extends BlackBoxSupport {

    private String newProviderUser() throws Exception {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("email", uniqueEmail("prov"));
        r.put("password", "Prov@2024");
        r.put("fullName", "New Provider");
        r.put("phone", "0712345678");
        r.put("role", "PetCareProvider");
        MvcResult res = post("/auth/register", null, r);
        assertEquals(201, status(res));
        return body(res).get("userId").asText();
    }

    private Map<String, Object> provider(String providerId, String userId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("providerId", providerId);
        m.put("userId", userId);
        m.put("providerName", "Paws Grooming");
        m.put("contactPhone", "0771112233");
        m.put("contactEmail", "paws@example.com");
        m.put("active", true);
        return m;
    }

    @Test
    @DisplayName("CP-01 manager registers a provider linked to a provider-role user; list and fetch show it")
    void createListFetch() throws Exception {
        String manager = login(MANAGER);
        String userId = newProviderUser();
        String pid = "PRV-" + (System.nanoTime() % 100000);
        MvcResult created = post("/care-providers", manager, provider(pid, userId));
        assertEquals(201, status(created), created.getResponse().getContentAsString());
        assertEquals(userId, body(created).get("userId").asText());

        assertEquals(200, status(get("/care-providers/" + pid, manager)));
        boolean listed = false;
        for (var n : body(get("/care-providers", manager))) {
            if (pid.equals(n.get("providerId").asText())) listed = true;
        }
        assertTrue(listed);
    }

    @Test
    @DisplayName("CP-02 [rule] user must exist, must have the PetCareProvider role, provider id and user link must be unique")
    void createRules() throws Exception {
        String manager = login(MANAGER);
        String pid = "PRV-" + (System.nanoTime() % 100000);

        assertEquals(404, status(post("/care-providers", manager, provider(pid, "USR-NOPE"))));
        assertEquals(400, status(post("/care-providers", manager, provider(pid, "USR-001"))), "pet owner is not a provider");

        String userId = newProviderUser();
        assertEquals(201, status(post("/care-providers", manager, provider(pid, userId))));
        assertEquals(400, status(post("/care-providers", manager, provider(pid, userId))), "duplicate provider id");
        assertEquals(400, status(post("/care-providers", manager, provider(pid + "X", userId))), "user already linked");
    }

    @Test
    @DisplayName("CP-03 [EP invalid] missing provider name / invalid phone -> 400")
    void createValidation() throws Exception {
        String manager = login(MANAGER);
        String userId = newProviderUser();
        Map<String, Object> noName = provider("PRV-V1", userId);
        noName.put("providerName", "");
        assertEquals(400, status(post("/care-providers", manager, noName)));
        Map<String, Object> badPhone = provider("PRV-V2", userId);
        badPhone.put("contactPhone", "123");
        assertEquals(400, status(post("/care-providers", manager, badPhone)));
    }

    @Test
    @DisplayName("CP-04 [cross-module] a deactivated provider cannot start new care sessions; reactivating restores it")
    void deactivatedProviderBlocked() throws Exception {
        String manager = login(MANAGER);
        String owner = login(OWNER);
        String provToken = login(PROVIDER);
        String userId = newProviderUser();
        String pid = "PRV-" + (System.nanoTime() % 100000);
        assertEquals(201, status(post("/care-providers", manager, provider(pid, userId))));
        String petId = createPet(owner, "Provided", 3);

        Map<String, Object> log = new LinkedHashMap<>();
        log.put("petId", petId);
        log.put("serviceType", "Bath");
        log.put("providerId", pid);

        MvcResult off = put("/care-providers/" + pid + "/deactivate", manager, null);
        assertEquals(200, status(off));
        assertFalse(body(off).get("active").asBoolean());
        assertEquals(400, status(post("/care-services/logs", provToken, log)));

        assertEquals(200, status(put("/care-providers/" + pid + "/activate", manager, null)));
        assertEquals(201, status(post("/care-services/logs", provToken, log)));
    }

    @Test
    @DisplayName("CP-05 update and delete work for manager; owner and provider roles cannot write")
    void updateDeleteAndRoles() throws Exception {
        String manager = login(MANAGER);
        String userId = newProviderUser();
        String pid = "PRV-" + (System.nanoTime() % 100000);
        post("/care-providers", manager, provider(pid, userId));

        MvcResult upd = put("/care-providers/" + pid, manager, Map.of("providerName", "Renamed Grooming", "contactPhone", "0775556677"));
        assertEquals(200, status(upd));
        assertEquals("Renamed Grooming", body(upd).get("providerName").asText());

        assertEquals(403, status(put("/care-providers/" + pid, login(OWNER), Map.of("providerName", "Hack"))));
        assertEquals(403, status(delete("/care-providers/" + pid, login(PROVIDER))));
        assertTrue(status(delete("/care-providers/" + pid, manager)) / 100 == 2);
        assertEquals(404, status(get("/care-providers/" + pid, manager)));
    }
}
