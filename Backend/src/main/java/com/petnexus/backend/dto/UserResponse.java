package com.petnexus.backend.dto;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import lombok.Data;

import java.time.LocalDateTime;

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
        dto.setLicenseNumber((user instanceof com.petnexus.backend.entity.Veterinarian v ? v.getLicenseNumber() : null));
        dto.setSpecialization((user instanceof com.petnexus.backend.entity.Veterinarian v ? v.getSpecialization() : null));
        dto.setStaffId((user instanceof com.petnexus.backend.entity.ClinicStaff s ? s.getStaffId() : null));
        dto.setManagerCode((user instanceof com.petnexus.backend.entity.ClinicManager m ? m.getManagerCode() : null));
        dto.setBadgeNumber((user instanceof com.petnexus.backend.entity.RescueOfficer r ? r.getBadgeNumber() : null));
        dto.setServiceSpecialty((user instanceof com.petnexus.backend.entity.PetCareProvider p ? p.getServiceSpecialty() : null));
        dto.setRejectionReason(user.getRejectionReason());
        dto.setSuspensionReason(user.getSuspensionReason());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
