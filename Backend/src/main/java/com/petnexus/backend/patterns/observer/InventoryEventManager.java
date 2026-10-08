package com.petnexus.backend.patterns.observer;

import com.petnexus.backend.entity.InventoryItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Concrete Subject / Event Manager in the Observer Pattern.
 * Maintains the collection of registered InventoryObserver subscribers
 * and dispatches stock change notifications to all attached observers.
 */
@Component
public class InventoryEventManager implements InventorySubject {

    private final List<InventoryObserver> observers = new ArrayList<>();

    public InventoryEventManager(List<InventoryObserver> initialObservers) {
        if (initialObservers != null) {
            observers.addAll(initialObservers);
        }
    }

    @Override
    public synchronized void addObserver(InventoryObserver observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    @Override
    public synchronized void removeObserver(InventoryObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(InventoryItem item, int previousStock, int newStock) {
        for (InventoryObserver observer : observers) {
            try {
                observer.update(item, previousStock, newStock);
            } catch (Exception ignored) {
                // Individual observer failure should not break stock transaction
            }
        }
    }

    public List<InventoryObserver> getRegisteredObservers() {
        return new ArrayList<>(observers);
    }
}
