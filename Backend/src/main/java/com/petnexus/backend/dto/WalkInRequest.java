package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalkInRequest {

    @NotBlank(message = "ownerName is required")
    private String ownerName;

    private String ownerPhone;

    @NotBlank(message = "petName is required")
    private String petName;

    private String species;
    private String breed;

    @NotBlank(message = "serviceType is required")
    private String serviceType;

    @NotBlank(message = "vetName is required")
    private String vetName;

    private String vetId;

    @NotBlank(message = "reason is required")
    private String reason;

    private String symptoms;
    private String severity;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String notes;
}
