package com.petnexus.backend.service;

import com.petnexus.backend.dto.FeedbackRequest;
import com.petnexus.backend.dto.FeedbackResponse;
import com.petnexus.backend.entity.Feedback;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.FeedbackRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for Client Reviews, Feedback, and Manager Resolutions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbacks(String userId, String category) {
        if (userId != null && !userId.isBlank()) {
            SecurityUtils.enforceOwnershipOrRole(userId, UserRole.Admin, UserRole.ClinicManager);
        }
        
        List<Feedback> list;
        if (userId != null && !userId.isBlank()) {
            User user = userRepository.findByUserId(userId.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            list = feedbackRepository.findByUserOrderByCreatedAtDesc(user);
        } else {
            list = feedbackRepository.findAllByOrderByCreatedAtDesc();
        }

        if (category != null && !category.isBlank()) {
            list = list.stream()
                    .filter(f -> f.getServiceCategory() != null && f.getServiceCategory().equalsIgnoreCase(category.trim()))
                    .collect(Collectors.toList());
        }

        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FeedbackResponse getFeedbackById(String feedbackId) {
        Feedback feedback = feedbackRepository.findByFeedbackId(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + feedbackId));
        return toResponse(feedback);
    }

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new BadRequestException("User ID is required to submit feedback");
        }
        if (request.getServiceCategory() == null || request.getServiceCategory().isBlank()) {
            throw new BadRequestException("Service category is required");
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be an integer between 1 and 5");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Review title is required");
        }
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new BadRequestException("Review comments are required");
        }

        User user = userRepository.findByUserId(request.getUserId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));

        SecurityUtils.enforceOwnershipOrRole(user.getUserId(), UserRole.Admin, UserRole.ClinicManager);

        String userName = (request.getUserName() != null && !request.getUserName().isBlank())
                ? request.getUserName().trim() : user.getFullName();

        String staffMentioned = (request.getStaffMentioned() != null && !request.getStaffMentioned().isBlank())
                ? request.getStaffMentioned().trim() : "General Clinic Staff";

        long count = feedbackRepository.count() + 1;
        String feedbackId = String.format("FDB-%03d", count);

        Feedback feedback = Feedback.builder()
                .feedbackId(feedbackId)
                .user(user)
                .userName(userName)
                .serviceCategory(request.getServiceCategory().trim())
                .rating(request.getRating())
                .title(request.getTitle().trim())
                .comments(request.getComments().trim())
                .staffMentioned(staffMentioned)
                .createdAt(LocalDateTime.now())
                .build();

        feedbackRepository.save(feedback);
        log.info("Feedback {} submitted by {} for category {} (Rating: {})", feedbackId, userName, feedback.getServiceCategory(), feedback.getRating());

        // Notify Clinic Manager (USR-005 or first user with ClinicManager role)
        notifyClinicManagerNewFeedback(userName, feedback.getRating(), feedback.getServiceCategory());

        return toResponse(feedback);
    }

    @Transactional
    public FeedbackResponse respondToFeedback(String feedbackId, String responseText) {
        if (responseText == null || responseText.isBlank()) {
            throw new BadRequestException("Response text is required");
        }
        Feedback feedback = feedbackRepository.findByFeedbackId(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with ID: " + feedbackId));

        feedback.setManagerResponse(responseText.trim());
        feedback.setManagerRespondedAt(LocalDateTime.now());
        feedbackRepository.save(feedback);
        log.info("Manager responded to feedback {}", feedbackId);

        // Notify Feedback Author
        if (feedback.getUser() != null) {
            try {
                notificationService.createNotification(
                        feedback.getUser().getUserId(),
                        NotificationType.System,
                        "Clinic Manager Responded to Your Review",
                        String.format("The clinic manager has replied to your review: \"%s\"", feedback.getTitle()),
                        "/owner/feedback"
                );
            } catch (Exception e) {
                log.warn("Could not dispatch notification to author {}: {}", feedback.getUser().getUserId(), e.getMessage());
            }
        }

        return toResponse(feedback);
    }

    private void notifyClinicManagerNewFeedback(String clientName, int rating, String category) {
        try {
            // Find clinic manager user or default to USR-005
            List<User> managers = userRepository.findByRole(UserRole.ClinicManager);
            String managerUserId = !managers.isEmpty() ? managers.get(0).getUserId() : "USR-005";

            // If USR-005 exists in repository or manager found, create notification
            Optional<User> targetManager = userRepository.findByUserId(managerUserId);
            if (targetManager.isPresent()) {
                notificationService.createNotification(
                        targetManager.get().getUserId(),
                        NotificationType.System,
                        "New Client Feedback Submitted",
                        String.format("%s submitted a %d-star review for %s.", clientName, rating, category),
                        "/manager/feedback"
                );
            }
        } catch (Exception e) {
            log.warn("Could not dispatch feedback notification to clinic manager: {}", e.getMessage());
        }
    }

    private FeedbackResponse toResponse(Feedback f) {
        return FeedbackResponse.builder()
                .feedbackId(f.getFeedbackId())
                .userId(f.getUserId())
                .userName(f.getUserName())
                .serviceCategory(f.getServiceCategory())
                .rating(f.getRating())
                .title(f.getTitle())
                .comments(f.getComments())
                .staffMentioned(f.getStaffMentioned())
                .createdAt(f.getCreatedAt())
                .managerResponse(f.getManagerResponse())
                .managerRespondedAt(f.getManagerRespondedAt())
                .build();
    }
}
