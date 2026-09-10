package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {

    @NotBlank(message = "petId is required")
    private String petId;

    private String petName;

    @NotBlank(message = "ownerId is required")
    private String ownerId;

    private String ownerName;
    private String ownerPhone;

    private String vetId;

    @NotBlank(message = "vetName is required")
    private String vetName;

    @NotBlank(message = "serviceType is required")
    private String serviceType;

    @NotNull(message = "appointmentDate is required")
    private LocalDate appointmentDate;

    @NotBlank(message = "timeSlot is required")
    private String timeSlot;

    @NotBlank(message = "reason is required")
    private String reason;

    private String symptoms;
    private String notes;
}
