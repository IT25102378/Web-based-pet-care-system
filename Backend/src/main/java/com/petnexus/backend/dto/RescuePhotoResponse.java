package com.petnexus.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for a single RescuePhoto.
 */
@Data
@Builder
public class RescuePhotoResponse {

    private String photoId;
    private String caseId;
    private String photoUrl;
    private String caption;
    private LocalDateTime uploadedAt;
    private String tag;
}
