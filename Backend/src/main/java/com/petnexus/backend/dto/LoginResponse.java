package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private UserResponse user;
    private String token;
}
