package com.petnexus.backend.config;

import com.petnexus.backend.entity.Feedback;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.repository.FeedbackRepository;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds the customer feedback and the in-app notifications (M6). Runs last, because its
 * notifications point at rows the earlier seeders create.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FeedbackSeeder {

    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationRepository notificationRepository;

    public void seed() {
        User owner = userRepository.findByEmail("owner@petnexus.com")
                .orElseThrow(() -> new IllegalStateException(
                        "Pet owner account is missing. UserSeeder must run before this seeder."));

        User manager = userRepository.findByEmail("manager@petnexus.com")
                .orElseThrow(() -> new IllegalStateException(
                        "Clinic manager account is missing. UserSeeder must run before this seeder."));

        if (feedbackRepository.count() == 0) {
            log.info("Seeding initial Feedback into PetNexus database...");
            feedbackRepository.save(Feedback.builder()
                    .feedbackId("FDB-001")
                    .user(owner)
                    .userName("Kavindu Perera")
                    .serviceCategory("Veterinary Consultation")
                    .rating(5)
                    .title("Outstanding care by Dr. Wijesinghe for Barnaby's allergies")
                    .comments("Dr. Wijesinghe took the time to explain the difference between food and environmental allergies. Barnaby stopped itching within 48 hours. Incredible clinic atmosphere!")
                    .staffMentioned("Dr. Sachini Wijesinghe")
                    .managerResponse("Thank you Kavindu! We are thrilled to hear Barnaby is feeling playful and allergy-free.")
                    .managerRespondedAt(LocalDateTime.of(2026, 7, 23, 9, 30))
                    .createdAt(LocalDateTime.of(2026, 7, 22, 14, 0))
                    .build());

            feedbackRepository.save(Feedback.builder()
                    .feedbackId("FDB-002")
                    .user(owner)
                    .userName("Kavindu Perera")
                    .serviceCategory("Grooming & Spa")
                    .rating(5)
                    .title("Dilshan is a master with big golden retrievers")
                    .comments("Barnaby came out looking like a show dog! His coat smells fresh and clean, and he wasn’t stressed at all.")
                    .staffMentioned("Dilshan Bandara")
                    .managerResponse("We love having Barnaby in the salon! Thank you for trusting us with his grooming.")
                    .managerRespondedAt(LocalDateTime.of(2026, 7, 27, 10, 0))
                    .createdAt(LocalDateTime.of(2026, 7, 26, 16, 30))
                    .build());
            log.info("Seeded 2 feedback entries.");
        }

        if (notificationRepository.count() == 0) {
            log.info("Seeding initial Notifications into PetNexus database...");
            notificationRepository.save(Notification.builder()
                    .notificationId("NTF-01")
                    .user(owner)
                    .type(NotificationType.Appointment)
                    .title("Appointment Reminder")
                    .message("Barnaby is checked in for today’s Routine Wellness visit with Dr. Sachini Wijesinghe (Token: A-01).")
                    .isRead(false)
                    .link("/owner/appointments")
                    .createdAt(LocalDateTime.of(2026, 8, 15, 9, 30))
                    .build());

            notificationRepository.save(Notification.builder()
                    .notificationId("NTF-02")
                    .user(owner)
                    .type(NotificationType.Adoption)
                    .title("Adoption Application Under Review")
                    .message("Your adoption application for Luna (RSC-2026-001) has been received and is being reviewed by Rescue Officer Shehan Rajapaksha.")
                    .isRead(false)
                    .link("/owner/adopt")
                    .createdAt(LocalDateTime.of(2026, 8, 13, 10, 0))
                    .build());

            notificationRepository.save(Notification.builder()
                    .notificationId("NTF-04")
                    .user(manager)
                    .type(NotificationType.Inventory)
                    .title("Low Stock Alert: Rabies Vaccine")
                    .message("Rabies 3-Year Vaccine has fallen below minimum reorder threshold (4 vials remaining).")
                    .isRead(false)
                    .link("/manager/inventory")
                    .createdAt(LocalDateTime.of(2026, 8, 15, 8, 0))
                    .build());
            log.info("Seeded 3 notifications.");
        }
    }
}
