package com.petnexus.backend.dto;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Safe user response DTO — never exposes passwordHash or token fields.
 * Field names match what the frontend expects from the mock store shape.
 */
@Data
public class UserResponse {

    private String userId;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String emergencyContact;
    private UserRole role;
    private UserStatus status;
    private String avatarUrl;

    // Role-specific professional fields
    private String licenseNumber;
    private String specialization;
    private String staffId;
    private String managerCode;
    private String badgeNumber;
    private String serviceSpecialty;

    // Approval / suspension
    private String rejectionReason;
    private String suspensionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Populated only where the caller needs it, such as the approval queue.
     * Null elsewhere, so an ordinary user lookup does not carry file data.
     */
    private List<VerificationDocumentDto> verificationDocuments;

    /** Map a User entity to a safe UserResponse DTO. */
    public static UserResponse from(User user) {
        UserResponse dto = new UserResponse();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setEmergencyContact(user.getEmergencyContact());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setLicenseNumber(user.getLicenseNumber());
        dto.setSpecialization(user.getSpecialization());
        dto.setStaffId(user.getStaffId());
        dto.setManagerCode(user.getManagerCode());
        dto.setBadgeNumber(user.getBadgeNumber());
        dto.setServiceSpecialty(user.getServiceSpecialty());
        dto.setRejectionReason(user.getRejectionReason());
        dto.setSuspensionReason(user.getSuspensionReason());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    /** Same mapping, with the applicant's uploaded documents attached. */
    public static UserResponse from(User user, List<VerificationDocumentDto> documents) {
        UserResponse dto = from(user);
        dto.setVerificationDocuments(documents);
        return dto;
    }
}
