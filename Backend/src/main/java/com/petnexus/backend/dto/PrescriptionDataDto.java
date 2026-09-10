package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDataDto {

    private String consultationId;
    private String petId;
    private String petName;
    private String ownerName;
    private String vetId;
    private String vetName;
    private String vetLicense;
    private String instructions;
    private String digitalSignature;
}
