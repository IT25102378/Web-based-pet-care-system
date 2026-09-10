package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionListingDto {
    private String listingId;
    private String caseId;
    private boolean isPublishedForAdoption;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
