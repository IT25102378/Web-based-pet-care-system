package com.petnexus.backend.dto;

import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = ValidationRules.EMAIL_MESSAGE)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
