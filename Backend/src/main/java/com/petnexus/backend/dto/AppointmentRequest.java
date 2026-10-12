package com.petnexus.backend.dto;


import jakarta.validation.constraints.Size;
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
    @Size(min = 5, max = 1000, message = "Reason for visit must be between 5 and 1000 characters")
    private String reason;

    @Size(max = 1000, message = "Symptoms cannot be longer than 1000 characters")
    private String symptoms;
    @Size(max = 2000, message = "Notes cannot be longer than 2000 characters")
    private String notes;
}
