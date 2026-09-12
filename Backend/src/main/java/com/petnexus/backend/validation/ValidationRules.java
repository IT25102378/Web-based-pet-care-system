package com.petnexus.backend.validation;

/**
 * Shared validation rules.
 *
 * Each rule is defined here once and referenced from the request DTOs, so the
 * same wording and the same limits apply everywhere a value is checked.
 * The frontend keeps a matching copy in Frontend/src/utils/validation.js.
 *
 * The constants are compile-time constants so they can be used directly inside
 * annotation attributes.
 */
public final class ValidationRules {

    /** Minimum number of characters in a password. */
    public static final int PASSWORD_MIN_LENGTH = 6;

    /** At least six characters, containing at least one letter and one digit. */
    public static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*\\d).{6,}$";

    /** Shown whenever a password fails the rule above. */
    public static final String PASSWORD_MESSAGE =
            "Password must be at least 6 characters and include at least one letter and one number";

    private ValidationRules() {
        // Constants only — never instantiated.
    }
}
