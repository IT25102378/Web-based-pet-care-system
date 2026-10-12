package com.petnexus.backend.dto;





import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
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
    @NotBlank(message = "Medication name is required for every prescription item")
    @Size(max = 200, message = "Medication name cannot be longer than 200 characters")
    private String medicationName;
    @Size(max = 100, message = "Dosage cannot be longer than 100 characters")
    private String dosage;
    @Size(max = 100, message = "Frequency cannot be longer than 100 characters")
    private String frequency;
    @Min(value = 1, message = "Duration must be between 1 and 365 days")
    @Max(value = 365, message = "Duration must be between 1 and 365 days")
    private Integer durationDays;
    @Min(value = 1, message = "Quantity prescribed must be between 1 and 1000")
    @Max(value = 1000, message = "Quantity prescribed must be between 1 and 1000")
    private Integer quantityPrescribed;
    @Min(value = 0, message = "Refills allowed must be between 0 and 10")
    @Max(value = 10, message = "Refills allowed must be between 0 and 10")
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
