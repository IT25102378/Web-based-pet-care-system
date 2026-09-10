package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionApplicationDto {
    private String applicationId;
    private String caseId;
    private String applicantId;
    private String petName;
    private String applicantName;
    private String applicantPhone;
    private String status;
    private String reviewNotes;
    private String reviewedBy;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
