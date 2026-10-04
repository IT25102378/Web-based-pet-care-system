package com.petnexus.backend.dto;

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
    private String fullName;

    private String phone;
    private String email;
    private String address;
    private String homeType;
    private Integer activePlacements;
    private Integer maxCapacity;
    private BigDecimal rating;
    private String status;
}
