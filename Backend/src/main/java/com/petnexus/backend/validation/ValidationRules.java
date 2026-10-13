package com.petnexus.backend.validation;

/**
 * Shared validation patterns and messages used by request DTOs across all modules,
 * so every form reports the same rule with the same wording.
 * The frontend mirrors these rules in src/utils/validators.js.
 */
public final class ValidationRules {

    private ValidationRules() {
    }

    /** Sri Lankan local format: exactly 10 digits, starting with 0 (e.g. 0771234567). */
    public static final String PHONE = "^0\\d{9}$";
    /** Same as {@link #PHONE} but also accepts an empty value for optional fields. */
    public static final String OPTIONAL_PHONE = "^$|^0\\d{9}$";
    public static final String PHONE_MESSAGE = "Phone number must be exactly 10 digits and start with 0 (e.g. 0771234567)";

    /** Person names: letters, spaces and . , ' - only; must start with a letter. */
    public static final String PERSON_NAME = "^[\\p{L}][\\p{L} .,'-]*$";
    public static final String OPTIONAL_PERSON_NAME = "^$|^[\\p{L}][\\p{L} .,'-]*$";
    public static final String PERSON_NAME_MESSAGE = "Name can only contain letters, spaces and . , ' -";

    /** Pet / animal names: must start with a letter or digit; allows letters, digits, spaces and . ' - ( ). */
    public static final String PET_NAME = "^[\\p{L}\\d][\\p{L}\\d .'()-]*$";
    public static final String PET_NAME_MESSAGE = "Pet name can only contain letters, numbers, spaces and . ' - ( )";

    /** At least 8 characters with at least one letter and one number. */
    public static final String PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$";
    public static final String PASSWORD_MESSAGE = "Password must be at least 8 characters and include a letter and a number";

    /**
     * Emergency contact: optional, but when given it must include a reachable phone number
     * (10 digits starting with 0), e.g. "Nimal Perera (Brother) - 0771234567".
     */
    public static final String EMERGENCY_CONTACT = "^$|^Not provided$|^(?=.*(?<!\\d)0\\d{9}(?!\\d)).{5,}$";
    public static final String EMERGENCY_CONTACT_MESSAGE =
            "Emergency contact must include a 10-digit phone number starting with 0 (e.g. Nimal Perera - 0771234567)";

    public static final String EMAIL_MESSAGE = "Please enter a valid email address (e.g. name@example.com)";

    /** Upper limit for any stock quantity or stock threshold (whole units). */
    public static final int MAX_STOCK_QUANTITY = 100000;
    public static final String MAX_STOCK_MESSAGE = "cannot be more than 100000 units";

    /** Prices and amounts: never negative, at most two decimal places. */
    public static final String MONEY_DECIMALS_MESSAGE = "can have at most two decimal places (e.g. 2500.50)";
}
