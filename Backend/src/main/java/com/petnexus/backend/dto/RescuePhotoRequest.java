package com.petnexus.backend.dto;

import lombok.Data;

/**
 * Request DTO for adding a photo to a rescue case.
 */
@Data
public class RescuePhotoRequest {

    private String photoUrl;
    private String caption;

    /** Intake Evidence | Adoption Profile | Foster Life | Medical | Other */
    private String tag;
}
