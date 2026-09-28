package com.petnexus.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for Notifications.
 * Matches Frontend NotificationBell.jsx and initialNotifications.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private String notificationId;
    private String userId;
    private String type;
    private String title;
    private String message;

    @JsonProperty("isRead")
    private boolean isRead;

    private String link;
    private LocalDateTime createdAt;
}
