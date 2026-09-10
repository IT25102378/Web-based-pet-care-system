package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a service package booking.
 */
public class PackageBookingCreateRequest {

    @NotBlank
    @Size(max = 20)
    private String ownerId;

    @NotBlank
    @Size(max = 100)
    private String packageName;

    @NotNull
    private Integer totalSessions;

    // Getters and setters
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }
}
