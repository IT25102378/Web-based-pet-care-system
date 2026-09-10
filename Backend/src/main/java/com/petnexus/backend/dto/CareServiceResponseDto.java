package com.petnexus.backend.dto;

import com.petnexus.backend.enums.ServiceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * DTO for exposing Care Service data to the frontend.
 */
public class CareServiceResponseDto {

    @NotBlank
    @Size(max = 20)
    private String serviceId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Integer durationMinutes;

    @NotNull
    private ServiceStatus status;

    @NotBlank
    @Size(max = 20)
    private String createdByUserId;

    // Getters and Setters
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public ServiceStatus getStatus() { return status; }
    public void setStatus(ServiceStatus status) { this.status = status; }
    public String getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(String createdByUserId) { this.createdByUserId = createdByUserId; }
}
