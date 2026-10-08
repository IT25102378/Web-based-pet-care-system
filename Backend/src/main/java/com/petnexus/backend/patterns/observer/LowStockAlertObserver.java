package com.petnexus.backend.patterns.observer;

import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Concrete Observer: Low Stock Alert Observer.
 * Listens for stock level changes across inventory items.
 * If newStock <= minStockThreshold, it generates an automated
 * clinical low-stock warning for Clinic Managers using the NotificationFactory.
 */
@Component
@Slf4j
public class LowStockAlertObserver implements InventoryObserver {

    private final NotificationFactory notificationFactory;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public LowStockAlertObserver(NotificationFactory notificationFactory,
                                 NotificationRepository notificationRepository,
                                 UserRepository userRepository) {
        this.notificationFactory = notificationFactory;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void update(InventoryItem item, int previousStock, int newStock) {
        if (newStock <= item.getMinStockThreshold()) {
            log.warn("[OBSERVER ALERT] Inventory item '{}' (SKU: {}) breached safety threshold! Current: {}, Threshold: {}",
                    item.getName(), item.getSku(), newStock, item.getMinStockThreshold());

            try {
                // Find clinic manager(s) to alert
                List<User> managers = userRepository.findByRole(UserRole.ClinicManager);
                for (User manager : managers) {
                    Notification notification = notificationFactory.createInventoryLowStockNotification(
                            manager,
                            item.getName(),
                            item.getSku(),
                            newStock,
                            item.getMinStockThreshold()
                    );
                    notificationRepository.save(notification);
                }
            } catch (Exception ex) {
                log.error("[OBSERVER ERROR] Could not persist low stock notification: {}", ex.getMessage());
            }
        }
    }
}
