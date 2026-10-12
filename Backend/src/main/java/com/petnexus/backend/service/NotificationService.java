package com.petnexus.backend.service;

import com.petnexus.backend.dto.NotificationResponse;
import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.AdoptionApplication;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.UserRepository;
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
    private final NotificationFactory notificationFactory;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String userId) {
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

    /**
     * Dispatches a notification. Construction is delegated to {@link NotificationFactory}
     * so every notification in the system shares one ID scheme and set of defaults.
     */
    @Transactional
    public NotificationResponse createNotification(String userId, NotificationType type, String title, String message, String link) {
        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("User ID is required to dispatch notification");
        }
        User user = userRepository.findByUserId(userId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Notification notification = notificationFactory.create(user, type, title, message, link);
        notificationRepository.save(notification);
        log.info("Dispatched notification {} to user {} [{}]: {}", notification.getNotificationId(), userId, notification.getType(), notification.getTitle());
        return toResponse(notification);
    }

    /**
     * Notifies the owner of an appointment about a booking / confirmation / reschedule / cancellation.
     * Never throws: a notification problem must not break the appointment transaction.
     */
    public void notifyAppointment(Appointment appointment, String status) {
        try {
            User owner = appointment.getOwner();
            if (owner == null) {
                return;
            }
            String when = appointment.getAppointmentDate() + " " + appointment.getTimeSlot();
            Notification notification = notificationFactory.createAppointmentNotification(
                    owner, appointment.getAppointmentId(), appointment.getPetName(), when, status);
            notificationRepository.save(notification);
            // FR-02 / minor function "e-mail confirmation": the same message is also e-mailed
            emailService.sendNotificationEmail(owner.getEmail(), notification.getTitle(), notification.getMessage());
        } catch (Exception e) {
            log.warn("Could not dispatch appointment notification for {}: {}", appointment.getAppointmentId(), e.getMessage());
        }
    }

    /**
     * Notifies an adoption applicant that their application changed status.
     */
    public void notifyAdoptionStatus(AdoptionApplication application, String status) {
        try {
            User applicant = application.getApplicant();
            if (applicant == null) {
                return;
            }
            String notes = (application.getReviewNotes() != null && !application.getReviewNotes().isBlank())
                    ? application.getReviewNotes().trim() : "No additional notes.";
            Notification notification = notificationFactory.createAdoptionStatusNotification(
                    applicant, application.getApplicationId(), application.getPetName(), status, notes);
            notificationRepository.save(notification);
            emailService.sendNotificationEmail(applicant.getEmail(), notification.getTitle(), notification.getMessage());
        } catch (Exception e) {
            log.warn("Could not dispatch adoption notification for {}: {}", application.getApplicationId(), e.getMessage());
        }
    }

    /**
     * Sends the same notification to every active clinic manager (instead of guessing a single manager).
     * Never throws: callers use it for side effects that must not break their own transaction.
     */
    public int notifyClinicManagers(NotificationType type, String title, String message, String link) {
        int sent = 0;
        try {
            for (User manager : userRepository.findByRole(UserRole.ClinicManager)) {
                if (manager.getStatus() != null && manager.getStatus() != com.petnexus.backend.enums.UserStatus.Active) {
                    continue;
                }
                notificationRepository.save(notificationFactory.create(manager, type, title, message, link));
                sent++;
            }
        } catch (Exception e) {
            log.warn("Could not notify clinic managers: {}", e.getMessage());
        }
        return sent;
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
