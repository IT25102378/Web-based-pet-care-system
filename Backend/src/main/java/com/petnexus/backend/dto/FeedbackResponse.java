package com.petnexus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for Feedback items.
 * Matches Frontend feedbackApi.js and FeedbackReviewPage.jsx columns.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {

    private String feedbackId;
    private String userId;
    private String userName;
    private String serviceCategory;
    private Integer rating;
    private String title;
    private String comments;
    private String staffMentioned;
    private LocalDateTime createdAt;
    private String managerResponse;
    private LocalDateTime managerRespondedAt;
}
