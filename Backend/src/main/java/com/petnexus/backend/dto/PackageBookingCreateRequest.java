package com.petnexus.backend.dto;



import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a service package booking.
 */
public class PackageBookingCreateRequest {

    @NotBlank(message = "Owner ID is required")
    @Size(max = 20, message = "Owner ID cannot be longer than 20 characters")
    private String ownerId;

    @Size(max = 100, message = "Owner name cannot be longer than 100 characters")
    private String ownerName;

    @Size(max = 20, message = "Pet ID cannot be longer than 20 characters")
    private String petId;

    @Size(max = 100, message = "Pet name cannot be longer than 100 characters")
    private String petName;

    @Size(max = 50, message = "Package ID cannot be longer than 50 characters")
    private String packageId;

    @NotBlank(message = "Package name is required")
    @Size(max = 100, message = "Package name cannot be longer than 100 characters")
    private String packageName;

    @NotNull(message = "Total sessions is required")
    @Min(value = 1, message = "Total sessions must be between 1 and 100")
    @Max(value = 100, message = "Total sessions must be between 1 and 100")
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
