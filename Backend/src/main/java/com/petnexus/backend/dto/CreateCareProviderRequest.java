package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCareProviderRequest {

    @NotBlank
    @Size(max = 20)
    private String providerId;

    @NotBlank
    @Size(max = 20)
    private String userId; // references existing User

    @NotBlank
    @Size(max = 100)
    private String providerName;

    @Size(max = 20)
    private String contactPhone;

    @Size(max = 100)
    private String contactEmail;

    @NotNull
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
