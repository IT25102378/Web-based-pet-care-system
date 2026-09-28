package com.petnexus.backend.dto;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO for creating a Care Service Log (service appointment / grooming session).
 * Fully compatible with Frontend service logs form and API contract.
 */
public class CareServiceLogCreateRequest {

    @Size(max = 100)
    private String serviceType;

    @Size(max = 50)
    private String serviceId;

    @Size(max = 20)
    private String appointmentId;

    @Size(max = 20)
    private String petId;

    @Size(max = 100)
    private String petName;

    @Size(max = 20)
    private String ownerId;

    @Size(max = 100)
    private String ownerName;

    @Size(max = 30)
    private String providerId;

    @Size(max = 100)
    private String providerName;

    private LocalDate serviceDate;

    private ServiceStatus status;

    @Size(max = 1000)
    private String intakeCondition;

    @Size(max = 1000)
    private String servicesPerformed;

    @Size(max = 1000)
    private String notes;

    private boolean returnToRescue;

    // Optional caseId for rescue animals
    @Size(max = 30)
    private String caseId;

    // getters and setters
    public String getServiceType() { return serviceType != null ? serviceType : serviceId; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getServiceId() { return serviceId != null ? serviceId : serviceType; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getPetId() { return petId; }
    public void setPetId(String petId) { this.petId = petId; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public ServiceStatus getStatus() { return status; }
    public void setStatus(ServiceStatus status) { this.status = status; }

    public String getIntakeCondition() { return intakeCondition; }
    public void setIntakeCondition(String intakeCondition) { this.intakeCondition = intakeCondition; }

    public String getServicesPerformed() { return servicesPerformed; }
    public void setServicesPerformed(String servicesPerformed) { this.servicesPerformed = servicesPerformed; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isReturnToRescue() { return returnToRescue; }
    public void setReturnToRescue(boolean returnToRescue) { this.returnToRescue = returnToRescue; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
}
