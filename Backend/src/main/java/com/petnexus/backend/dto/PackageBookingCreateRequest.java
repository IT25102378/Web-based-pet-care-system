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

    @Size(max = 100)
    private String ownerName;

    @Size(max = 20)
    private String petId;

    @Size(max = 100)
    private String petName;

    @Size(max = 50)
    private String packageId;

    @NotBlank
    @Size(max = 100)
    private String packageName;

    @NotNull
    private Integer totalSessions;

    // Getters and setters
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getPetId() { return petId; }
    public void setPetId(String petId) { this.petId = petId; }
    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }
    public String getPackageId() { return packageId; }
    public void setPackageId(String packageId) { this.packageId = packageId; }
    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }
    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }
}
