package com.petnexus.backend.service;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.EmailAlreadyExistsException;
import com.petnexus.backend.exception.UserNotFoundException;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final com.petnexus.backend.repository.PetRepository petRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApprovalHistoryService approvalHistoryService;
    private final EmailService emailService;

    // =========================================================================
    // Authentication Operations
    // =========================================================================

    /**
     * Register a new user.
     *
     * Registration / Approval Workflow:
     *   register() → status = PendingEmailVerification
     *
     * Business rules enforced:
     * - Admin role cannot be self-registered via this endpoint.
     * - Duplicate email is rejected.
     * - Password is BCrypt-hashed before storage.
     */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // Block self-registration as Admin
        if (UserRole.Admin.equals(request.getRole())) {
            throw new BadRequestException(
                "System Administrator accounts cannot be created via registration. " +
                "Contact your system administrator."
            );
        }

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        // Generate unique userId in USR-xxx format
        String userId = generateUserId();

        // Generate cryptographically secure approval token for browser polling & automatic login
        String approvalToken = UUID.randomUUID().toString();

        // Build user entity — BCrypt hash the password
        User user = User.builder()
                .userId(userId)
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .emergencyContact(request.getEmergencyContact())
                .role(request.getRole())
                .status(UserStatus.PendingApproval)
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl()
                        : "https://api.dicebear.com/7.x/initials/svg?seed=" + request.getFullName().replaceAll("\\s+", ""))
                .licenseNumber(request.getLicenseNumber())
                .specialization(request.getSpecialization())
                .staffId(request.getStaffId())
                .managerCode(request.getManagerCode())
                .badgeNumber(request.getBadgeNumber())
                .serviceSpecialty(request.getServiceSpecialty())
                .approvalToken(approvalToken)
                .build();

        userRepository.save(user);

        log.info("New user registered: {} ({}), status=PendingApproval", userId, request.getEmail());

        return new RegisterResponse(
                "Registration submitted successfully! Your account is now pending admin approval.",
                userId,
                user.getEmail(),
                approvalToken
        );
    }

    /**
     * Login — verifies credentials and checks account status.
     * Returns user DTO + placeholder token (JWT will replace in later phase).
     *
     * Status checks match the frontend authApi.login() mock logic exactly.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        // Verify password against BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // Status checks — must match frontend's error code expectations
        switch (user.getStatus()) {
            case PendingApproval ->
                throw new BadRequestException(
                    "Your account is awaiting admin approval. You will receive an email once reviewed."
                );
            case Rejected -> {
                String reason = user.getRejectionReason() != null
                        ? user.getRejectionReason()
                        : "Application criteria were not met.";
                throw new BadRequestException("Your application was rejected: " + reason);
            }
            case Suspended -> {
                String reason = user.getSuspensionReason() != null
                        ? user.getSuspensionReason()
                        : "Account suspended.";
                throw new BadRequestException("Your account has been suspended: " + reason);
            }
            case Active -> { /* proceed */ }
        }

        // Generate signed JWT access token with user claims
        String token = jwtService.generateToken(user);
        log.info("User logged in with JWT: {}", user.getUserId());

        return new LoginResponse(UserResponse.from(user), token);
    }


    /**
     * Initiate forgot-password flow.
     * Generates a reset token and stores it (email sending is a stub in Phase 1).
     */
    @Transactional
    public String forgotPassword(String email) {
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            userRepository.save(user);
            // Note: Phase 2 — send email with reset link containing the token
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            log.info("Password reset token generated and email dispatched for user: {}", user.getUserId());
        });
        // Always return the same message to prevent email enumeration
        return "If an account exists with this email, a password reset link has been dispatched.";
    }

    /**
     * Reset password using the token from the forgot-password email.
     */
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token."));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null); // clear token after use
        userRepository.save(user);

        log.info("Password reset successful for user: {}", user.getUserId());
        return "Your password has been successfully reset. You may now log in.";
    }

    // =========================================================================
    // User Retrieval
    // =========================================================================

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return UserResponse.from(user);
    }

    /**
     * Returns all users with status = PendingApproval.
     * Used by the System Administrator approval dashboard.
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getPendingApprovals() {
        return userRepository.findByStatusIn(java.util.List.of(UserStatus.PendingApproval)).stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // Admin Approval Workflow
    // =========================================================================

    @Transactional
    public UserResponse approveUser(String userId) {
        return approveUser(userId, "System");
    }

    /**
     * Approve a user — transitions status from PendingApproval / PendingEmailVerification to Active.
     *
     * CRITICAL: This operation ONLY changes UserStatus. It does NOT change UserRole.
     * Approving a ClinicManager does NOT grant System Administrator privileges.
     * Approving any user does NOT grant Admin role.
     */
    @Transactional
    public UserResponse approveUser(String userId, String adminId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!UserStatus.PendingApproval.equals(user.getStatus())) {
            throw new BadRequestException(
                "User is not in a pending status. Current status: " + user.getStatus()
            );
        }

        user.setStatus(UserStatus.Active);

        user.setRejectionReason(null);
        user.setSuspensionReason(null);
        userRepository.save(user);

        approvalHistoryService.recordAction(user, "APPROVED", adminId, null);

        log.info("User approved: {} (role={}, status=Active) by admin {}", userId, user.getRole(), adminId);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse rejectUser(String userId, String rejectionReason) {
        return rejectUser(userId, rejectionReason, "System");
    }

    /**
     * Reject a user — transitions status to Rejected and records the reason.
     */
    @Transactional
    public UserResponse rejectUser(String userId, String rejectionReason, String adminId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setStatus(UserStatus.Rejected);
        user.setRejectionReason(rejectionReason != null
                ? rejectionReason
                : "Documentation could not be verified by clinic compliance team.");
        userRepository.save(user);

        approvalHistoryService.recordAction(user, "REJECTED", adminId, user.getRejectionReason());

        log.info("User rejected: {} (reason={}) by admin {}", userId, user.getRejectionReason(), adminId);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse suspendUser(String userId, String suspensionReason) {
        return suspendUser(userId, suspensionReason, "System");
    }

    /**
     * Suspend a user — transitions status to Suspended.
     *
     * The Admin role (System Administrator) account CANNOT be suspended.
     */
    @Transactional
    public UserResponse suspendUser(String userId, String suspensionReason, String adminId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (UserRole.Admin.equals(user.getRole())) {
            throw new BadRequestException("System Administrator accounts cannot be suspended.");
        }

        user.setStatus(UserStatus.Suspended);
        user.setSuspensionReason(suspensionReason != null
                ? suspensionReason
                : "Account suspended by System Administrator.");
        userRepository.save(user);

        approvalHistoryService.recordAction(user, "SUSPENDED", adminId, user.getSuspensionReason());

        log.info("User suspended: {} (reason={}) by admin {}", userId, user.getSuspensionReason(), adminId);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse reactivateUser(String userId) {
        return reactivateUser(userId, "System");
    }

    /**
     * Reactivate a suspended or rejected user — transitions status back to Active.
     */
    @Transactional
    public UserResponse reactivateUser(String userId, String adminId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setStatus(UserStatus.Active);
        user.setSuspensionReason(null);
        user.setRejectionReason(null);
        userRepository.save(user);

        approvalHistoryService.recordAction(user, "REACTIVATED", adminId, null);

        log.info("User reactivated: {} by admin {}", userId, adminId);
        return UserResponse.from(user);
    }

    // =========================================================================
    // Profile & Password Management
    // =========================================================================

    /**
     * Update a user's profile fields.
     * Role and status are intentionally NOT updatable via this endpoint.
     */
    @Transactional
    public UserResponse updateUserProfile(String userId, UpdateProfileRequest request) {
        if (com.petnexus.backend.security.SecurityUtils.getCurrentUser() != null) {
            com.petnexus.backend.security.SecurityUtils.enforceOwnershipOrRole(userId, UserRole.Admin);
        }

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        User current = com.petnexus.backend.security.SecurityUtils.getCurrentUser();
        boolean isAdmin = (current != null && current.getRole() == UserRole.Admin);

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getEmergencyContact() != null) user.setEmergencyContact(request.getEmergencyContact());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        // Professional fields can only be set if user role matches or by Admin
        if (request.getLicenseNumber() != null && (isAdmin || user.getRole() == UserRole.Veterinarian)) {
            user.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getSpecialization() != null && (isAdmin || user.getRole() == UserRole.Veterinarian)) {
            user.setSpecialization(request.getSpecialization());
        }
        if (request.getStaffId() != null && (isAdmin || user.getRole() == UserRole.ClinicStaff || user.getRole() == UserRole.ClinicManager)) {
            user.setStaffId(request.getStaffId());
        }
        if (request.getManagerCode() != null && (isAdmin || user.getRole() == UserRole.ClinicManager)) {
            user.setManagerCode(request.getManagerCode());
        }
        if (request.getBadgeNumber() != null && (isAdmin || user.getRole() == UserRole.RescueOfficer)) {
            user.setBadgeNumber(request.getBadgeNumber());
        }
        if (request.getServiceSpecialty() != null && (isAdmin || user.getRole() == UserRole.PetCareProvider)) {
            user.setServiceSpecialty(request.getServiceSpecialty());
        }

        userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        return UserResponse.from(user);
    }

    /**
     * Change a user's password after verifying the current one.
     */
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        if (com.petnexus.backend.security.SecurityUtils.getCurrentUser() != null) {
            com.petnexus.backend.security.SecurityUtils.enforceOwnershipOrRole(userId);
        }

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", userId);
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * Generate a unique userId in USR-xxx format.
     * Keeps incrementing until a unique value is found.
     */
    private String generateUserId() {
        long count = userRepository.count() + 1;
        String candidate;
        do {
            candidate = "USR-" + String.format("%03d", count++);
        } while (userRepository.existsByUserId(candidate));
        return candidate;
    }

    // =========================================================================
    // Approval Status & Automatic Login (Post-Approval Authentication)
    // =========================================================================

    /**
     * Public method to check approval status using the cryptographically secure approval token.
     * Never returns passwords, password hashes, or sensitive tokens.
     */
    @Transactional(readOnly = true)
    public ApprovalStatusResponse getApprovalStatus(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Approval token is required.");
        }
        User user = userRepository.findByApprovalToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired approval token."));

        return new ApprovalStatusResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                UserStatus.Active.equals(user.getStatus()),
                user.getRejectionReason()
        );
    }

    /**
     * Exchange a valid approval token for a real signed JWT upon account approval.
     * ONLY succeeds if the user's status is Active.
     * Invalidates the approval token upon successful JWT issuance.
     */
    @Transactional
    public LoginResponse approvalLogin(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Approval token is required.");
        }
        User user = userRepository.findByApprovalToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired approval token."));

        if (!UserStatus.Active.equals(user.getStatus())) {
            throw new BadRequestException("Account is not active yet. Current status: " + user.getStatus());
        }

        // Generate authenticated JWT
        String jwt = jwtService.generateToken(user);
        log.info("Approval login successful with JWT for user: {} ({})", user.getUserId(), user.getRole());

        // Invalidate the approval token upon successful authentication exchange
        user.setApprovalToken(null);
        userRepository.save(user);

        return new LoginResponse(UserResponse.from(user), jwt);
    }

    /**
     * Search database accounts matching query for quick autofill with associated pet information.
     */
    @Transactional(readOnly = true)
    public List<AccountSuggestion> searchAutofillAccounts(String query) {
        String trimmed = (query == null) ? "" : query.trim().toLowerCase();
        List<User> allUsers = userRepository.findAll();
        List<User> matchedUsers;
        if (trimmed.isEmpty()) {
            matchedUsers = allUsers.stream()
                    .sorted((u1, u2) -> Long.compare(u2.getId(), u1.getId()))
                    .limit(25)
                    .toList();
        } else {
            matchedUsers = allUsers.stream()
                    .filter(u -> (u.getEmail() != null && u.getEmail().toLowerCase().contains(trimmed)) ||
                                 (u.getFullName() != null && u.getFullName().toLowerCase().contains(trimmed)) ||
                                 (u.getUserId() != null && u.getUserId().toLowerCase().contains(trimmed)) ||
                                 (u.getRole() != null && u.getRole().name().toLowerCase().contains(trimmed)))
                    .sorted((u1, u2) -> Long.compare(u2.getId(), u1.getId()))
                    .limit(25)
                    .toList();
        }

        return matchedUsers.stream().map(user -> {
            List<String> petNames = List.of();
            try {
                if (user.getUserId() != null && petRepository != null) {
                    List<com.petnexus.backend.entity.Pet> userPets = petRepository.findByOwner_UserId(user.getUserId());
                    if (userPets != null) {
                        petNames = userPets.stream()
                                .map(p -> p.getName() + (p.getSpecies() != null ? " (" + p.getSpecies() + ")" : ""))
                                .toList();
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch pets for user {}: {}", user.getUserId(), e.getMessage());
            }

            return new AccountSuggestion(
                    user.getUserId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole() != null ? user.getRole().name() : "PetOwner",
                    user.getStatus() != null ? user.getStatus().name() : "Active",
                    petNames,
                    "password123"
            );
        }).toList();
    }

    public record AccountSuggestion(
            String userId,
            String email,
            String fullName,
            String role,
            String status,
            List<String> pets,
            String defaultPassword
    ) {}

    // =========================================================================
    // Inner Response Record Classes
    // =========================================================================

    public record RegisterResponse(String message, String userId, String email, String approvalToken) {
        public RegisterResponse(String message, String userId, String email) {
            this(message, userId, email, null);
        }
    }



    public record ApprovalStatusResponse(
            String userId,
            String fullName,
            String email,
            UserRole role,
            UserStatus status,
            boolean approved,
            String rejectionReason
    ) {}

    public record ApprovalLoginRequest(String approvalToken) {}
}
