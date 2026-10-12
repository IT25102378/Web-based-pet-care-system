package com.petnexus.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateListingRequest {
    @JsonProperty("isPublishedForAdoption")
    private boolean isPublishedForAdoption;
}
