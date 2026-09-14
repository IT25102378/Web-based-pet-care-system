package com.petnexus.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Loads the demo data every module needs on startup.
 *
 * Each module owns its own seeder and its own repositories; this class only decides the
 * order they run in. Every seeder checks whether its rows already exist, so starting the
 * application against a populated database changes nothing.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserSeeder userSeeder;
    private final PetSeeder petSeeder;
    private final AppointmentSeeder appointmentSeeder;
    private final PetServiceSeeder petServiceSeeder;
    private final RescueSeeder rescueSeeder;
    private final InventorySeeder inventorySeeder;
    private final FeedbackSeeder feedbackSeeder;

    @Override
    public void run(String... args) {
        // The order matters and is written out deliberately rather than inferred.
        // Pets belong to the owner account, appointments book a pet with the vet,
        // consultations attach to an appointment, and the feedback notifications
        // point at rows the earlier seeders create.
        userSeeder.seed();
        petSeeder.seed();
        appointmentSeeder.seed();
        petServiceSeeder.seed();
        rescueSeeder.seed();
        inventorySeeder.seed();
        feedbackSeeder.seed();
    }
}
