package com.petnexus.backend.dto;


import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for adding a progress log entry to a rescue case.
 */
@Data
public class RescueProgressLogRequest {

    private String loggedBy;

    /** Medical | Behavioral | Milestone | Foster | Intake | Status */
    private String logType;

    @Size(max = 200, message = "Log title cannot be longer than 200 characters")
    private String title;
    @Size(max = 2000, message = "Log notes cannot be longer than 2000 characters")
    private String notes;
}
