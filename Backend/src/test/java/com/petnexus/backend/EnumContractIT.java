package com.petnexus.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petnexus.backend.enums.AdoptionApplicationStatus;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Checks that the status values the frontend sends are the same values the backend accepts.
 *
 * The two sides keep their own copy of every status list, because one is JavaScript and one
 * is Java. Nothing stops those copies drifting apart, and when they do the failure is silent
 * in mock mode and a 400 in real mode. This test compares them directly so the drift is
 * caught by the build instead of by a user.
 *
 * The backend side is read through Jackson rather than from the constant names, because
 * Jackson is what actually writes the value onto the wire.
 */
@DisplayName("Frontend and backend status values must match")
class EnumContractIT {

    /** The frontend's single list of status values. */
    private static final String TYPES_FILE = "Frontend/src/types/index.js";

    private static final ObjectMapper JSON = new ObjectMapper();

    private static String typesSource;

    @BeforeAll
    static void readFrontendTypes() throws IOException {
        // Maven runs tests from Backend/, so the frontend sits one level up. The second
        // candidate covers running from the repository root.
        Path fromBackend = Path.of("..", TYPES_FILE);
        Path fromRoot = Path.of(TYPES_FILE);
        Path file = Files.exists(fromBackend) ? fromBackend : fromRoot;

        assertTrue(Files.exists(file),
                "Could not find " + TYPES_FILE + ". Looked in " + fromBackend.toAbsolutePath()
                        + " and " + fromRoot.toAbsolutePath());

        typesSource = Files.readString(file);
    }

    @Test
    @DisplayName("UserRole")
    void userRoleMatches() {
        assertMatches("UserRole", wireValuesOf(UserRole.class));
    }

    @Test
    @DisplayName("UserStatus")
    void userStatusMatches() {
        assertMatches("UserStatus", wireValuesOf(UserStatus.class));
    }

    @Test
    @DisplayName("AppointmentStatus")
    void appointmentStatusMatches() {
        assertMatches("AppointmentStatus", wireValuesOf(AppointmentStatus.class));
    }

    @Test
    @DisplayName("AdoptionApplicationStatus")
    void adoptionApplicationStatusMatches() {
        assertMatches("AdoptionApplicationStatus", wireValuesOf(AdoptionApplicationStatus.class));
    }

    @Test
    @DisplayName("ServiceStatus")
    void serviceStatusMatches() {
        assertMatches("ServiceStatus", wireValuesOf(ServiceStatus.class));
    }

    @Test
    @DisplayName("StockStatus")
    void stockStatusMatches() {
        assertMatches("StockStatus", wireValuesOf(StockStatus.class));
    }

    @Test
    @DisplayName("NotificationType")
    void notificationTypeMatches() {
        assertMatches("NotificationType", wireValuesOf(NotificationType.class));
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /**
     * The values the backend actually puts on the wire for an enum. Some enums carry a
     * Jackson value that differs from the constant name, so the enum is serialised rather
     * than read by name.
     */
    private Set<String> wireValuesOf(Class<? extends Enum<?>> enumType) {
        Set<String> values = new TreeSet<>();
        for (Object constant : enumType.getEnumConstants()) {
            try {
                values.add(JSON.writeValueAsString(constant).replace("\"", ""));
            } catch (Exception e) {
                throw new IllegalStateException("Could not serialise " + constant, e);
            }
        }
        return values;
    }

    /**
     * The values listed for one exported constant map in types/index.js, for example the
     * strings on the right-hand side of {@code APPROVED: 'Approved',}.
     */
    private Set<String> frontendValuesOf(String mapName) {
        Pattern block = Pattern.compile(
                "export const " + mapName + " = \\{(.*?)\\};", Pattern.DOTALL);
        Matcher blockMatch = block.matcher(typesSource);
        assertTrue(blockMatch.find(),
                "types/index.js does not export a constant map named " + mapName);

        Set<String> values = new TreeSet<>();
        Matcher entry = Pattern.compile(":\\s*'([^']*)'").matcher(blockMatch.group(1));
        while (entry.find()) {
            values.add(entry.group(1));
        }
        return values;
    }

    private void assertMatches(String mapName, Set<String> backendValues) {
        Set<String> frontendValues = frontendValuesOf(mapName);
        assertEquals(backendValues, frontendValues,
                mapName + " has drifted. The backend accepts " + backendValues
                        + " but Frontend/src/types/index.js sends " + frontendValues
                        + ". Both sides must list the same strings.");
    }
}
