package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.petnexus.backend.enums.ServiceStatus;

/**
 * Request DTO for updating the status of a Care Service Log.
 */
public class ServiceLogStatusUpdateRequest {

    @NotNull
    private ServiceStatus status;

    // Optional notes to accompany the status change
    private String notes;

    // Getters and setters
    public ServiceStatus getStatus() { return status; }
    public void setStatus(ServiceStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
