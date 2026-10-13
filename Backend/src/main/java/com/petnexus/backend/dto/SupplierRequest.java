package com.petnexus.backend.dto;




import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
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
    @Size(max = 150, message = "Company name cannot be longer than 150 characters")
    private String companyName;

    @Size(max = 100, message = "Contact person cannot be longer than 100 characters")
    private String contactPerson;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email cannot be longer than 100 characters")
    private String email;

    @Size(max = 30, message = "Phone cannot be longer than 30 characters")
    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String phone;

    @Size(max = 100, message = "Category cannot be longer than 100 characters")
    private String category;

    @PositiveOrZero(message = "Lead time must be a positive number of days (0 or greater)")
    @Max(value = 365, message = "Lead time must be between 0 and 365 days")
    private Integer leadTimeDays;

    @PositiveOrZero(message = "Rating must be between 0.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 0.0 and 5.0")
    @Digits(integer = 1, fraction = 1, message = "Rating can have at most one decimal place (e.g. 4.5)")
    private BigDecimal rating;

    @Size(max = 300, message = "Address cannot be longer than 300 characters")
    private String address;

    private Boolean active;
}
