package com.petnexus.backend.config;

import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the demo appointments (M2). The pets and the veterinarian account must already
 * exist, so this runs after UserSeeder and PetSeeder.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentSeeder {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;

    public void seed() {
        User owner = userRepository.findByEmail("owner@petnexus.com")
                .orElseThrow(() -> new IllegalStateException(
                        "Pet owner account is missing. UserSeeder must run before this seeder."));

        // Seed Appointments
        if (appointmentRepository.count() == 0) {
            log.info("Seeding initial appointments into PetNexus database...");

            Pet barnaby = petRepository.findByPetId("PET-001").orElse(null);
            Pet cleo = petRepository.findByPetId("PET-002").orElse(null);
            User vetSachini = userRepository.findByEmail("vet@petnexus.com").orElse(null);

            Appointment apt1 = Appointment.builder()
                    .appointmentId("APT-1001")
                    .pet(barnaby)
                    .petId(barnaby != null ? barnaby.getPetId() : "PET-001")
                    .petName(barnaby != null ? barnaby.getName() : "Barnaby")
                    .species(barnaby != null ? barnaby.getSpecies() : "Dog")
                    .breed(barnaby != null ? barnaby.getBreed() : "Golden Retriever")
                    .owner(owner)
                    .ownerId(owner.getUserId())
                    .ownerName(owner.getFullName())
                    .ownerPhone(owner.getPhone())
                    .veterinarian(vetSachini)
                    .vetId(vetSachini != null ? vetSachini.getUserId() : "USR-001")
                    .vetName("Dr. Sachini Wijesinghe, BVSc")
                    .serviceType("Routine Wellness & Vaccination")
                    .appointmentDate(LocalDate.of(2026, 8, 15))
                    .timeSlot("09:30 AM")
                    .status(AppointmentStatus.CheckedIn)
                    .tokenNumber("A-01")
                    .reason("Annual health checkup and Bordetella booster shot.")
                    .symptoms("Healthy energy, normal appetite.")
                    .notes("Owner requested weight monitoring chart update.")
                    .createdAt(LocalDateTime.of(2026, 8, 10, 11, 0, 0))
                    .build();

            Appointment apt2 = Appointment.builder()
                    .appointmentId("APT-1002")
                    .pet(barnaby)
                    .petId(barnaby != null ? barnaby.getPetId() : "PET-001")
                    .petName(barnaby != null ? barnaby.getName() : "Barnaby")
                    .species(barnaby != null ? barnaby.getSpecies() : "Dog")
                    .breed(barnaby != null ? barnaby.getBreed() : "Golden Retriever")
                    .owner(owner)
                    .ownerId(owner.getUserId())
                    .ownerName(owner.getFullName())
                    .ownerPhone(owner.getPhone())
                    .veterinarian(null)
                    .vetId("USR-002")
                    .vetName("Dr. Michael Chen")
                    .serviceType("Routine Wellness Checkup")
                    .appointmentDate(LocalDate.of(2026, 9, 5))
                    .timeSlot("10:00 AM")
                    .status(AppointmentStatus.Scheduled)
                    .tokenNumber("A-02")
                    .reason("Annual booster vaccination and general health examination.")
                    .symptoms("Normal appetite and energy levels.")
                    .notes("Pre-consultation intake complete.")
                    .createdAt(LocalDateTime.of(2026, 8, 28, 9, 0, 0))
                    .build();

            Appointment apt3 = Appointment.builder()
                    .appointmentId("APT-1004")
                    .pet(cleo)
                    .petId(cleo != null ? cleo.getPetId() : "PET-002")
                    .petName(cleo != null ? cleo.getName() : "Cleo")
                    .species(cleo != null ? cleo.getSpecies() : "Cat")
                    .breed(cleo != null ? cleo.getBreed() : "British Shorthair")
                    .owner(owner)
                    .ownerId(owner.getUserId())
                    .ownerName(owner.getFullName())
                    .ownerPhone(owner.getPhone())
                    .veterinarian(null)
                    .vetId("USR-002")
                    .vetName("Dr. Michael Chen")
                    .serviceType("Dental Consultation")
                    .appointmentDate(LocalDate.of(2026, 9, 8))
                    .timeSlot("11:00 AM")
                    .status(AppointmentStatus.Confirmed)
                    .tokenNumber("A-03")
                    .reason("Dental plaque evaluation and routine tartar check.")
                    .symptoms("Mild bad breath, no eating discomfort.")
                    .notes("Confirmed by clinic reception.")
                    .createdAt(LocalDateTime.of(2026, 8, 29, 11, 30, 0))
                    .build();

            Appointment apt4 = Appointment.builder()
                    .appointmentId("APT-1003")
                    .pet(null)
                    .petId(null)
                    .petName("Rocky (German Shepherd)")
                    .species("Dog")
                    .breed("German Shepherd")
                    .owner(null)
                    .ownerId(null)
                    .ownerName("Dinuka Jayasinghe (Walk-in)")
                    .ownerPhone("+94 71 777 8899")
                    .veterinarian(vetSachini)
                    .vetId(vetSachini != null ? vetSachini.getUserId() : "USR-001")
                    .vetName("Dr. Sachini Wijesinghe, BVSc")
                    .serviceType("Emergency / Triage")
                    .appointmentDate(LocalDate.of(2026, 8, 15))
                    .timeSlot("10:15 AM")
                    .status(AppointmentStatus.InRoom)
                    .tokenNumber("W-01")
                    .reason("Limping on front right paw after park sprint.")
                    .symptoms("Swollen metacarpal pad, vocalizes when pressed.")
                    .notes("X-ray ordered to rule out hairline fracture.")
                    .createdAt(LocalDateTime.of(2026, 8, 15, 9, 45, 0))
                    .build();

            Appointment apt5 = Appointment.builder()
                    .appointmentId("APT-0998")
                    .pet(barnaby)
                    .petId(barnaby != null ? barnaby.getPetId() : "PET-001")
                    .petName(barnaby != null ? barnaby.getName() : "Barnaby")
                    .species(barnaby != null ? barnaby.getSpecies() : "Dog")
                    .breed(barnaby != null ? barnaby.getBreed() : "Golden Retriever")
                    .owner(owner)
                    .ownerId(owner.getUserId())
                    .ownerName(owner.getFullName())
                    .ownerPhone(owner.getPhone())
                    .veterinarian(vetSachini)
                    .vetId(vetSachini != null ? vetSachini.getUserId() : "USR-001")
                    .vetName("Dr. Sachini Wijesinghe, BVSc")
                    .serviceType("Dermatology Follow-up")
                    .appointmentDate(LocalDate.of(2026, 7, 20))
                    .timeSlot("10:00 AM")
                    .status(AppointmentStatus.Completed)
                    .tokenNumber("C-12")
                    .reason("Skin redness on belly.")
                    .symptoms("Resolved after Apoquel regimen.")
                    .notes("Skin barrier is fully restored. Advised hypoallergenic wash.")
                    .createdAt(LocalDateTime.of(2026, 7, 15, 9, 0, 0))
                    .build();

            appointmentRepository.saveAll(List.of(apt1, apt2, apt3, apt4, apt5));
            log.info("Seeded 5 initial appointments.");
        }
    }
}
