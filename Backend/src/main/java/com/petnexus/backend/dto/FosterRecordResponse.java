package com.petnexus.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Response DTO for a FosterRecord (registered foster family).
 */
@Data
@Builder
public class FosterRecordResponse {

    private String fosterId;
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
