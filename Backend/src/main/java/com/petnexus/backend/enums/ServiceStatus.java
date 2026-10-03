package com.petnexus.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents the lifecycle status of a pet care / grooming service log.
 * Mirrors the frontend constants defined in src/types/index.js -> ServiceStatus.
 */
public enum ServiceStatus {
    SCHEDULED("Scheduled"),
    CHECKED_IN("CheckedIn"),
    IN_PROGRESS("InProgress"),
    READY_FOR_PICKUP("ReadyForPickup"),
    COMPLETED("Completed");

    private final String jsonValue;

    ServiceStatus(String jsonValue) {
        this.jsonValue = jsonValue;
    }

    @JsonValue
    public String getJsonValue() {
        return jsonValue;
    }

    @JsonCreator
    public static ServiceStatus fromJson(String value) {
        if (value == null || value.isBlank()) return null;
        for (ServiceStatus s : values()) {
            if (s.name().equalsIgnoreCase(value)
                    || s.jsonValue.equalsIgnoreCase(value)
                    || s.name().replace("_", "").equalsIgnoreCase(value.replace("_", "").replace("-", ""))) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown ServiceStatus: " + value);
    }
}
