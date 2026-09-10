package com.petnexus.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petnexus.backend.dto.LoginResponse;
import com.petnexus.backend.dto.RegisterRequest;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.JwtService;
import com.petnexus.backend.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class AutomaticLoginAfterApprovalIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @DisplayName("End-to-End Automatic Approval Detection and JWT Login Flow")
    void testAutomaticApprovalDetectionAndLogin() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // 1. Register a new Pet Owner
        String uniqueEmail = "autologin." + UUID.randomUUID() + "@petnexus.com";
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail(uniqueEmail);
        registerRequest.setPassword("SecurePassword123!");
        registerRequest.setFullName("Auto Login Tester");
        registerRequest.setRole(UserRole.PetOwner);
        registerRequest.setPhone("+94770009988");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.approvalToken").isString())
                .andReturn();

        JsonNode regJson = objectMapper.readTree(regResult.getResponse().getContentAsString());
        String approvalToken = regJson.get("approvalToken").asText();
        assertNotNull(approvalToken);

        // 2. Poll approval status before email verification -> status is PendingEmailVerification, approved is false
        mockMvc.perform(get("/api/auth/approval-status")
                        .servletPath("/api")
                        .param("token", approvalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PendingEmailVerification"))
                .andExpect(jsonPath("$.approved").value(false));

        // 3. Attempting approval-login while not Active must fail (400 Bad Request)
        mockMvc.perform(post("/api/auth/approval-login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("approvalToken", approvalToken))))
                .andExpect(status().isBadRequest());

        // 4. Verify email
        User user = userRepository.findByApprovalToken(approvalToken).orElseThrow();
        String emailToken = user.getEmailVerificationToken();
        assertNotNull(emailToken);

        MvcResult verifyResult = mockMvc.perform(get("/api/auth/verify-email")
                        .servletPath("/api")
                        .param("token", emailToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.approvalToken").isString())
                .andReturn();

        // 5. Poll approval status after email verification -> status is PendingApproval, approved is false
        mockMvc.perform(get("/api/auth/approval-status")
                        .servletPath("/api")
                        .param("token", approvalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PendingApproval"))
                .andExpect(jsonPath("$.approved").value(false))
                .andExpect(jsonPath("$.role").value("PetOwner"))
                .andExpect(jsonPath("$.fullName").value("Auto Login Tester"));

        // 6. Approval-login must still fail while in PendingApproval
        mockMvc.perform(post("/api/auth/approval-login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("approvalToken", approvalToken))))
                .andExpect(status().isBadRequest());

        // 7. System Administrator approves the applicant
        userService.approveUser(user.getUserId(), "USR-003");

        // 8. Poll approval status now -> status is Active, approved is true!
        mockMvc.perform(get("/api/auth/approval-status")
                        .servletPath("/api")
                        .param("token", approvalToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Active"))
                .andExpect(jsonPath("$.approved").value(true));

        // 9. Browser performs approval-login -> returns real JWT and User object
        MvcResult loginResult = mockMvc.perform(post("/api/auth/approval-login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("approvalToken", approvalToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.userId").value(user.getUserId()))
                .andExpect(jsonPath("$.user.role").value("PetOwner"))
                .andExpect(jsonPath("$.user.status").value("Active"))
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String jwt = loginJson.get("token").asText();
        assertNotNull(jwt);

        // 10. Access protected /api/auth/me with the issued JWT -> 200 OK
        mockMvc.perform(get("/api/auth/me")
                        .servletPath("/api")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(user.getUserId()))
                .andExpect(jsonPath("$.role").value("PetOwner"))
                .andExpect(jsonPath("$.status").value("Active"));

        // 11. Invalidation test: the used approvalToken cannot be reused to obtain another JWT
        mockMvc.perform(post("/api/auth/approval-login")
                        .servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("approvalToken", approvalToken))))
                .andExpect(status().isBadRequest());
    }
}
