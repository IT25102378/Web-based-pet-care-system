package com.petnexus.backend.dto;

import com.petnexus.backend.enums.ServiceStatus;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for exposing Care Service / Wellness Package data to the frontend.
 * Includes all fields needed by PackageManagementPage and the Pet Owner package browser.
 */
public class CareServiceResponseDto {

    private String serviceId;
    /** Alias for serviceId — the frontend uses packageId as the primary key field */
    private String packageId;
    private String name;
    private String description;
    private BigDecimal price;
    /** Original value before discount (for strikethrough display) */
    private BigDecimal originalValue;
    private Integer discountPercent;
    /** Marketing badge text (e.g. "Popular", "Best Seller") */
    private String badge;
    /** One-line marketing tagline */
    private String tagline;
    /** Recommended for (e.g. "All pets", "Dogs & Cats") */
    private String recommendedFor;
    private Integer durationMinutes;
    private ServiceStatus status;
    /** Derived: true when status == SCHEDULED (active), false otherwise */
    private boolean active;
    /** Feature list parsed from description (one item per comma-separated line) */
    private List<String> features;
    private String createdByUserId;

    // Getters and Setters
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; this.packageId = serviceId; }
    public String getPackageId() { return packageId; }
    public void setPackageId(String packageId) { this.packageId = packageId; }
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
    public ServiceStatus getStatus() { return status; }
    public void setStatus(ServiceStatus status) { this.status = status; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }
    public String getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(String createdByUserId) { this.createdByUserId = createdByUserId; }
}

