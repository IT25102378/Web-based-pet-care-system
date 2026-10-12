package com.petnexus.backend.dto;



import jakarta.validation.constraints.Pattern;
import com.petnexus.backend.validation.ValidationRules;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCareProviderRequest {

    @NotBlank(message = "Provider ID is required")
    @Size(max = 20, message = "Provider ID cannot be longer than 20 characters")
    private String providerId;

    @NotBlank(message = "User ID is required")
    @Size(max = 20, message = "User ID cannot be longer than 20 characters")
    private String userId; // references existing User

    @NotBlank(message = "Provider name is required")
    @Size(max = 100, message = "Provider name cannot be longer than 100 characters")
    private String providerName;

    @Size(max = 20, message = "Contact phone cannot be longer than 20 characters")
    @Pattern(regexp = ValidationRules.OPTIONAL_PHONE, message = ValidationRules.PHONE_MESSAGE)
    private String contactPhone;

    @Size(max = 100, message = "Contact email cannot be longer than 100 characters")
    private String contactEmail;

    @NotNull(message = "Active is required")
    private Boolean active;

    // getters and setters
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
