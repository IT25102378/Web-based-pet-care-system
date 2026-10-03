package com.petnexus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareProviderUpdateRequest {

    @Size(max = 100, message = "Provider name must not exceed 100 characters")
    private String providerName;

    @Size(max = 20, message = "Contact phone must not exceed 20 characters")
    private String contactPhone;

    @Email(message = "Contact email must be a valid email address")
    @Size(max = 100, message = "Contact email must not exceed 100 characters")
    private String contactEmail;

    private Boolean active;
}
