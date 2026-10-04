package com.petnexus.backend.dto;

import lombok.Data;

/**
 * Request DTO for adding a progress log entry to a rescue case.
 */
@Data
public class RescueProgressLogRequest {

    private String loggedBy;

    /** Medical | Behavioral | Milestone | Foster | Intake | Status */
    private String logType;

    private String title;
    private String notes;
}
