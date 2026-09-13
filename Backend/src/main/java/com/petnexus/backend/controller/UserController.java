package com.petnexus.backend.controller;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.service.ApprovalHistoryService;
import com.petnexus.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * User controller — handles user retrieval, admin approval workflow,
 * profile updates, and password changes.
 *
 * All endpoints are under /api/users/* or /api/admin/* (via spring.mvc.servlet.path=/api).
 *
 * Note: No role-based access control in Phase 1. Full RBAC will be added in Phase 2.
 */
@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ApprovalHistoryService approvalHistoryService;

    // =========================================================================
    // User Retrieval
    // =========================================================================

    /** GET /api/users — Get all users */
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** GET /api/users/pending-approvals — Users awaiting System Administrator approval */
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/users/pending-approvals")
    public ResponseEntity<List<UserResponse>> getPendingApprovals() {
        return ResponseEntity.ok(userService.getPendingApprovals());
    }

    /** GET /api/users/{userId} — Get a specific user by userId string (e.g. USR-001) */
    @PreAuthorize("hasRole('Admin') or #userId == authentication.principal.userId")
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // =========================================================================
    // System Administrator — Approval Workflow
    // Approving a user ONLY changes UserStatus. UserRole is never changed.
    // =========================================================================

    /** POST /api/users/{userId}/approve — Approve user → status = Active */
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<UserResponse> approveUser(@PathVariable String userId, @AuthenticationPrincipal User admin) {
        String adminId = (admin != null) ? admin.getUserId() : "System";
        return ResponseEntity.ok(userService.approveUser(userId, adminId));
    }

    /** POST /api/users/{userId}/reject — Reject user → status = Rejected */
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/users/{userId}/reject")
    public ResponseEntity<UserResponse> rejectUser(
            @PathVariable String userId,
            @Valid @RequestBody(required = false) RejectRequest request,
            @AuthenticationPrincipal User admin) {
        String reason = request != null ? request.getRejectionReason() : null;
        String adminId = (admin != null) ? admin.getUserId() : "System";
        return ResponseEntity.ok(userService.rejectUser(userId, reason, adminId));
    }

    /** POST /api/users/{userId}/suspend — Suspend user → status = Suspended (Admin role blocked) */
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<UserResponse> suspendUser(
            @PathVariable String userId,
            @Valid @RequestBody(required = false) SuspendRequest request,
            @AuthenticationPrincipal User admin) {
        String reason = request != null ? request.getSuspensionReason() : null;
        String adminId = (admin != null) ? admin.getUserId() : "System";
        return ResponseEntity.ok(userService.suspendUser(userId, reason, adminId));
    }

    /** POST /api/users/{userId}/reactivate — Reactivate user → status = Active */
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/users/{userId}/reactivate")
    public ResponseEntity<UserResponse> reactivateUser(@PathVariable String userId, @AuthenticationPrincipal User admin) {
        String adminId = (admin != null) ? admin.getUserId() : "System";
        return ResponseEntity.ok(userService.reactivateUser(userId, adminId));
    }

    // =========================================================================
    // Profile & Password Management
    // =========================================================================

    /** PUT /api/users/{userId} — Update user profile details */
    @PreAuthorize("hasRole('Admin') or #userId == authentication.principal.userId")
    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUserProfile(
            @PathVariable String userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, request));
    }

    /** POST /api/users/{userId}/change-password — Change password (verifies current password) */
    @PreAuthorize("#userId == authentication.principal.userId")
    @PostMapping("/users/{userId}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable String userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    // =========================================================================
    // Admin — Approval History
    // =========================================================================

    /** GET /api/admin/approval-history — Approval history */
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/admin/approval-history")
    public ResponseEntity<List<com.petnexus.backend.dto.ApprovalHistoryResponse>> getApprovalHistory() {
        return ResponseEntity.ok(approvalHistoryService.getApprovalHistory());
    }
}
