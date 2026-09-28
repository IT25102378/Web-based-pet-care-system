package com.petnexus.backend.patterns.observer;

import com.petnexus.backend.entity.InventoryItem;

/**
 * Subject interface in the Observer Pattern.
 * Defines methods for attaching, detaching, and notifying observers.
 */
public interface InventorySubject {

    void registerObserver(InventoryObserver observer);

    void removeObserver(InventoryObserver observer);

    void notifyObservers(InventoryItem item, int previousStock, int newStock);
}
