package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a Care Service.
 */
public class CareServiceUpdateRequest {

    @NotBlank
    @Size(max = 20)
    private String serviceId;

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    private BigDecimal price;

    @NotNull
    private Integer durationMinutes;

    // status can be set to ACTIVE or INACTIVE via separate activate/deactivate calls
    // Here we keep it optional for partial updates
    private Boolean active;

    // getters and setters
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
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
