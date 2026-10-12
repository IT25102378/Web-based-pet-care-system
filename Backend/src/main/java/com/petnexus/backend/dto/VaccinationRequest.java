package com.petnexus.backend.dto;



import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
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
    @Size(max = 200, message = "Vaccine name cannot be longer than 200 characters")
    private String vaccineName;
    @Size(max = 50, message = "Batch number cannot be longer than 50 characters")
    private String batchNumber;
    @PastOrPresent(message = "Vaccination date cannot be in the future")
    private LocalDate administeredDate;
    private LocalDate nextDueDate;
    @Size(max = 150, message = "Administered by cannot be longer than 150 characters")
    private String administeredBy;
    private String status;
}
