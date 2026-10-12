package com.petnexus.backend.patterns.factory;

import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ==============================================================================
 * DESIGN PATTERN: SIMPLE FACTORY (static-factory style creational pattern)
 * ==============================================================================
 * WHERE USED:
 *   - NotificationService.createNotification()  -> create()  (every service that dispatches a
 *     notification: Rescue, Feedback, Inventory, PurchaseOrder, Supplier ... goes through it)
 *   - NotificationService.notifyAppointment()   -> createAppointmentNotification()
 *     (called by AppointmentService on book / confirm / reschedule / cancel)
 *   - NotificationService.notifyAdoptionStatus()-> createAdoptionStatusNotification()
 *     (called by AdoptionApplicationService.reviewApplication)
 *   - LowStockAlertObserver                     -> createInventoryLowStockNotification()
 *   - DesignPatternController (live demo metadata)
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
     * Generic factory method: the single place where a {@link Notification} is assembled.
     * Every typed factory method below delegates here, so ID format, defaults
     * (unread, timestamp) and trimming rules exist exactly once.
     * The returned entity is NOT persisted; the caller decides when to save it.
     */
    public Notification create(User recipient, NotificationType type, String title, String message, String link) {
        return Notification.builder()
                .notificationId(generateNotificationId())
                .user(recipient)
                .type(type != null ? type : NotificationType.System)
                .title(title != null ? title.trim() : "System Notification")
                .message(message != null ? message.trim() : "")
                .link(link != null ? link.trim() : null)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Typed factory method: creates an Appointment Confirmation or Reschedule Notification.
     */
    public Notification createAppointmentNotification(User recipient, String appointmentId, String petName, String appointmentTime, String status) {
        String title = "Appointment " + status + " – " + petName;
        String message = String.format("Your consultation for %s (Ref: %s) on %s is now: %s.",
                petName, appointmentId, appointmentTime, status);

        return create(recipient, NotificationType.Appointment, title, message, "/owner/appointments");
    }

    /**
     * Typed factory method: creates an Inventory Low-Stock Alert Notification.
     */
    public Notification createInventoryLowStockNotification(User manager, String itemName, String sku, int currentStock, int threshold) {
        String title = "CRITICAL INVENTORY ALERT: " + itemName;
        String message = String.format("Stock for '%s' (SKU: %s) has depleted to %d units, below safety threshold of %d. Immediate reorder recommended.",
                itemName, sku, currentStock, threshold);

        return create(manager, NotificationType.Inventory, title, message, "/manager/inventory");
    }

    /**
     * Typed factory method: creates a Vaccination Health Booster Reminder.
     */
    public Notification createVaccinationReminderNotification(User owner, String petName, String vaccineName, String dueDate) {
        String title = "Immunization Due: " + petName;
        String message = String.format("%s is due for the '%s' booster on %s. Please book an appointment to keep immunity active.",
                petName, vaccineName, dueDate);

        return create(owner, NotificationType.Health, title, message, "/owner/medical-history");
    }

    /**
     * Typed factory method: creates a Community Rescue Case Intake Alert.
     */
    public Notification createRescueIntakeNotification(User officer, String caseNumber, String location, String severity) {
        String title = "Rescue Alert: New Incident [" + severity.toUpperCase() + "]";
        String message = String.format("Incident %s reported at %s with severity '%s'. Field dispatch and intake triage required.",
                caseNumber, location, severity);

        return create(officer, NotificationType.Rescue, title, message, "/rescue/cases");
    }

    /**
     * Typed factory method: creates an Adoption Application Status Notification.
     */
    public Notification createAdoptionStatusNotification(User applicant, String applicationId, String petName, String status, String reviewNotes) {
        String title = "Adoption Application " + status + " – " + petName;
        String message = String.format("Your adoption request (Ref: %s) for %s has been %s. Notes: %s",
                applicationId, petName, status.toLowerCase(), reviewNotes);

        return create(applicant, NotificationType.Adoption, title, message, "/owner/adopt");
    }
}
