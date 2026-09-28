package com.petnexus.backend.dto;

import com.petnexus.backend.entity.Vaccination;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationResponse {
    private Long id;
    private String vaccineId;
    private String petId;
    private String petName;
    private String vaccineName;
    private String batchNumber;
    private LocalDate administeredDate;
    private LocalDate nextDueDate;
    private String administeredBy;
    private String status;

    public static VaccinationResponse from(Vaccination v) {
        if (v == null) return null;
        return VaccinationResponse.builder()
                .id(v.getId())
                .vaccineId(v.getVaccineId())
                .petId(v.getPet() != null ? v.getPet().getPetId() : null)
                .petName(v.getPetName() != null ? v.getPetName() : (v.getPet() != null ? v.getPet().getName() : null))
                .vaccineName(v.getVaccineName())
                .batchNumber(v.getBatchNumber())
                .administeredDate(v.getAdministeredDate())
                .nextDueDate(v.getNextDueDate())
                .administeredBy(v.getAdministeredBy())
                .status(v.getStatus())
                .build();
    }
}
