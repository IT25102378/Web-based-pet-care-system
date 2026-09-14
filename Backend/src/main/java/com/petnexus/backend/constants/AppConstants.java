package com.petnexus.backend.constants;

/**
 * Shared constants used by more than one service.
 *
 * The frontend is the specification for anything a user can see, so each value
 * here names the file it must match. A plain constants class is deliberate:
 * it is the simplest thing that gives a value one home.
 */
public final class AppConstants {

    /**
     * Shown in place of a profile picture when a user has not uploaded one.
     * Must match DEFAULT_AVATAR_URL in Frontend/src/utils/constants.js.
     */
    public static final String DEFAULT_AVATAR_URL = "/avatars/default-avatar.svg";

    private AppConstants() {
        // Constants only; never instantiated.
    }
}
