package com.petnexus.backend.dto;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Response DTO for a Care Service Log entry.
 */
public class CareServiceLogResponseDto {

    @NotBlank
    private String serviceLogId;

    @NotBlank
    private String serviceType;

    private String intakeCondition;
    private String servicesPerformed;
    private String notes;

    private boolean returnToRescue;

    private LocalDate serviceDate;

    @NotBlank
    private String status;

    private String ownerId;
    private String ownerName;
    private String petId;
    private String petName;
    private String caseId;
    private String providerId;
    private String providerName;

    private LocalDate createdAt;

    // Getters and setters omitted for brevity
    public String getServiceLogId() { return serviceLogId; }
    public void setServiceLogId(String serviceLogId) { this.serviceLogId = serviceLogId; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getIntakeCondition() { return intakeCondition; }
    public void setIntakeCondition(String intakeCondition) { this.intakeCondition = intakeCondition; }
    public String getServicesPerformed() { return servicesPerformed; }
    public void setServicesPerformed(String servicesPerformed) { this.servicesPerformed = servicesPerformed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isReturnToRescue() { return returnToRescue; }
    public void setReturnToRescue(boolean returnToRescue) { this.returnToRescue = returnToRescue; }
    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getPetId() { return petId; }
    public void setPetId(String petId) { this.petId = petId; }
    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}
