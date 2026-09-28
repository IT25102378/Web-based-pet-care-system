package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Supplier queries. Matches frontend contract in supplierApi.js.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponse {
    private String supplierId;
    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String category;
    private Integer leadTimeDays;
    private BigDecimal rating;
    private String address;
    private boolean active;
    private LocalDateTime createdAt;
}
