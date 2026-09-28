package com.petnexus.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for manager replying to client feedback.
 * Matches Frontend feedbackApi.js respondToFeedback:
 * POST /feedback/{feedbackId}/respond { responseText }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRespondRequest {

    @NotBlank(message = "Response text is required")
    @Size(max = 2000, message = "Response cannot exceed 2000 characters")
    private String responseText;
}
