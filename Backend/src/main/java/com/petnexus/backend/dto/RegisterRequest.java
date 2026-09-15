package com.petnexus.backend.dto;

import com.petnexus.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
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
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = ValidationRules.PASSWORD_PATTERN, message = ValidationRules.PASSWORD_MESSAGE)
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String address;

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
