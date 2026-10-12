package com.petnexus.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for submitting client feedback.
 * Matches Frontend feedbackApi.js submitFeedback and FeedbackSubmitPage.jsx.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    private String userName;

    @NotBlank(message = "Service category is required")
    private String serviceCategory;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    private Integer rating;

    @NotBlank(message = "Review headline / summary is required")
    @Size(min = 5, max = 200, message = "Review title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Review comments are required")
    @Size(min = 10, max = 2000, message = "Review comments must be between 10 and 2000 characters")
    private String comments;

    private String staffMentioned;
}
