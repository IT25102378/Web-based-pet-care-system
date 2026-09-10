package com.petnexus.backend.service;

import com.petnexus.backend.dto.NotificationResponse;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Notifications.
 * Handles dispatching, querying, and read status for all system alerts and updates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String userId) {
        com.petnexus.backend.security.SecurityUtils.getCurrentUser();
        User current = com.petnexus.backend.security.SecurityUtils.getCurrentUser();
        String effectiveUserId = userId;
        if (effectiveUserId != null && !effectiveUserId.isBlank()) {
            if (current != null) {
                com.petnexus.backend.security.SecurityUtils.enforceOwnershipOrRole(effectiveUserId.trim(), UserRole.Admin);
            }
        } else if (current != null && current.getRole() != UserRole.Admin) {
            effectiveUserId = current.getUserId();
        }

        final String targetUserId = effectiveUserId;
        if (targetUserId != null && !targetUserId.isBlank()) {
            User user = userRepository.findByUserId(targetUserId.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + targetUserId));
            return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(String notificationId) {
        if (notificationId == null || notificationId.isBlank()) {
            throw new BadRequestException("Notification ID is required");
        }
        Notification notification = notificationRepository.findByNotificationId(notificationId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (notification.getUser() != null && com.petnexus.backend.security.SecurityUtils.getCurrentUser() != null) {
            com.petnexus.backend.security.SecurityUtils.enforceOwnershipOrRole(notification.getUser().getUserId(), UserRole.Admin);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        log.info("Marked notification {} as read", notificationId);
        return toResponse(notification);
    }

    @Transactional
    public boolean markAllAsRead(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("User ID is required to mark all notifications as read");
        }
        if (com.petnexus.backend.security.SecurityUtils.getCurrentUser() != null) {
            com.petnexus.backend.security.SecurityUtils.enforceOwnershipOrRole(userId.trim(), UserRole.Admin);
        }
        User user = userRepository.findByUserId(userId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Notification> unreadList = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification n : unreadList) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unreadList);
        log.info("Marked all {} unread notifications as read for user {}", unreadList.size(), userId);
        return true;
    }

    @Transactional
    public NotificationResponse createNotification(String userId, NotificationType type, String title, String message, String link) {
        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("User ID is required to dispatch notification");
        }
        User user = userRepository.findByUserId(userId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String notificationId = String.format("NTF-%d", System.currentTimeMillis());

        Notification notification = Notification.builder()
                .notificationId(notificationId)
                .user(user)
                .type(type != null ? type : NotificationType.System)
                .title(title != null ? title.trim() : "System Notification")
                .message(message != null ? message.trim() : "")
                .isRead(false)
                .link(link != null ? link.trim() : null)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        log.info("Dispatched notification {} to user {} [{}]: {}", notificationId, userId, type, title);
        return toResponse(notification);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        if (userId == null || userId.isBlank()) return 0;
        return userRepository.findByUserId(userId.trim())
                .map(notificationRepository::countByUserAndIsReadFalse)
                .orElse(0L);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUserId())
                .type(n.getType() != null ? n.getType().getValue() : NotificationType.System.getValue())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.isRead())
                .link(n.getLink())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
