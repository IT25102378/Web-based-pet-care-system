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
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Review comments are required")
    @Size(max = 2000, message = "Comments cannot exceed 2000 characters")
    private String comments;

    private String staffMentioned;
}
