package com.petnexus.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Represents stock status for inventory items.
 * Matches Frontend StockStatus in src/types/index.js.
 */
public enum StockStatus {
    IN_STOCK("InStock"),
    LOW_STOCK("LowStock"),
    OUT_OF_STOCK("OutOfStock"),
    EXPIRED("Expired");

    private final String jsonValue;

    StockStatus(String jsonValue) {
        this.jsonValue = jsonValue;
    }

    @JsonValue
    public String getJsonValue() {
        return jsonValue;
    }

    @JsonCreator
    public static StockStatus fromJson(String value) {
        if (value == null || value.isBlank()) return null;
        for (StockStatus s : values()) {
            if (s.name().equalsIgnoreCase(value)
                    || s.jsonValue.equalsIgnoreCase(value)
                    || s.name().replace("_", "").equalsIgnoreCase(value.replace("_", "").replace("-", ""))) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown StockStatus: " + value);
    }
}
