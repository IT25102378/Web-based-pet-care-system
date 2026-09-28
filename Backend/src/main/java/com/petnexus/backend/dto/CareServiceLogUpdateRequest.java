package com.petnexus.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.petnexus.backend.enums.ServiceStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CareServiceLogUpdateRequest {

    @Size(max = 100, message = "Service type must not exceed 100 characters")
    private String serviceType;

    @Size(max = 255, message = "Intake condition must not exceed 255 characters")
    private String intakeCondition;

    @Size(max = 500, message = "Services performed must not exceed 500 characters")
    private String servicesPerformed;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    private LocalDate serviceDate;

    private ServiceStatus status;

    private Boolean returnToRescue;

    private Boolean transferredToRescue;

    private Boolean handedOverToRescue;
}
