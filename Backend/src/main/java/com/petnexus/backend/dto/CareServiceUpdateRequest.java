package com.petnexus.backend.dto;

import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Request DTO for updating a Care Service / Wellness Package.
 * All fields are optional — only non-null values are applied.
 */
public class CareServiceUpdateRequest {

    @Size(max = 20)
    private String serviceId;

    @Size(max = 100)
    private String name;

    @Size(max = 2000)
    private String description;

    private BigDecimal price;
    private BigDecimal originalValue;
    private Integer discountPercent;

    @Size(max = 50)
    private String badge;

    @Size(max = 300)
    private String tagline;

    @Size(max = 100)
    private String recommendedFor;

    private Integer durationMinutes;

    // active flag: if set, toggles between SCHEDULED (true) and COMPLETED/inactive (false)
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
    public BigDecimal getOriginalValue() { return originalValue; }
    public void setOriginalValue(BigDecimal originalValue) { this.originalValue = originalValue; }
    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getRecommendedFor() { return recommendedFor; }
    public void setRecommendedFor(String recommendedFor) { this.recommendedFor = recommendedFor; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}

