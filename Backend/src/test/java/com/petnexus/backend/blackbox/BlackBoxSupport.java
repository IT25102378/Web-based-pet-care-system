package com.petnexus.backend.blackbox;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Shared plumbing for the black-box suites.
 *
 * Black-box = the tests only know the public HTTP contract (URL, verb, JSON in, status + JSON out).
 * Requests go through the REAL filter chain (CORS, JWT filter, @PreAuthorize, bean validation,
 * exception handler), exactly as the browser would hit the website.
 *
 * Every test is @Transactional, so all data it creates is rolled back and the shared
 * PetNexus database is left untouched.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BlackBoxSupport {

    protected static final String PASSWORD = "password123";

    // Seeded demo accounts (DataInitializer)
    protected static final String OWNER = "owner@petnexus.com";       // USR-001 PetOwner
    protected static final String VET = "vet@petnexus.com";          // USR-002 Veterinarian
    protected static final String STAFF = "staff@petnexus.com";      // USR-003 ClinicStaff
    protected static final String PROVIDER = "provider@petnexus.com"; // USR-004 PetCareProvider
    protected static final String MANAGER = "manager@petnexus.com";  // USR-005 ClinicManager
    protected static final String RESCUE = "rescue@petnexus.com";    // USR-006 RescueOfficer
    protected static final String ADMIN = "admin@petnexus.com";      // USR-007 Admin
    protected static final String OTHER_OWNER = "ifaza@petnexus.com"; // USR-013 PetOwner

    protected static final String VET_NAME = "Dr. Sachini Wijesinghe, BVSc";

    private static final AtomicInteger SEQ = new AtomicInteger(1);

    @Autowired
    private WebApplicationContext context;

    protected MockMvc mvc;
    // Plain Jackson mapper: only used to build request JSON and read responses (dates are sent as ISO strings)
    protected final ObjectMapper json = new ObjectMapper();

    @BeforeEach
    void buildMockMvc() {
        // Real Spring Security filter chain (JWT filter + method security) in front of the real controllers
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    // --------------------------------------------------------------- request helpers

    protected MvcResult call(HttpMethod method, String path, String token, Object body) throws Exception {
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.request(method, "/api" + path)
                .servletPath("/api");
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON)
               .content(body instanceof String s ? s : json.writeValueAsString(body));
        }
        return mvc.perform(req).andReturn();
    }

    protected MvcResult get(String path, String token) throws Exception {
        return call(HttpMethod.GET, path, token, null);
    }

    protected MvcResult post(String path, String token, Object body) throws Exception {
        return call(HttpMethod.POST, path, token, body);
    }

    protected MvcResult put(String path, String token, Object body) throws Exception {
        return call(HttpMethod.PUT, path, token, body);
    }

    protected MvcResult delete(String path, String token) throws Exception {
        return call(HttpMethod.DELETE, path, token, null);
    }

    /** Logs in through the real endpoint and returns the JWT. */
    protected String login(String email) throws Exception {
        MvcResult res = post("/auth/login", null, Map.of("email", email, "password", PASSWORD));
        if (res.getResponse().getStatus() != 200) {
            throw new IllegalStateException("Login failed for " + email + ": "
                    + res.getResponse().getStatus() + " " + res.getResponse().getContentAsString());
        }
        return body(res).get("token").asText();
    }

    // --------------------------------------------------------------- response helpers

    protected JsonNode body(MvcResult res) throws Exception {
        String content = res.getResponse().getContentAsString();
        return content.isEmpty() ? json.createObjectNode() : json.readTree(content);
    }

    protected int status(MvcResult res) {
        return res.getResponse().getStatus();
    }

    protected String message(MvcResult res) throws Exception {
        JsonNode n = body(res);
        return n.has("message") ? n.get("message").asText() : "";
    }

    // --------------------------------------------------------------- data helpers

    protected static String uniqueEmail(String prefix) {
        return prefix + "." + System.nanoTime() + "." + SEQ.getAndIncrement() + "@bbtest.com";
    }

    /** A date far enough in the future that no seeded appointment can occupy the slot. */
    protected static LocalDate farFuture(int offsetDays) {
        return LocalDate.now().plusDays(400 + offsetDays);
    }

    /** Registers a pet for the owner and returns its petId. */
    protected String createPet(String ownerToken, String name, int ageYears) throws Exception {
        Map<String, Object> pet = new java.util.LinkedHashMap<>();
        pet.put("name", name);
        pet.put("species", "Dog");
        pet.put("breed", "Labrador");
        pet.put("gender", "Male");
        pet.put("ageYears", ageYears);
        MvcResult res = post("/pets", ownerToken, pet);
        if (status(res) != 201 && status(res) != 200) {
            throw new IllegalStateException("createPet failed: " + status(res) + " " + res.getResponse().getContentAsString());
        }
        return body(res).get("petId").asText();
    }
}
