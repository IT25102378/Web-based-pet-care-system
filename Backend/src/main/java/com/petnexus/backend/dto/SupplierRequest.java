package com.petnexus.backend.dto;

import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a Supplier.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    private String companyName;

    @Size(max = 100)
    private String contactPerson;

    @NotBlank(message = "Email address is required")
    @Email(message = ValidationRules.EMAIL_MESSAGE)
    @Size(max = 100)
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 100)
    private String category;

    @PositiveOrZero(message = "Lead time must be a positive number of days (0 or greater)")
    private Integer leadTimeDays;

    @PositiveOrZero(message = "Rating must be between 0.0 and 5.0")
    private BigDecimal rating;

    @Size(max = 300)
    private String address;

    private Boolean active;
}
