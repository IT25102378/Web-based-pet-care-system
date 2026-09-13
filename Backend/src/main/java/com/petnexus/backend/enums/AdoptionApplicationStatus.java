package com.petnexus.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents the lifecycle status of an adoption application.
 * Mirrors the frontend constants defined in src/types/index.js -> AdoptionApplicationStatus.
 *
 * The constant names stay as they are, because that is what is stored in the
 * adoption_applications.status column. Only the value sent to and accepted from the
 * frontend changes, which is the same arrangement ServiceStatus and StockStatus use.
 */
public enum AdoptionApplicationStatus {
    SUBMITTED("Submitted"),
    UNDER_REVIEW("UnderReview"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");

    private final String jsonValue;

    AdoptionApplicationStatus(String jsonValue) {
        this.jsonValue = jsonValue;
    }

    @JsonValue
    public String getJsonValue() {
        return jsonValue;
    }

    @JsonCreator
    public static AdoptionApplicationStatus fromJson(String value) {
        if (value == null || value.isBlank()) return null;
        for (AdoptionApplicationStatus s : values()) {
            if (s.name().equalsIgnoreCase(value)
                    || s.jsonValue.equalsIgnoreCase(value)
                    || s.name().replace("_", "").equalsIgnoreCase(value.replace("_", "").replace("-", ""))) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown AdoptionApplicationStatus: " + value);
    }
}
