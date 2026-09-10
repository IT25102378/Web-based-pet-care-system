package com.petnexus.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Types of system and operational notifications.
 * Matches Frontend Frontend/src/types/index.js NotificationType:
 * Appointment, Rescue, Adoption, Approval, Inventory, Health, System.
 */
public enum NotificationType {
    Appointment("Appointment"),
    Rescue("Rescue"),
    Adoption("Adoption"),
    Approval("Approval"),
    Inventory("Inventory"),
    Health("Health"),
    System("System");

    private final String value;

    NotificationType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NotificationType fromValue(String value) {
        if (value == null) return null;
        for (NotificationType type : NotificationType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown notification type: " + value);
    }
}
