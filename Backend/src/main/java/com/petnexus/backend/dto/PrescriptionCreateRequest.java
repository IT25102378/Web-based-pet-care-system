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
public class PrescriptionCreateRequest {

    // Wrapped object (when sent as { prescriptionData: {...}, items: [...] })
    private PrescriptionDataDto prescriptionData;

    // Flat fields (when sent as flat JSON)
    private String consultationId;
    private String petId;
    private String petName;
    private String ownerName;
    private String vetId;
    private String vetName;
    private String vetLicense;
    private String instructions;
    private String digitalSignature;

    @Builder.Default
    private List<PrescriptionItemDto> items = new ArrayList<>();

    // Helper getters to resolve fields whether wrapped or flat
    public String resolveConsultationId() {
        return prescriptionData != null && prescriptionData.getConsultationId() != null
                ? prescriptionData.getConsultationId() : consultationId;
    }

    public String resolvePetId() {
        return prescriptionData != null && prescriptionData.getPetId() != null
                ? prescriptionData.getPetId() : petId;
    }

    public String resolvePetName() {
        return prescriptionData != null && prescriptionData.getPetName() != null
                ? prescriptionData.getPetName() : petName;
    }

    public String resolveOwnerName() {
        return prescriptionData != null && prescriptionData.getOwnerName() != null
                ? prescriptionData.getOwnerName() : ownerName;
    }

    public String resolveVetId() {
        return prescriptionData != null && prescriptionData.getVetId() != null
                ? prescriptionData.getVetId() : vetId;
    }

    public String resolveVetName() {
        return prescriptionData != null && prescriptionData.getVetName() != null
                ? prescriptionData.getVetName() : vetName;
    }

    public String resolveVetLicense() {
        return prescriptionData != null && prescriptionData.getVetLicense() != null
                ? prescriptionData.getVetLicense() : vetLicense;
    }

    public String resolveInstructions() {
        return prescriptionData != null && prescriptionData.getInstructions() != null
                ? prescriptionData.getInstructions() : instructions;
    }

    public String resolveDigitalSignature() {
        return prescriptionData != null && prescriptionData.getDigitalSignature() != null
                ? prescriptionData.getDigitalSignature() : digitalSignature;
    }
}
