package com.petnexus.backend.dto;



import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Pattern(regexp = ValidationRules.PASSWORD, message = ValidationRules.PASSWORD_MESSAGE)
    private String newPassword;
}
