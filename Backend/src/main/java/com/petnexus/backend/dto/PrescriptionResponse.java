package com.petnexus.backend.dto;

import com.petnexus.backend.entity.Prescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {

    private Long id;
    private String prescriptionId;
    private String consultationId;
    private String petId;
    private String petName;
    private String ownerName;
    private String vetId;
    private String vetName;
    private String vetLicense;
    private LocalDate issueDate;
    private LocalDate validUntil;
    private String status;
    private String instructions;
    private String digitalSignature;

    @Builder.Default
    private List<PrescriptionItemDto> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PrescriptionResponse from(Prescription p) {
        if (p == null) return null;

        List<PrescriptionItemDto> itemDtos = (p.getItems() != null)
                ? p.getItems().stream().map(PrescriptionItemDto::from).collect(Collectors.toList())
                : new ArrayList<>();

        return PrescriptionResponse.builder()
                .id(p.getId())
                .prescriptionId(p.getPrescriptionId())
                .consultationId(p.getConsultationId())
                .petId(p.getPetId())
                .petName(p.getPetName())
                .ownerName(p.getOwnerName())
                .vetId(p.getVetId())
                .vetName(p.getVetName())
                .vetLicense(p.getVetLicense())
                .issueDate(p.getIssueDate())
                .validUntil(p.getValidUntil())
                .status(p.getStatus())
                .instructions(p.getInstructions())
                .digitalSignature(p.getDigitalSignature())
                .items(itemDtos)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
