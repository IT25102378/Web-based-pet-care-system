package com.petnexus.backend.dto;

import com.petnexus.backend.entity.PrescriptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemDto {

    private String itemId;
    private String prescriptionId;
    private String medicationName;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private Integer quantityPrescribed;
    private Integer refillsAllowed;

    public static PrescriptionItemDto from(PrescriptionItem item) {
        if (item == null) return null;
        return PrescriptionItemDto.builder()
                .itemId(item.getItemId())
                .prescriptionId(item.getPrescriptionId())
                .medicationName(item.getMedicationName())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .durationDays(item.getDurationDays())
                .quantityPrescribed(item.getQuantityPrescribed())
                .refillsAllowed(item.getRefillsAllowed())
                .build();
    }
}
