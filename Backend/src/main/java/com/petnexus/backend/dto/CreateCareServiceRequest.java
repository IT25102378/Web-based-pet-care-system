package com.petnexus.backend.dto;




import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class CreateCareServiceRequest {

    @Size(max = 20, message = "Service ID cannot be longer than 20 characters")
    private String serviceId;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot be longer than 100 characters")
    private String name;

    @Size(max = 2000, message = "Description cannot be longer than 2000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal price;

    /** Original full-value price for strike-through display (optional) */
    @PositiveOrZero(message = "Original value cannot be negative")
    private BigDecimal originalValue;

    /** Discount percentage 0-100 (optional) */
    @Min(value = 0, message = "Discount must be between 0 and 100 percent")
    @Max(value = 100, message = "Discount must be between 0 and 100 percent")
    private Integer discountPercent;

    /** Marketing badge text (e.g. "Popular") */
    @Size(max = 50, message = "Badge cannot be longer than 50 characters")
    private String badge;

    /** One-line marketing tagline */
    @Size(max = 300, message = "Tagline cannot be longer than 300 characters")
    private String tagline;

    /** Recommended pet type */
    @Size(max = 100, message = "Recommended for cannot be longer than 100 characters")
    private String recommendedFor;

    /** Duration in minutes — optional, defaults to 60 */
    @Min(value = 1, message = "Duration must be between 1 and 1440 minutes")
    @Max(value = 1440, message = "Duration must be between 1 and 1440 minutes")
    private Integer durationMinutes;

    @Size(max = 20, message = "Created by user ID cannot be longer than 20 characters")
    private String createdByUserId;

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
    public String getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(String createdByUserId) { this.createdByUserId = createdByUserId; }
}

