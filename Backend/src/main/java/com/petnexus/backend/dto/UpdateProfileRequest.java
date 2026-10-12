package com.petnexus.backend.dto;




import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import lombok.Data;

/**
 * Profile update request — only updatable profile fields.
 * Role and status are NOT updatable via this endpoint.
 */
@Data
public class UpdateProfileRequest {
    @Size(min = 3, max = 150, message = "Full name must be between 3 and 150 characters")
    @Pattern(regexp = ValidationRules.OPTIONAL_PERSON_NAME, message = ValidationRules.PERSON_NAME_MESSAGE)
    private String fullName;

    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String phone;

    @Size(max = 300, message = "Address cannot be longer than 300 characters")
    private String address;

    @Size(max = 200, message = "Emergency contact cannot be longer than 200 characters")
    @Pattern(regexp = ValidationRules.EMERGENCY_CONTACT, message = ValidationRules.EMERGENCY_CONTACT_MESSAGE)
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
