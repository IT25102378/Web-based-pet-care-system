package com.petnexus.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petnexus.backend.dto.ForgotPasswordRequest;
import com.petnexus.backend.dto.LoginRequest;
import com.petnexus.backend.dto.RegisterRequest;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 10A — Authentication & JWT Security Integration Tests.
 *
 * spring.mvc.servlet.path=/api maps the DispatcherServlet at /api/*.
 * With webAppContextSetup, MockMvc routes directly to the DispatcherServlet.
 * We must use the full URL path (/api/auth/...) together with
 * .servletPath("/api") so the pathInfo seen by controllers is /auth/...
 * without the /api prefix — matching @RequestMapping("/auth").
 */
@SpringBootTest
@Transactional
public class Phase10AAuthenticationSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User activeUser;
    private User suspendedUser;
    private User rejectedUser;
    private User pendingEmailUser;
    private User pendingApprovalUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Active User
        activeUser = userRepository.findByEmail("active.test@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-SEC-01")
                        .email("active.test@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Active Test User")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        // Suspended User
        suspendedUser = userRepository.findByEmail("suspended.test@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-SEC-02")
                        .email("suspended.test@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Suspended Test User")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Suspended)
                        .suspensionReason("Policy violation")
                        .build()));

        // Rejected User
        rejectedUser = userRepository.findByEmail("rejected.test@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-SEC-03")
                        .email("rejected.test@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Rejected Test User")
                        .role(UserRole.Veterinarian)
                        .status(UserStatus.Rejected)
                        .rejectionReason("Invalid medical license")
                        .build()));

        // Pending Email Verification User
        pendingEmailUser = userRepository.findByEmail("pending.email@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-SEC-04")
                        .email("pending.email@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Pending Email User")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.PendingEmailVerification)
                        .emailVerificationToken(UUID.randomUUID().toString())
                        .build()));

        // Pending Admin Approval User
        pendingApprovalUser = userRepository.findByEmail("pending.approval@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-SEC-05")
                        .email("pending.approval@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Pending Approval User")
                        .role(UserRole.Veterinarian)
                        .status(UserStatus.PendingApproval)
                        .build()));
    }

    // -------------------------------------------------------------
    // 1. Valid Login Returns Valid Signed JWT Token
    // -------------------------------------------------------------
    @Test
    @DisplayName("1. Valid Login returns JWT and User profile with claims")
    void testValidLoginReturnsJwt() throws Exception {
        LoginRequest loginRequest = new LoginRequest("active.test@petnexus.com", "Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("active.test@petnexus.com"))
                .andExpect(jsonPath("$.user.userId").value("USR-SEC-01"))
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = responseJson.get("token").asText();
        assertNotNull(token);
        assertFalse(token.startsWith("petnexus-")); // Verifies it's a real JWT, not the old placeholder

        // Validate JWT structure and claims
        Claims claims = jwtService.extractAllClaims(token);
        assertEquals("active.test@petnexus.com", claims.getSubject());
        assertEquals("USR-SEC-01", claims.get("userId"));
        assertEquals("PetOwner", claims.get("role"));
        assertEquals("Active Test User", claims.get("fullName"));
        assertTrue(jwtService.isTokenValid(token, activeUser));
    }

    // -------------------------------------------------------------
    // 2. Invalid Password Rejected
    // -------------------------------------------------------------
    @Test
    @DisplayName("2. Invalid Password Rejected (400)")
    void testInvalidPasswordRejected() throws Exception {
        LoginRequest loginRequest = new LoginRequest("active.test@petnexus.com", "WrongPassword999!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    // -------------------------------------------------------------
    // 3. Unknown Email Rejected
    // -------------------------------------------------------------
    @Test
    @DisplayName("3. Unknown Email Rejected (400)")
    void testUnknownEmailRejected() throws Exception {
        LoginRequest loginRequest = new LoginRequest("nonexistent.user@petnexus.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    // -------------------------------------------------------------
    // 4. Suspended User Rejected
    // -------------------------------------------------------------
    @Test
    @DisplayName("4. Suspended User Login Rejected (400)")
    void testSuspendedUserRejected() throws Exception {
        LoginRequest loginRequest = new LoginRequest("suspended.test@petnexus.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Your account has been suspended: Policy violation"));
    }

    // -------------------------------------------------------------
    // 5. Rejected Account User Login Rejected
    // -------------------------------------------------------------
    @Test
    @DisplayName("5. Rejected User Login Rejected (400)")
    void testRejectedUserLoginRejected() throws Exception {
        LoginRequest loginRequest = new LoginRequest("rejected.test@petnexus.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Your application was rejected: Invalid medical license"));
    }

    // -------------------------------------------------------------
    // 6. Pending Email Verification User Rejected
    // -------------------------------------------------------------
    @Test
    @DisplayName("6. Pending Email Verification User Rejected (400)")
    void testPendingEmailUserRejected() throws Exception {
        LoginRequest loginRequest = new LoginRequest("pending.email@petnexus.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Please verify your email address before logging in."));
    }

    // -------------------------------------------------------------
    // 7. Pending Approval User Rejected
    // -------------------------------------------------------------
    @Test
    @DisplayName("7. Pending Approval User Rejected (400)")
    void testPendingApprovalUserRejected() throws Exception {
        LoginRequest loginRequest = new LoginRequest("pending.approval@petnexus.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Your account is awaiting admin approval. You will receive an email once reviewed."));
    }

    // -------------------------------------------------------------
    // 8. Protected Endpoint /api/auth/me Authenticates with Valid JWT
    // -------------------------------------------------------------
    @Test
    @DisplayName("8. Protected /api/auth/me Authenticates with Valid Bearer JWT (200)")
    void testProtectedMeEndpointWithValidJwt() throws Exception {
        String token = jwtService.generateToken(activeUser);

        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("USR-SEC-01"))
                .andExpect(jsonPath("$.email").value("active.test@petnexus.com"))
                .andExpect(jsonPath("$.fullName").value("Active Test User"))
                .andExpect(jsonPath("$.role").value("PetOwner"))
                .andExpect(jsonPath("$.status").value("Active"));
    }

    // -------------------------------------------------------------
    // 9. Protected Endpoint Rejects Request with Missing Token (401)
    // -------------------------------------------------------------
    @Test
    @DisplayName("9. Protected /api/auth/me Rejects Missing Token (401)")
    void testProtectedMeEndpointMissingToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api"))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 10. Protected Endpoint Rejects Malformed Token (401)
    // -------------------------------------------------------------
    @Test
    @DisplayName("10. Protected /api/auth/me Rejects Malformed Token (401)")
    void testProtectedMeEndpointMalformedToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer this.is.a.malformed.token"))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 11. Protected Endpoint Rejects Expired Token (401)
    // -------------------------------------------------------------
    @Test
    @DisplayName("11. Protected /api/auth/me Rejects Expired Token (401)")
    void testProtectedMeEndpointExpiredToken() throws Exception {
        // Token expired 1 minute ago
        String expiredToken = jwtService.generateTokenWithExpiration(activeUser, -60000L);

        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 12. Protected Endpoint Rejects Invalid Signature (401)
    // -------------------------------------------------------------
    @Test
    @DisplayName("12. Protected /api/auth/me Rejects Tampered / Invalid Signature Token (401)")
    void testProtectedMeEndpointInvalidSignature() throws Exception {
        String token = jwtService.generateToken(activeUser);
        // Tamper with the token's payload/signature
        String tamperedToken = token.substring(0, token.length() - 6) + "xxxxxx";

        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------
    // 13. PasswordHash Never Appears in Login Response
    // -------------------------------------------------------------
    @Test
    @DisplayName("13. PasswordHash Never Appears in Login Response")
    void testPasswordHashNeverReturnedInLogin() throws Exception {
        LoginRequest loginRequest = new LoginRequest("active.test@petnexus.com", "Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertFalse(content.contains("passwordHash"));
        assertFalse(content.contains("Password123!"));
    }

    // -------------------------------------------------------------
    // 14. PasswordHash and Sensitive Tokens Never in /me Response
    // -------------------------------------------------------------
    @Test
    @DisplayName("14. Sensitive Fields Never Appear in /api/auth/me Response")
    void testSensitiveFieldsNeverInMeResponse() throws Exception {
        String token = jwtService.generateToken(activeUser);

        MvcResult result = mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assertFalse(content.contains("passwordHash"));
        assertFalse(content.contains("passwordResetToken"));
        assertFalse(content.contains("emailVerificationToken"));
    }

    // -------------------------------------------------------------
    // 15. Public Login Endpoint Remains Accessible without Token
    // -------------------------------------------------------------
    @Test
    @DisplayName("15. Public /api/auth/login Accessible without Token")
    void testPublicLoginAccessibleWithoutToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("active.test@petnexus.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------
    // 16. Public Registration Endpoint Remains Accessible without Token
    // -------------------------------------------------------------
    @Test
    @DisplayName("16. Public /api/auth/register Accessible without Token")
    void testPublicRegisterAccessibleWithoutToken() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("new.registered.user@petnexus.com");
        registerRequest.setPassword("SecurePass123!");
        registerRequest.setFullName("New Reg User");
        registerRequest.setRole(UserRole.PetOwner);

        mockMvc.perform(post("/api/auth/register")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new.registered.user@petnexus.com"));
    }

    // -------------------------------------------------------------
    // 17. Public Email Verification Remains Accessible without Token
    // -------------------------------------------------------------
    @Test
    @DisplayName("17. Public /api/auth/verify-email Accessible without Token")
    void testPublicVerifyEmailAccessibleWithoutToken() throws Exception {
        String token = pendingEmailUser.getEmailVerificationToken();
        assertNotNull(token);

        mockMvc.perform(get("/api/auth/verify-email")
                        .servletPath("/api")
                        .param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));
    }

    // -------------------------------------------------------------
    // 18. Public Forgot Password Endpoint Remains Accessible without Token
    // -------------------------------------------------------------
    @Test
    @DisplayName("18. Public /api/auth/forgot-password Accessible without Token")
    void testPublicForgotPasswordAccessibleWithoutToken() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest("active.test@petnexus.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isString());
    }

    // -------------------------------------------------------------
    // 19. Seeded System Administrator Can Log In, Receives JWT, and Accesses /me
    // -------------------------------------------------------------
    @Test
    @DisplayName("19. Seeded System Administrator can login, receive JWT, and access /me")
    void testSeededAdminLoginAndAuthMeWorkflow() throws Exception {
        // 1. Verify admin exists from DataInitializer
        User admin = userRepository.findByEmail("admin@petnexus.com").orElse(null);
        assertNotNull(admin, "Seeded Admin account should exist");
        assertEquals("USR-003", admin.getUserId());
        assertEquals(UserRole.Admin, admin.getRole());
        assertEquals(UserStatus.Active, admin.getStatus());

        // 2. Perform Login with development password
        LoginRequest loginRequest = new LoginRequest("admin@petnexus.com", "password123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("admin@petnexus.com"))
                .andExpect(jsonPath("$.user.userId").value("USR-003"))
                .andExpect(jsonPath("$.user.role").value("Admin"))
                .andExpect(jsonPath("$.user.status").value("Active"))
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = responseJson.get("token").asText();
        assertNotNull(token);

        // 3. Verify JWT Claims
        Claims claims = jwtService.extractAllClaims(token);
        assertEquals("admin@petnexus.com", claims.getSubject());
        assertEquals("USR-003", claims.get("userId"));
        assertEquals("Admin", claims.get("role"));
        assertTrue(jwtService.isTokenValid(token, admin));

        // 4. Access protected /api/auth/me with Admin JWT
        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("USR-003"))
                .andExpect(jsonPath("$.email").value("admin@petnexus.com"))
                .andExpect(jsonPath("$.role").value("Admin"))
                .andExpect(jsonPath("$.status").value("Active"));
    }
}

