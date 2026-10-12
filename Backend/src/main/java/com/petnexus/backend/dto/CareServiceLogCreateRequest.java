package com.petnexus.backend.dto;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO for creating a Care Service Log (service appointment / grooming session).
 * Fully compatible with Frontend service logs form and API contract.
 */
public class CareServiceLogCreateRequest {

    @Size(max = 100, message = "Service type cannot be longer than 100 characters")
    private String serviceType;

    @Size(max = 50, message = "Service ID cannot be longer than 50 characters")
    private String serviceId;

    @Size(max = 20, message = "Appointment ID cannot be longer than 20 characters")
    private String appointmentId;

    @Size(max = 20, message = "Pet ID cannot be longer than 20 characters")
    private String petId;

    @Size(max = 100, message = "Pet name cannot be longer than 100 characters")
    private String petName;

    @Size(max = 20, message = "Owner ID cannot be longer than 20 characters")
    private String ownerId;

    @Size(max = 100, message = "Owner name cannot be longer than 100 characters")
    private String ownerName;

    @Size(max = 30, message = "Provider ID cannot be longer than 30 characters")
    private String providerId;

    @Size(max = 100, message = "Provider name cannot be longer than 100 characters")
    private String providerName;

    private LocalDate serviceDate;

    private ServiceStatus status;

    @Size(max = 1000, message = "Intake condition cannot be longer than 1000 characters")
    private String intakeCondition;

    @Size(max = 1000, message = "Services performed cannot be longer than 1000 characters")
    private String servicesPerformed;

    @Size(max = 1000, message = "Notes cannot be longer than 1000 characters")
    private String notes;

    private boolean returnToRescue;

    // Optional caseId for rescue animals
    @Size(max = 30, message = "Case ID cannot be longer than 30 characters")
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
