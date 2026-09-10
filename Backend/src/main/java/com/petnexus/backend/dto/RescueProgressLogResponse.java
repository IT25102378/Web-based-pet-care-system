package com.petnexus.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for a single RescueProgressLog entry.
 */
@Data
@Builder
public class RescueProgressLogResponse {

    private String logId;
    private String caseId;
    private String loggedBy;
    private LocalDateTime logDate;
    private String logType;
    private String title;
    private String notes;
}
