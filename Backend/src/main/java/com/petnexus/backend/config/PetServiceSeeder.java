package com.petnexus.backend.config;

import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.CareProvider;
import com.petnexus.backend.entity.CareService;
import com.petnexus.backend.entity.CareServiceLog;
import com.petnexus.backend.entity.Consultation;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.Prescription;
import com.petnexus.backend.entity.PrescriptionItem;
import com.petnexus.backend.entity.ServicePackageBooking;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.CareProviderRepository;
import com.petnexus.backend.repository.CareServiceLogRepository;
import com.petnexus.backend.repository.CareServiceRepository;
import com.petnexus.backend.repository.ConsultationRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.PrescriptionRepository;
import com.petnexus.backend.repository.ServicePackageBookingRepository;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds consultations, prescriptions, the care provider profile, the care service
 * catalogue, package bookings and grooming session logs (M4). Consultations attach to
 * appointments, so this runs after AppointmentSeeder.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PetServiceSeeder {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final CareProviderRepository careProviderRepository;
    private final CareServiceRepository careServiceRepository;
    private final CareServiceLogRepository careServiceLogRepository;
    private final ServicePackageBookingRepository servicePackageBookingRepository;

    public void seed() {
        // Seed Consultations
        if (consultationRepository.count() == 0) {
            log.info("Seeding initial consultations into PetNexus database...");

            Pet barnaby = petRepository.findByPetId("PET-001").orElse(null);
            Appointment aptCompleted = appointmentRepository.findByAppointmentId("APT-0998").orElse(null);
            User vetSachini = userRepository.findByEmail("vet@petnexus.com").orElse(null);

            Consultation c1 = Consultation.builder()
                    .consultationId("CNS-2026-01")
                    .appointment(aptCompleted)
                    .appointmentId("APT-0998")
                    .pet(barnaby)
                    .petId("PET-001")
                    .petName("Barnaby")
                    .veterinarian(vetSachini)
                    .vetId(vetSachini != null ? vetSachini.getUserId() : "USR-001")
                    .vetName("Dr. Sachini Wijesinghe, BVSc")
                    .consultationDate(LocalDateTime.of(2026, 7, 20, 10, 15, 0))
                    .temperatureC(new BigDecimal("38.4"))
                    .heartRateBpm(88)
                    .respiratoryRateBpm(22)
                    .weightKg(new BigDecimal("31.50"))
                    .subjectiveNotes("Owner reports frequent scratching and licking around lower abdomen over past 5 days.")
                    .objectiveFindings("Erythema and mild papular dermatitis localized to inguinal region. No flea dirt observed.")
                    .assessmentDiagnosis("Allergic Contact Dermatitis (likely environmental grass pollen)")
                    .treatmentPlan("Prescribe Apoquel 16mg once daily for 14 days, combined with weekly Chlorhexidine bath.")
                    .followUpDate(LocalDate.of(2026, 8, 15))
                    .status("Completed")
                    .build();

            consultationRepository.save(c1);
            log.info("Seeded initial consultation CNS-2026-01.");

            // Seed Prescriptions & Prescription Items
            if (prescriptionRepository.count() == 0) {
                log.info("Seeding initial prescriptions into PetNexus database...");

                Prescription rx1 = Prescription.builder()
                        .prescriptionId("RX-2026-001")
                        .consultation(c1)
                        .consultationId("CNS-2026-01")
                        .pet(barnaby)
                        .petId("PET-001")
                        .petName("Barnaby")
                        .ownerName("Kavindu Perera")
                        .veterinarian(vetSachini)
                        .vetId(vetSachini != null ? vetSachini.getUserId() : "USR-001")
                        .vetName("Dr. Sachini Wijesinghe, BVSc")
                        .vetLicense("SLVC-VET-2019-0842")
                        .issueDate(LocalDate.of(2026, 7, 20))
                        .validUntil(LocalDate.of(2026, 8, 20))
                        .status("Active")
                        .instructions("Administer with breakfast meal. Do not crush tablets.")
                        .digitalSignature("Dr. Sachini Wijesinghe, BVSc [Digital Signoff verified]")
                        .build();

                PrescriptionItem item1 = PrescriptionItem.builder()
                        .itemId("RXI-01")
                        .prescription(rx1)
                        .prescriptionId("RX-2026-001")
                        .medicationName("Apoquel (Oclacitinib) 16mg")
                        .dosage("1 tablet (16mg)")
                        .frequency("Once Daily (Morning)")
                        .durationDays(14)
                        .quantityPrescribed(14)
                        .refillsAllowed(1)
                        .build();

                PrescriptionItem item2 = PrescriptionItem.builder()
                        .itemId("RXI-02")
                        .prescription(rx1)
                        .prescriptionId("RX-2026-001")
                        .medicationName("Douxo S3 PYO Medicated Shampoo")
                        .dosage("Topical lather for 10 mins")
                        .frequency("Twice Weekly")
                        .durationDays(21)
                        .quantityPrescribed(1)
                        .refillsAllowed(2)
                        .build();

                rx1.setItems(List.of(item1, item2));
                prescriptionRepository.save(rx1);
                log.info("Seeded initial prescription RX-2026-001 with 2 items.");
            }
        }

        User providerUser = userRepository.findByEmail("provider@petnexus.com")
                .orElseThrow(() -> new IllegalStateException(
                        "Care provider account is missing. UserSeeder must run before this seeder."));

        careProviderRepository.findByProviderId("PRV-001")
                .orElseGet(() -> {
                    CareProvider newPrv = CareProvider.builder()
                            .providerId("PRV-001")
                            .user(providerUser)
                            .providerName("Dilshan Bandara")
                            .contactPhone("+94 77 987 6543")
                            .contactEmail("provider@petnexus.com")
                            .active(true)
                            .build();
                    return careProviderRepository.save(newPrv);
                });

        if (careServiceRepository.count() == 0) {
            log.info("Seeding initial Care Services into PetNexus database...");
            careServiceRepository.save(CareService.builder()
                    .serviceId("CSR-001")
                    .name("Deluxe Spa & Hydrotherapy Grooming Plan")
                    .description("Full grooming with hydrobath, coat conditioning, ear cleaning, and paw pad trim")
                    .price(new BigDecimal("15000.00"))
                    .durationMinutes(90)
                    .status(ServiceStatus.SCHEDULED)
                    .createdBy(providerUser)
                    .build());

            careServiceRepository.save(CareService.builder()
                    .serviceId("CSR-002")
                    .name("De-Shedding & Blowout Treatment")
                    .description("Deep brush out, de-shedding shampoo, and high-velocity blowout")
                    .price(new BigDecimal("8500.00"))
                    .durationMinutes(60)
                    .status(ServiceStatus.SCHEDULED)
                    .createdBy(providerUser)
                    .build());

            careServiceRepository.save(CareService.builder()
                    .serviceId("CSR-003")
                    .name("Puppy Spa & Gentle Bath")
                    .description("Tearless shampoo, gentle warm water rinse, light brush, and nail trim")
                    .price(new BigDecimal("5500.00"))
                    .durationMinutes(45)
                    .status(ServiceStatus.SCHEDULED)
                    .createdBy(providerUser)
                    .build());
            log.info("Seeded 3 care services.");
        }

        if (servicePackageBookingRepository.count() == 0) {
            log.info("Seeding initial Service Package Bookings into PetNexus database...");
            servicePackageBookingRepository.save(ServicePackageBooking.builder()
                    .bookingId("PKB-101")
                    .ownerId("USR-002")
                    .packageName("Deluxe Spa & Hydrotherapy Grooming Plan")
                    .totalSessions(3)
                    .completedSessions(1)
                    .remainingSessions(2)
                    .purchaseDate(LocalDate.of(2026, 7, 10))
                    .expiryDate(LocalDate.of(2027, 1, 10))
                    .status("Active")
                    .createdAt(LocalDate.of(2026, 7, 10))
                    .build());
            log.info("Seeded 1 service package booking.");
        }

        if (careServiceLogRepository.count() == 0) {
            log.info("Seeding initial Care Service Logs into PetNexus database...");
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-201")
                    .petId("PET-001")
                    .petName("Barnaby (Golden Retriever)")
                    .ownerId("USR-002")
                    .ownerName("Kavindu Perera")
                    .providerId(providerUser.getUserId())
                    .providerName(providerUser.getFullName())
                    .serviceType("Deluxe Spa Grooming Session #1")
                    .serviceDate(LocalDate.of(2026, 7, 25))
                    .status(ServiceStatus.COMPLETED)
                    .intakeCondition("Coat slightly matted near ears, very cooperative and friendly.")
                    .servicesPerformed("Hydro-massage warm oatmeal bath, blow dry, ear cleaning, paw pad trim, sanitary cut.")
                    .notes("Coat is silky and lustrous. Recommended hypoallergenic coconut leave-in conditioner.")
                    .returnToRescue(false)
                    .createdAt(LocalDate.of(2026, 7, 25))
                    .build());

            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-202")
                    .petId("PET-001")
                    .petName("Barnaby")
                    .ownerId("USR-002")
                    .ownerName("Kavindu Perera")
                    .providerId(providerUser.getUserId())
                    .providerName(providerUser.getFullName())
                    .serviceType("Spa Session #2")
                    .serviceDate(LocalDate.of(2026, 8, 15))
                    .status(ServiceStatus.CHECKED_IN)
                    .intakeCondition("Checked in at 09:00 AM. Excellent spirits.")
                    .servicesPerformed("Scheduled for de-shedding & ear flush.")
                    .notes("Owner requested gentle dremel buffing for nails.")
                    .returnToRescue(false)
                    .createdAt(LocalDate.of(2026, 8, 15))
                    .build());
            log.info("Seeded 2 care service logs.");
        }
    }
}
