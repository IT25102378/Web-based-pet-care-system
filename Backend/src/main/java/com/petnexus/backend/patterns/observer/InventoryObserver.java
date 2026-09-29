package com.petnexus.backend.patterns.observer;

import com.petnexus.backend.entity.InventoryItem;

/**
 * ==============================================================================
 * DESIGN PATTERN: OBSERVER PATTERN (GoF Behavioral Pattern)
 * ==============================================================================
 * WHERE USED:
 *   - com.petnexus.backend.service.InventoryService
 *   - com.petnexus.backend.patterns.observer.LowStockAlertObserver
 *   - com.petnexus.backend.controller.DesignPatternController
 *
 * WHY USED:
 *   In a busy veterinary clinic, inventory items (anesthetics, antibiotics,
 *   vaccines) are frequently dispensed or restocked. When stock levels drop
 *   below safety thresholds, multiple downstream actions must occur:
 *   1. System notifications must be dispatched to clinic managers and staff.
 *   2. Reorder flags and status badges must be automatically updated.
 *   3. Audit logs must capture the threshold breach.
 *
 *   Tightly coupling the inventory update method with notification dispatchers,
 *   email senders, or procurement managers violates the Single Responsibility
 *   and Open/Closed principles. The Observer Pattern establishes a clean 1-to-N
 *   subscription mechanism where interested observers are notified automatically.
 *
 * BENEFITS:
 *   1. Loose Coupling: Inventory management logic does not know or depend on
 *      how notifications or audit logs are handled.
 *   2. Extensibility: New observers (e.g. Automated Supplier Purchase Order
 *      Trigger, SMS Alert Dispatcher) can be added without modifying inventory code.
 * ==============================================================================
 */
public interface InventoryObserver {

    /**
     * Called whenever an inventory item's stock level changes.
     *
     * @param item          The affected inventory item
     * @param previousStock Previous quantity before update
     * @param newStock      Current quantity after update
     */
    void update(InventoryItem item, int previousStock, int newStock);
}
