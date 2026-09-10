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
public class VaccinationRequest {
    @NotBlank(message = "Pet ID is required")
    private String petId;
    private String petName;

    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;
    private String batchNumber;
    private LocalDate administeredDate;
    private LocalDate nextDueDate;
    private String administeredBy;
    private String status;
}
