package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistoryResponse {

    private PetResponse pet;

    @Builder.Default
    private List<ConsultationResponse> consultations = new ArrayList<>();

    @Builder.Default
    private List<PrescriptionResponse> prescriptions = new ArrayList<>();

    @Builder.Default
    private List<VaccinationResponse> vaccinations = new ArrayList<>();
}
