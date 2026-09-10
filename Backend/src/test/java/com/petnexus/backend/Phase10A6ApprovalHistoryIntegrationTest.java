package com.petnexus.backend;

import com.petnexus.backend.controller.UserController;
import com.petnexus.backend.dto.ApprovalHistoryResponse;
import com.petnexus.backend.dto.RegisterRequest;
import com.petnexus.backend.dto.RejectRequest;
import com.petnexus.backend.dto.SuspendRequest;
import com.petnexus.backend.entity.ApprovalHistory;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.ApprovalHistoryRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest

@Transactional
@ActiveProfiles("test")
@WithMockUser(username = "admin", roles = {"Admin"})
public class Phase10A6ApprovalHistoryIntegrationTest {

    @Autowired
    private UserController userController;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApprovalHistoryRepository approvalHistoryRepository;

    private User adminUser;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create an admin user for context
        adminUser = userRepository.save(User.builder()
                .userId("ADM-999")
                .fullName("Test Admin")
                .email("test.admin@petnexus.com")
                .passwordHash("hash")
                .role(UserRole.Admin)
                .status(UserStatus.Active)
                .build());

        // Create a test user for approval workflow
        testUser = userRepository.save(User.builder()
                .userId("USR-TEST")
                .fullName("Test User")
                .email("test.user@petnexus.com")
                .passwordHash("hash")
                .role(UserRole.ClinicManager)
                .status(UserStatus.PendingApproval) // Start in PendingApproval
                .build());
    }

    private void mockAdminSecurityContext() {
        org.springframework.security.core.authority.SimpleGrantedAuthority authority =
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_Admin");
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken authToken =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(adminUser, null, java.util.List.of(authority));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Approving a user creates an APPROVED history record")
    void testApproveUser_CreatesHistory() {
        mockAdminSecurityContext();

        ResponseEntity<?> response = userController.approveUser(testUser.getUserId(), adminUser);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<ApprovalHistory> history = approvalHistoryRepository.findAll();
        assertFalse(history.isEmpty());
        ApprovalHistory record = history.get(0);
        assertEquals("APPROVED", record.getAction());
        assertEquals(testUser.getUserId(), record.getUserId());
        assertEquals(adminUser.getUserId(), record.getAdminId());
        assertNotNull(record.getTimestamp());

        clearSecurityContext();
    }

    @Test
    @DisplayName("2. Rejecting a user creates a REJECTED history record")
    void testRejectUser_CreatesHistory() {
        mockAdminSecurityContext();

        RejectRequest request = new RejectRequest();
        request.setRejectionReason("Incomplete documents");
        ResponseEntity<?> response = userController.rejectUser(testUser.getUserId(), request, adminUser);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<ApprovalHistory> history = approvalHistoryRepository.findAll();
        assertFalse(history.isEmpty());
        ApprovalHistory record = history.get(0);
        assertEquals("REJECTED", record.getAction());
        assertEquals(testUser.getUserId(), record.getUserId());
        assertEquals(adminUser.getUserId(), record.getAdminId());
        assertEquals("Incomplete documents", record.getReason());

        clearSecurityContext();
    }

    @Test
    @DisplayName("3. Suspending a user creates a SUSPENDED history record")
    void testSuspendUser_CreatesHistory() {
        mockAdminSecurityContext();

        SuspendRequest request = new SuspendRequest();
        request.setSuspensionReason("Violation of terms");
        ResponseEntity<?> response = userController.suspendUser(testUser.getUserId(), request, adminUser);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<ApprovalHistory> history = approvalHistoryRepository.findAll();
        assertFalse(history.isEmpty());
        ApprovalHistory record = history.get(0);
        assertEquals("SUSPENDED", record.getAction());
        assertEquals(testUser.getUserId(), record.getUserId());
        assertEquals(adminUser.getUserId(), record.getAdminId());
        assertEquals("Violation of terms", record.getReason());

        clearSecurityContext();
    }

    @Test
    @DisplayName("4. Reactivating a user creates a REACTIVATED history record")
    void testReactivateUser_CreatesHistory() {
        mockAdminSecurityContext();

        // Suspend first
        userService.suspendUser(testUser.getUserId(), "Violation", adminUser.getUserId());

        ResponseEntity<?> response = userController.reactivateUser(testUser.getUserId(), adminUser);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        List<ApprovalHistory> history = approvalHistoryRepository.findAllByOrderByTimestampDesc();
        assertTrue(history.size() >= 2); // Suspend + Reactivate
        ApprovalHistory record = history.get(0); // newest first
        assertEquals("REACTIVATED", record.getAction());
        assertEquals(testUser.getUserId(), record.getUserId());
        assertEquals(adminUser.getUserId(), record.getAdminId());

        clearSecurityContext();
    }

    @Test
    @DisplayName("5. GET /api/admin/approval-history returns persisted records")
    void testGetApprovalHistory() {
        mockAdminSecurityContext();
        userController.approveUser(testUser.getUserId(), adminUser);

        ResponseEntity<List<ApprovalHistoryResponse>> response = userController.getApprovalHistory();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<ApprovalHistoryResponse> body = response.getBody();
        assertNotNull(body);
        assertFalse(body.isEmpty());
        ApprovalHistoryResponse record = body.get(0);
        assertEquals("APPROVED", record.getAction());
        assertEquals(testUser.getUserId(), record.getUserId());
        assertNotNull(record.getTimestamp());
        clearSecurityContext();
    }

    @Test
    @DisplayName("6. Failed approval operations do not create false history records")
    void testFailedApproval() {
        mockAdminSecurityContext();

        // User is already PendingApproval, try to approve non-existent user
        assertThrows(Exception.class, () -> userController.approveUser("NON-EXISTENT", adminUser));

        List<ApprovalHistory> history = approvalHistoryRepository.findAll();
        assertTrue(history.isEmpty());

        clearSecurityContext();
    }

    @Test
    @DisplayName("7. System actor is used if no principal is provided")
    void testSystemActor() {
        // No security context
        userController.approveUser(testUser.getUserId(), null);

        List<ApprovalHistory> history = approvalHistoryRepository.findAll();
        assertFalse(history.isEmpty());
        ApprovalHistory record = history.get(0);
        assertEquals("System", record.getAdminId());
    }
}
