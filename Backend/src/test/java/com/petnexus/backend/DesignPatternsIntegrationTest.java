package com.petnexus.backend;

import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.patterns.observer.InventoryEventManager;
import com.petnexus.backend.patterns.observer.LowStockAlertObserver;
import com.petnexus.backend.patterns.strategy.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ==============================================================================
 * TEST SUITE: SE2030 RUBRIC DESIGN PATTERNS VERIFICATION
 * ==============================================================================
 * Verifies that all 3 GoF Design Patterns (Strategy, Factory, Observer)
 * operate correctly and produce expected business outcomes according to the
 * SE2030 Marking Rubric (Criteria: Application of Minimum 1 Design Patterns).
 * ==============================================================================
 */
@SpringBootTest
@ActiveProfiles("test")
class DesignPatternsIntegrationTest {

    @Autowired
    private FeeCalculationContext feeCalculationContext;

    @Autowired
    private NotificationFactory notificationFactory;

    @Autowired
    private InventoryEventManager inventoryEventManager;

    @Autowired
    private LowStockAlertObserver lowStockAlertObserver;

    // --------------------------------------------------------------------------
    // 1. STRATEGY PATTERN TESTS
    // --------------------------------------------------------------------------

    @Test
    @DisplayName("Strategy Pattern: Standard Consultation computes exact 1.0x rate")
    void testStandardConsultationStrategy() {
        double fee = feeCalculationContext.computeFee(50.00, 3, false, false);
        assertEquals(50.00, fee, 0.001);
    }

    @Test
    @DisplayName("Strategy Pattern: Emergency Triage applies 1.5x multiplier + $20 surcharge")
    void testEmergencyTriageStrategy() {
        // Base: $50 -> 50 * 1.5 = 75 + 20 = $95.00
        double fee = feeCalculationContext.computeFee(50.00, 4, true, false);
        assertEquals(95.00, fee, 0.001);
    }

    @Test
    @DisplayName("Strategy Pattern: Senior Pet receives 15% compassionate wellness discount")
    void testSeniorPetDiscountStrategy() {
        // Base: $50 -> 50 * 0.85 = $42.50
        double fee = feeCalculationContext.computeFee(50.00, 9, false, false);
        assertEquals(42.50, fee, 0.001);
    }

    @Test
    @DisplayName("Strategy Pattern: Rescued Street Animal receives 100% subsidy ($0.00)")
    void testRescueAnimalWelfareStrategy() {
        double fee = feeCalculationContext.computeFee(50.00, 2, false, true);
        assertEquals(0.00, fee, 0.001);
    }

    // --------------------------------------------------------------------------
    // 2. FACTORY PATTERN TESTS
    // --------------------------------------------------------------------------

    @Test
    @DisplayName("Factory Pattern: Creates properly structured Appointment Notification")
    void testNotificationFactoryAppointment() {
        User user = User.builder().userId("USR-TEST-01").fullName("Jane Doe").role(UserRole.PetOwner).build();
        Notification n = notificationFactory.createAppointmentNotification(
                user, "APT-100", "Bella", "10:00 AM", "Confirmed");

        assertNotNull(n);
        assertTrue(n.getNotificationId().startsWith("NTF-"));
        assertEquals(NotificationType.Appointment, n.getType());
        assertTrue(n.getTitle().contains("Confirmed"));
        assertTrue(n.getMessage().contains("Bella"));
    }

    @Test
    @DisplayName("Factory Pattern: Creates typed Low-Stock Critical Alert Notification")
    void testNotificationFactoryLowStock() {
        User manager = User.builder().userId("USR-MGR-01").fullName("Dr. Ramirez").role(UserRole.ClinicManager).build();
        Notification n = notificationFactory.createInventoryLowStockNotification(
                manager, "Amoxicillin 250mg", "AMOX-250", 4, 15);

        assertNotNull(n);
        assertEquals(NotificationType.Inventory, n.getType());
        assertTrue(n.getTitle().contains("CRITICAL INVENTORY ALERT"));
        assertTrue(n.getMessage().contains("4 units"));
    }

    // --------------------------------------------------------------------------
    // 3. OBSERVER PATTERN TESTS
    // --------------------------------------------------------------------------

    @Test
    @DisplayName("Observer Pattern: InventoryEventManager registers and manages observers")
    void testInventoryObserverRegistration() {
        assertNotNull(inventoryEventManager);
        assertNotNull(lowStockAlertObserver);
        List<?> observers = inventoryEventManager.getRegisteredObservers();
        assertFalse(observers.isEmpty(), "LowStockAlertObserver should be registered automatically");
        assertTrue(observers.contains(lowStockAlertObserver), "Injected LowStockAlertObserver should be registered in event manager");

        InventoryItem testItem = InventoryItem.builder()
                .itemId("INV-TEST-99")
                .name("Surgical Sutures 3-0")
                .sku("SUT-30")
                .currentStock(3)
                .minStockThreshold(10)
                .unit("Packs")
                .status(StockStatus.LOW_STOCK)
                .build();

        // Calling notifyObservers triggers all registered observers without throwing exceptions
        assertDoesNotThrow(() -> inventoryEventManager.notifyObservers(testItem, 12, 3));
    }
}
