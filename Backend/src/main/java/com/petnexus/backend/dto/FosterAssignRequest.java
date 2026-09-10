package com.petnexus.backend.dto;

import lombok.Data;

/**
 * Request DTO for assigning a foster parent to a rescue case.
 * Matches rescueApi.assignFoster(caseId, fosterId, fosterName) payload.
 */
@Data
public class FosterAssignRequest {

    private String fosterId;
    private String fosterName;
}
