package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for assigning a foster parent to a rescue case.
 * Matches rescueApi.assignFoster(caseId, fosterId, fosterName) payload.
 */
@Data
public class FosterAssignRequest {

    @Size(max = 50, message = "Foster ID cannot be longer than 50 characters")
    private String fosterId;

    @NotBlank(message = "fosterName is required for foster assignment.")
    @Size(max = 150, message = "Foster name cannot be longer than 150 characters")
    private String fosterName;
}
