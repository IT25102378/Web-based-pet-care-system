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
public class RescheduleRequest {

    @NotNull(message = "appointmentDate is required")
    private LocalDate appointmentDate;

    @NotBlank(message = "timeSlot is required")
    private String timeSlot;

    private String vetName;
    private String vetId;
    private String rescheduleReason;
}
