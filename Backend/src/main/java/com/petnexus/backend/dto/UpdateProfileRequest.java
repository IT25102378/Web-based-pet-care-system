package com.petnexus.backend.dto;

import lombok.Data;

/**
 * Profile update request — only updatable profile fields.
 * Role and status are NOT updatable via this endpoint.
 */
@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String address;
    private String emergencyContact;
    private String avatarUrl;

    // Professional fields (can be updated after registration)
    private String licenseNumber;
    private String specialization;
    private String staffId;
    private String managerCode;
    private String badgeNumber;
    private String serviceSpecialty;
}
