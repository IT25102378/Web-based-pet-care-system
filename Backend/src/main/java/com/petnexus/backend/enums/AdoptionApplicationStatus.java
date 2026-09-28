package com.petnexus.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AdoptionApplicationStatus {
    SUBMITTED("Submitted"),
    UNDER_REVIEW("UnderReview"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");

    private final String value;

    AdoptionApplicationStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AdoptionApplicationStatus fromString(String val) {
        if (val == null || val.isBlank()) return null;
        for (AdoptionApplicationStatus s : values()) {
            if (s.name().equalsIgnoreCase(val)
                    || s.value.equalsIgnoreCase(val)
                    || s.name().replace("_", "").equalsIgnoreCase(val.replace("_", "").replace("-", ""))) {
                return s;
            }
        }
        throw new IllegalArgumentException("Invalid application status: " + val);
    }
}
