package com.petnexus.backend.controller;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Auth controller — handles registration, login, email verification,
 * and password reset flows.
 *
 * All endpoints are under /api/auth/* (via spring.mvc.servlet.path=/api).
 *
 * Note: No JWT enforcement in Phase 1. Full security will be added in Phase 2.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * POST /api/auth/register
     * Register a new user. Status starts at PendingEmailVerification.
     * Admin role cannot be self-registered.
     */
    @PostMapping("/register")
    public ResponseEntity<UserService.RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        UserService.RegisterResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Authenticate with email + password.
     * Returns UserResponse (no password) and a placeholder token.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/verify-email?token=...
     * Verify email address — transitions status from PendingEmailVerification to PendingApproval.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<UserService.VerifyEmailResponse> verifyEmail(
            @RequestParam("token") String token) {
        UserService.VerifyEmailResponse response = userService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/forgot-password
     * Initiate password reset. Always returns a generic message (prevents email enumeration).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String message = userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * POST /api/auth/reset-password
     * Complete password reset using the token from the email link.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        String message = userService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * GET /api/auth/approval-status?token=...
     * Public endpoint allowing newly registered browser to safely poll approval status.
     */
    @GetMapping("/approval-status")
    public ResponseEntity<UserService.ApprovalStatusResponse> getApprovalStatus(
            @RequestParam("token") String token) {
        return ResponseEntity.ok(userService.getApprovalStatus(token));
    }

    /**
     * POST /api/auth/approval-login
     * Securely exchanges an approval token for an authenticated JWT ONLY if the account is Active.
     */
    @PostMapping("/approval-login")
    public ResponseEntity<LoginResponse> approvalLogin(
            @RequestBody Map<String, String> body) {
        String token = body.get("approvalToken");
        return ResponseEntity.ok(userService.approvalLogin(token));
    }

    /**
     * GET /api/auth/me
     * Protected endpoint returning the currently authenticated user's profile.
     * Requires valid Bearer JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal Object principal) {
        if (principal instanceof com.petnexus.backend.entity.User user) {
            return ResponseEntity.ok(UserResponse.from(user));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
