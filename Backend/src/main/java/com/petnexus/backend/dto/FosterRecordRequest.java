package com.petnexus.backend.dto;










import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FosterRecordRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 150, message = "Full name must be between 3 and 150 characters")
    @Pattern(regexp = ValidationRules.OPTIONAL_PERSON_NAME, message = ValidationRules.PERSON_NAME_MESSAGE)
    private String fullName;

    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String phone;
    @Email(message = ValidationRules.EMAIL_MESSAGE)
    @Size(max = 150, message = "Email cannot be longer than 150 characters")
    private String email;
    @Size(max = 300, message = "Address cannot be longer than 300 characters")
    private String address;
    @Size(max = 200, message = "Home type cannot be longer than 200 characters")
    private String homeType;
    @PositiveOrZero(message = "Active placements cannot be negative")
    private Integer activePlacements;
    @Min(value = 1, message = "Maximum capacity must be between 1 and 20 animals")
    @Max(value = 20, message = "Maximum capacity must be between 1 and 20 animals")
    private Integer maxCapacity;
    @DecimalMin(value = "0.0", message = "Rating must be between 0.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 0.0 and 5.0")
    private BigDecimal rating;
    private String status;
}
