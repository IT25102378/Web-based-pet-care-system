package com.petnexus.backend.controller;

import com.petnexus.backend.dto.NotificationResponse;
import com.petnexus.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for System and Operational Notifications.
 * Exactly matches Frontend/src/api/notificationApi.js contract.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/notifications")
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable String notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Boolean> markAllAsRead(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.markAllAsRead(userId));
    }
}
