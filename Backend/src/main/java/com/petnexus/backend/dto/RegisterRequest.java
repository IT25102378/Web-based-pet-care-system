package com.petnexus.backend.dto;



import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import com.petnexus.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = ValidationRules.EMAIL_MESSAGE)
    @Size(max = 255, message = "Email cannot be longer than 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = ValidationRules.PASSWORD, message = ValidationRules.PASSWORD_MESSAGE)
    private String password;

    @NotBlank(message = "Full name is required")
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

    @NotNull(message = "Role is required")
    private UserRole role;

    // Role-specific professional fields (all optional at registration)
    private String licenseNumber;
    private String specialization;
    private String staffId;
    private String managerCode;
    private String badgeNumber;
    private String serviceSpecialty;
    private String avatarUrl;
}
