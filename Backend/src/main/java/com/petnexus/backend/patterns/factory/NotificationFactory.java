package com.petnexus.backend.patterns.factory;

import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ==============================================================================
 * DESIGN PATTERN: FACTORY METHOD / FACTORY PATTERN (GoF Creational Pattern)
 * ==============================================================================
 * WHERE USED:
 *   - com.petnexus.backend.service.NotificationService
 *   - com.petnexus.backend.service.AppointmentService
 *   - com.petnexus.backend.service.InventoryService
 *   - com.petnexus.backend.service.RescueCaseService
 *   - com.petnexus.backend.controller.DesignPatternController
 *
 * WHY USED:
 *   The PetNexus platform generates multiple distinct categories of domain notifications
 *   (Appointment Confirmations, Low-Stock Inventory Warnings, Vaccination Reminders,
 *   Rescue Case Alerts, and Adoption Status Updates). Each category requires specific
 *   title prefixes, structured messages, standardized ID generation, and type mapping.
 *
 *   Using direct object instantiation across different services leads to duplicated
 *   formatting logic and inconsistent message structures. The Factory Pattern centralizes
 *   the creation of all typed notifications behind clean, semantic factory methods.
 *
 * BENEFITS:
 *   1. Encapsulation: Callers simply provide high-level parameters without worrying
 *      about ID generation schemes, default timestamps, or type mappings.
 *   2. Maintainability: If notification message templates or ID formats change, only
 *      this Factory class needs modification.
 *   3. Consistency: Enforces uniform title conventions and severity across all 6 personas.
 * ==============================================================================
 */
@Component
public class NotificationFactory {

    private String generateNotificationId() {
        return "NTF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    /**
     * Factory method: Creates an Appointment Confirmation or Reschedule Notification.
     */
    public Notification createAppointmentNotification(User recipient, String appointmentId, String petName, String appointmentTime, String status) {
        String title = "Appointment " + status + " – " + petName;
        String message = String.format("Your consultation for %s (Ref: %s) is scheduled for %s. Current status: %s.",
                petName, appointmentId, appointmentTime, status);

        return Notification.builder()
                .notificationId(generateNotificationId())
                .user(recipient)
                .type(NotificationType.Appointment)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Factory method: Creates an Inventory Low-Stock Alert Notification.
     */
    public Notification createInventoryLowStockNotification(User manager, String itemName, String sku, int currentStock, int threshold) {
        String title = "CRITICAL INVENTORY ALERT: " + itemName;
        String message = String.format("Stock for '%s' (SKU: %s) has depleted to %d units, below safety threshold of %d. Immediate reorder recommended.",
                itemName, sku, currentStock, threshold);

        return Notification.builder()
                .notificationId(generateNotificationId())
                .user(manager)
                .type(NotificationType.Inventory)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Factory method: Creates a Vaccination Health Booster Reminder.
     */
    public Notification createVaccinationReminderNotification(User owner, String petName, String vaccineName, String dueDate) {
        String title = "Immunization Due: " + petName;
        String message = String.format("%s is due for the '%s' booster on %s. Please book an appointment to keep immunity active.",
                petName, vaccineName, dueDate);

        return Notification.builder()
                .notificationId(generateNotificationId())
                .user(owner)
                .type(NotificationType.Health)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Factory method: Creates a Community Rescue Case Intake Alert.
     */
    public Notification createRescueIntakeNotification(User officer, String caseNumber, String location, String severity) {
        String title = "Rescue Alert: New Incident [" + severity.toUpperCase() + "]";
        String message = String.format("Incident %s reported at %s with severity '%s'. Field dispatch and intake triage required.",
                caseNumber, location, severity);

        return Notification.builder()
                .notificationId(generateNotificationId())
                .user(officer)
                .type(NotificationType.Rescue)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Factory method: Creates an Adoption Application Status Notification.
     */
    public Notification createAdoptionStatusNotification(User applicant, String applicationId, String petName, String status, String reviewNotes) {
        String title = "Adoption Application " + status + " – " + petName;
        String message = String.format("Your adoption request (Ref: %s) for %s has been %s. Notes: %s",
                applicationId, petName, status.toLowerCase(), reviewNotes);

        return Notification.builder()
                .notificationId(generateNotificationId())
                .user(applicant)
                .type(NotificationType.Adoption)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
