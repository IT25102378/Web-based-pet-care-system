package com.petnexus.backend.config;

import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.PetDocument;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.entity.Vaccination;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.entity.Consultation;
import com.petnexus.backend.entity.Prescription;
import com.petnexus.backend.entity.PrescriptionItem;
import com.petnexus.backend.entity.RescueCase;
import com.petnexus.backend.entity.RescueProgressLog;
import com.petnexus.backend.entity.RescuePhoto;
import com.petnexus.backend.entity.FosterRecord;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.ConsultationRepository;
import com.petnexus.backend.repository.PetDocumentRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.PrescriptionRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.repository.VaccinationRepository;
import com.petnexus.backend.repository.RescueCaseRepository;
import com.petnexus.backend.repository.RescueProgressLogRepository;
import com.petnexus.backend.repository.RescuePhotoRepository;
import com.petnexus.backend.repository.FosterRecordRepository;
import com.petnexus.backend.entity.CareProvider;
import com.petnexus.backend.entity.CareService;
import com.petnexus.backend.entity.CareServiceLog;
import com.petnexus.backend.entity.ServicePackageBooking;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.repository.CareProviderRepository;
import com.petnexus.backend.repository.CareServiceRepository;
import com.petnexus.backend.repository.CareServiceLogRepository;
import com.petnexus.backend.repository.ServicePackageBookingRepository;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.repository.SupplierRepository;
import com.petnexus.backend.repository.InventoryItemRepository;
import com.petnexus.backend.entity.Feedback;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.repository.FeedbackRepository;
import com.petnexus.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds initial Pets, Vaccinations, Pet Documents, Appointments, Consultations, Prescriptions,
 * Rescue Cases, Pet Care / Grooming, and Pharmacy Inventory & Suppliers.
 * Ensures the centralized PetNexus database has baseline data matching frontend initialData.js.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PetDocumentRepository petDocumentRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final RescueCaseRepository rescueCaseRepository;
    private final RescueProgressLogRepository rescueProgressLogRepository;
    private final RescuePhotoRepository rescuePhotoRepository;
    private final FosterRecordRepository fosterRecordRepository;
    private final CareProviderRepository careProviderRepository;
    private final CareServiceRepository careServiceRepository;
    private final CareServiceLogRepository careServiceLogRepository;
    private final ServicePackageBookingRepository servicePackageBookingRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ensure default System Administrator exists
        userRepository.findByEmail("admin@petnexus.com")
                .ifPresentOrElse(
                        existingAdmin -> {
                            boolean modified = false;
                            if (existingAdmin.getRole() != UserRole.Admin) {
                                existingAdmin.setRole(UserRole.Admin);
                                modified = true;
                            }
                            if (existingAdmin.getStatus() != UserStatus.Active) {
                                existingAdmin.setStatus(UserStatus.Active);
                                modified = true;
                            }
                            if (modified) {
                                userRepository.save(existingAdmin);
                                log.info("Updated existing admin account to role=Admin, status=Active");
                            }
                        },
                        () -> {
                            String adminUserId = userRepository.existsByUserId("USR-003") ? "USR-007" : "USR-003";
                            User newAdmin = User.builder()
                                    .userId(adminUserId)
                                    .email("admin@petnexus.com")
                                    .passwordHash(passwordEncoder.encode("password123"))
                                    .fullName("PetNexus System Administrator")
                                    .phone("+94 11 234 5678")
                                    .address("Pet Nexus Clinic, Colombo 05")
                                    .role(UserRole.Admin)
                                    .status(UserStatus.Active)
                                    .avatarUrl("/avatars/avatar-admin.jpg")
                                    .build();
                            userRepository.save(newAdmin);
                            log.info("Seeded default System Administrator account ({} - admin@petnexus.com)", adminUserId);
                        }
                );

        // Ensure default owner exists
        User owner = userRepository.findByEmail("owner@petnexus.com")
                .orElseGet(() -> {
                    User newOwner = User.builder()
                            .userId("USR-002")
                            .email("owner@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Kavindu Perera")
                            .phone("+94 77 123 4567")
                            .address("45/3 Galle Road, Colombo 06")
                            .emergencyContact("Thilini Perera (Spouse) - +94 77 234 9988")
                            .role(UserRole.PetOwner)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-pet-owner.jpg")
                            .build();
                    return userRepository.save(newOwner);
                });

        // Seed Pets
        if (petRepository.count() == 0) {
            log.info("Seeding initial pets into PetNexus database...");

            Pet barnaby = Pet.builder()
                    .petId("PET-001")
                    .owner(owner)
                    .name("Barnaby")
                    .species("Dog")
                    .breed("Golden Retriever")
                    .gender("Male")
                    .ageYears(3)
                    .ageMonths(4)
                    .dateOfBirth(LocalDate.of(2023, 4, 12))
                    .weightKg(new BigDecimal("31.50"))
                    .microchipId("985141002948123")
                    .allergies("Chicken protein, Penicillin")
                    .medicalNotes("Mild seasonal allergies in spring. Very friendly with children.")
                    .imageUrl("/images/pet-barnaby.jpg")
                    .emergencyContact("Thilini Perera (Spouse) - +94 77 234 9988")
                    .createdAt(LocalDateTime.of(2026, 1, 12, 10, 0, 0))
                    .build();

            Pet cleo = Pet.builder()
                    .petId("PET-002")
                    .owner(owner)
                    .name("Cleo")
                    .species("Cat")
                    .breed("British Shorthair")
                    .gender("Female")
                    .ageYears(2)
                    .ageMonths(1)
                    .dateOfBirth(LocalDate.of(2024, 7, 1))
                    .weightKg(new BigDecimal("4.20"))
                    .microchipId("985141009182344")
                    .allergies("None recorded")
                    .medicalNotes("Indoor cat. Spayed. Dental tartar check recommended at next visit.")
                    .imageUrl("/images/pet-cleo.jpg")
                    .emergencyContact("Thilini Perera (Spouse) - +94 77 234 9988")
                    .createdAt(LocalDateTime.of(2026, 1, 15, 14, 30, 0))
                    .build();

            Pet milo = Pet.builder()
                    .petId("PET-003")
                    .owner(owner)
                    .name("Milo")
                    .species("Rabbit")
                    .breed("Holland Lop")
                    .gender("Male")
                    .ageYears(1)
                    .ageMonths(6)
                    .dateOfBirth(LocalDate.of(2025, 2, 18))
                    .weightKg(new BigDecimal("1.80"))
                    .microchipId("985141005512999")
                    .allergies("None")
                    .medicalNotes("Needs Timothy hay rich diet. Teeth checked normal last quarter.")
                    .imageUrl("/images/pet-milo.jpg")
                    .emergencyContact("Thilini Perera (Spouse) - +94 77 234 9988")
                    .createdAt(LocalDateTime.of(2026, 2, 1, 9, 0, 0))
                    .build();

            petRepository.saveAll(List.of(barnaby, cleo, milo));
            log.info("Seeded 3 initial pets.");

            // Seed Vaccinations
            Vaccination v1 = Vaccination.builder()
                    .vaccineId("VAC-001")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .vaccineName("Rabies 3-Year")
                    .batchNumber("RB-2025-9921")
                    .administeredDate(LocalDate.of(2025, 5, 10))
                    .nextDueDate(LocalDate.of(2028, 5, 10))
                    .administeredBy("Dr. Sachini Wijesinghe, BVSc")
                    .status("Up-to-Date")
                    .build();

            Vaccination v2 = Vaccination.builder()
                    .vaccineId("VAC-002")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .vaccineName("DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)")
                    .batchNumber("DH-2026-1044")
                    .administeredDate(LocalDate.of(2026, 1, 18))
                    .nextDueDate(LocalDate.of(2027, 1, 18))
                    .administeredBy("Dr. Sachini Wijesinghe, BVSc")
                    .status("Up-to-Date")
                    .build();

            Vaccination v3 = Vaccination.builder()
                    .vaccineId("VAC-003")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .vaccineName("Bordetella (Kennel Cough)")
                    .batchNumber("BD-2026-4401")
                    .administeredDate(LocalDate.of(2026, 2, 10))
                    .nextDueDate(LocalDate.of(2026, 8, 10))
                    .administeredBy("Dr. Sachini Wijesinghe, BVSc")
                    .status("Due Soon")
                    .build();

            Vaccination v4 = Vaccination.builder()
                    .vaccineId("VAC-004")
                    .pet(cleo)
                    .petName(cleo.getName())
                    .vaccineName("FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)")
                    .batchNumber("FV-2025-3392")
                    .administeredDate(LocalDate.of(2025, 8, 14))
                    .nextDueDate(LocalDate.of(2026, 8, 14))
                    .administeredBy("Dr. Sachini Wijesinghe, BVSc")
                    .status("Due Soon")
                    .build();

            Vaccination v5 = Vaccination.builder()
                    .vaccineId("VAC-005")
                    .pet(cleo)
                    .petName(cleo.getName())
                    .vaccineName("Feline Rabies")
                    .batchNumber("FR-2025-8812")
                    .administeredDate(LocalDate.of(2025, 8, 14))
                    .nextDueDate(LocalDate.of(2026, 8, 14))
                    .administeredBy("Dr. Sachini Wijesinghe, BVSc")
                    .status("Due Soon")
                    .build();

            vaccinationRepository.saveAll(List.of(v1, v2, v3, v4, v5));
            log.info("Seeded 5 initial vaccinations.");

            // Seed Pet Documents
            String ownerId = owner.getUserId();
            PetDocument d1 = PetDocument.builder()
                    .documentId("DOC-101")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .ownerId(ownerId)
                    .documentType("Vaccination Certificate")
                    .fileName("Barnaby_Rabies_Certificate_2025.pdf")
                    .fileUrl("/images/document-certificate.jpg")
                    .fileSize("1.2 MB")
                    .uploadedAt(LocalDateTime.of(2025, 5, 10, 14, 30, 0))
                    .notes("Official 3-year rabies vaccination certification signed by Dr. Sachini Wijesinghe.")
                    .build();

            PetDocument d2 = PetDocument.builder()
                    .documentId("DOC-102")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .ownerId(ownerId)
                    .documentType("Prescription")
                    .fileName("Rx_Apoquel_Dermatology_Barnaby.pdf")
                    .fileUrl("/images/document-identity-card.jpg")
                    .fileSize("680 KB")
                    .uploadedAt(LocalDateTime.of(2026, 7, 20, 11, 15, 0))
                    .notes("Apoquel 16mg allergy treatment dosage schedule and prescription details.")
                    .build();

            PetDocument d3 = PetDocument.builder()
                    .documentId("DOC-103")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .ownerId(ownerId)
                    .documentType("Medical Report")
                    .fileName("Comprehensive_Blood_Panel_Barnaby_2026.pdf")
                    .fileUrl("/images/document-certificate.jpg")
                    .fileSize("2.4 MB")
                    .uploadedAt(LocalDateTime.of(2026, 1, 18, 10, 0, 0))
                    .notes("Annual biochemistry and complete blood count lab diagnostics report.")
                    .build();

            PetDocument d4 = PetDocument.builder()
                    .documentId("DOC-104")
                    .pet(barnaby)
                    .petName(barnaby.getName())
                    .ownerId(ownerId)
                    .documentType("Other")
                    .fileName("Kennel_Club_Registration_Barnaby.pdf")
                    .fileUrl("/images/document-letter.jpg")
                    .fileSize("1.5 MB")
                    .uploadedAt(LocalDateTime.of(2024, 6, 12, 9, 0, 0))
                    .notes("Pedigree and breed registration certificate.")
                    .build();

            PetDocument d5 = PetDocument.builder()
                    .documentId("DOC-105")
                    .pet(cleo)
                    .petName(cleo.getName())
                    .ownerId(ownerId)
                    .documentType("Vaccination Certificate")
                    .fileName("Cleo_FVRCP_Booster_Record.pdf")
                    .fileUrl("/images/document-certificate.jpg")
                    .fileSize("850 KB")
                    .uploadedAt(LocalDateTime.of(2025, 8, 14, 9, 20, 0))
                    .notes("Feline core tri-cat immunization card.")
                    .build();

            PetDocument d6 = PetDocument.builder()
                    .documentId("DOC-106")
                    .pet(cleo)
                    .petName(cleo.getName())
                    .ownerId(ownerId)
                    .documentType("Medical Report")
                    .fileName("Cleo_Spay_Surgery_Discharge_Summary.pdf")
                    .fileUrl("/images/document-identity-card.jpg")
                    .fileSize("1.1 MB")
                    .uploadedAt(LocalDateTime.of(2024, 12, 5, 16, 0, 0))
                    .notes("Ovariohysterectomy post-operative recovery protocol and surgical notes.")
                    .build();

            PetDocument d7 = PetDocument.builder()
                    .documentId("DOC-107")
                    .pet(milo)
                    .petName(milo.getName())
                    .ownerId(ownerId)
                    .documentType("Medical Report")
                    .fileName("Milo_Dental_Incisor_Report.pdf")
                    .fileUrl("/images/document-certificate.jpg")
                    .fileSize("540 KB")
                    .uploadedAt(LocalDateTime.of(2026, 2, 1, 15, 45, 0))
                    .notes("Exotic dental evaluation and malocclusion check.")
                    .build();

            petDocumentRepository.saveAll(List.of(d1, d2, d3, d4, d5, d6, d7));
            log.info("Seeded 7 initial pet documents.");
        }

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

        // =====================================================================
        // Seed Rescue Cases (Phase 5)
        // Mirrors initialRescueCases in frontend initialData.js
        // =====================================================================
        if (rescueCaseRepository.count() == 0) {
            log.info("Seeding rescue cases, progress logs, photos, and foster records...");

            // RSC-2026-001 — Luna (Intake)
            RescueCase luna = rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-001")
                    .caseNumber("RC-2026-01")
                    .temporaryName("Luna")
                    .species("Dog")
                    .breed("Australian Shepherd Mix")
                    .estimatedAge("1.5 years")
                    .gender("Female")
                    .rescueLocation("Found near Kandy Road, Kelaniya")
                    .intakeDate(LocalDate.of(2026, 7, 2))
                    .conditionSeverity("Moderate")
                    .status("Intake")
                    .isPublishedForAdoption(false)
                    .microchipId("985141099238471")
                    .intakeOfficer("Shehan Rajapaksha (Rescue Officer)")
                    .description("Energetic, affectionate, and great with humans. Luna was found dehydrated and underweight, but has made a 100% recovery.")
                    .medicalSummary("Spayed, fully vaccinated, treated for tick fever, negative for heartworm.")
                    .coverPhotoUrl("/images/rescue-luna.jpg")
                    .fosterParentId("FST-001")
                    .fosterParentName("Piumi Senanayake")
                    .build());

            // RSC-2026-002 — Oliver & Pip (InFoster, published)
            RescueCase oliverPip = rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-002")
                    .caseNumber("RC-2026-02")
                    .temporaryName("Oliver & Pip (Bonded Pair)")
                    .species("Cat")
                    .breed("Domestic Short Hair (Tabby)")
                    .estimatedAge("8 months")
                    .gender("Male & Female")
                    .rescueLocation("Abandoned in carrier outside Dehiwala Industrial Area")
                    .intakeDate(LocalDate.of(2026, 7, 18))
                    .conditionSeverity("Low")
                    .status("InFoster")
                    .isPublishedForAdoption(true)
                    .microchipId("985141088339102")
                    .intakeOfficer("Shehan Rajapaksha (Rescue Officer)")
                    .description("Inseparable brother and sister duo who love curling up together and chasing laser pointers.")
                    .medicalSummary("Neutered/spayed, microchipped, dewormed, negative for FIV/FeLV.")
                    .coverPhotoUrl("/images/rescue-oliver-pip.jpg")
                    .fosterParentId("FST-002")
                    .fosterParentName("Chamara & Nadeeka Jayawardena")
                    .build());

            // RSC-2026-003 — Zeus (InTreatment)
            RescueCase zeus = rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-003")
                    .caseNumber("RC-2026-03")
                    .temporaryName("Zeus")
                    .species("Dog")
                    .breed("Siberian Husky")
                    .estimatedAge("4 years")
                    .gender("Male")
                    .rescueLocation("Found stray near Beira Lake, Colombo 02")
                    .intakeDate(LocalDate.of(2026, 8, 1))
                    .conditionSeverity("High")
                    .status("InTreatment")
                    .isPublishedForAdoption(false)
                    .microchipId("985141077448291")
                    .intakeOfficer("Shehan Rajapaksha (Rescue Officer)")
                    .description("Majestic blue-eyed husky currently rehabilitating a minor pelvic fracture and corneal abrasion.")
                    .medicalSummary("Undergoing physical therapy with Dr. Wijesinghe. Pain managed with Meloxicam.")
                    .coverPhotoUrl("/images/rescue-zeus.jpg")
                    .build());

            // RSC-2026-004 — Daisy (ReadyForAdoption, published)
            RescueCase daisy = rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-004")
                    .caseNumber("RC-2026-04")
                    .temporaryName("Daisy")
                    .species("Dog")
                    .breed("Beagle")
                    .estimatedAge("2 years")
                    .gender("Female")
                    .rescueLocation("Transferred from Colombo Municipal Shelter, Borella")
                    .intakeDate(LocalDate.of(2026, 8, 10))
                    .conditionSeverity("Low")
                    .status("ReadyForAdoption")
                    .isPublishedForAdoption(true)
                    .microchipId("985141066551920")
                    .intakeOfficer("Shehan Rajapaksha (Rescue Officer)")
                    .description("Sweet, gentle natured beagle who loves scent games and cuddles on the couch.")
                    .medicalSummary("Dental prophylaxis done, vaccinations up to date, spayed.")
                    .coverPhotoUrl("/images/rescue-daisy.jpg")
                    .build());

            log.info("Seeded 4 rescue cases.");

            // ------------------------------------------------------------------
            // Progress Logs — mirrors initialRescueProgressLogs
            // ------------------------------------------------------------------
            rescueProgressLogRepository.save(RescueProgressLog.builder()
                    .logId("RPL-501")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .loggedBy("Dr. Sachini Wijesinghe")
                    .logDate(LocalDateTime.of(2026, 7, 3, 11, 0, 0))
                    .logType("Medical")
                    .title("Intake Physical & IV Fluid Hydration")
                    .notes("Patient was 4kg underweight with mild anemia from ticks. Started Doxycycline regimen and premium nutrient paste.")
                    .build());

            rescueProgressLogRepository.save(RescueProgressLog.builder()
                    .logId("RPL-502")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .loggedBy("Shehan Rajapaksha")
                    .logDate(LocalDateTime.of(2026, 7, 15, 15, 30, 0))
                    .logType("Behavioral")
                    .title("Foster Home Placement with Piumi")
                    .notes("Luna transitioned to foster home smoothly. Shows zero food aggression and interacts gently with resident labrador.")
                    .build());

            rescueProgressLogRepository.save(RescueProgressLog.builder()
                    .logId("RPL-503")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .loggedBy("Dr. Sachini Wijesinghe")
                    .logDate(LocalDateTime.of(2026, 7, 28, 10, 0, 0))
                    .logType("Milestone")
                    .title("Cleared for Public Adoption")
                    .notes("Bloodwork normal. Weight reached 22kg healthy goal. Spay incision completely healed. Status changed to ReadyForAdoption.")
                    .build());

            rescueProgressLogRepository.save(RescueProgressLog.builder()
                    .logId("RPL-504")
                    .rescueCase(zeus)
                    .caseId("RSC-2026-003")
                    .loggedBy("Dr. Sachini Wijesinghe")
                    .logDate(LocalDateTime.of(2026, 8, 2, 9, 0, 0))
                    .logType("Medical")
                    .title("Pelvic Radiograph & Stabilization")
                    .notes("Stable non-displaced pelvic hairline fissure. Conservative crate rest for 3 weeks recommended alongside laser therapy.")
                    .build());

            log.info("Seeded 4 rescue progress logs.");

            // ------------------------------------------------------------------
            // Photos — mirrors initialRescuePhotos
            // ------------------------------------------------------------------
            rescuePhotoRepository.save(RescuePhoto.builder()
                    .photoId("RPH-01")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .photoUrl("/images/rescue-luna-photo.jpg")
                    .caption("Luna smiling during afternoon foster play session")
                    .uploadedAt(LocalDateTime.of(2026, 7, 28, 10, 30, 0))
                    .tag("Adoption Profile")
                    .build());

            rescuePhotoRepository.save(RescuePhoto.builder()
                    .photoId("RPH-02")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .photoUrl("/images/rescue-luna-intake.jpg")
                    .caption("Luna on first day of intake rescue")
                    .uploadedAt(LocalDateTime.of(2026, 7, 2, 10, 35, 0))
                    .tag("Intake Evidence")
                    .build());

            rescuePhotoRepository.save(RescuePhoto.builder()
                    .photoId("RPH-03")
                    .rescueCase(oliverPip)
                    .caseId("RSC-2026-002")
                    .photoUrl("/images/rescue-oliver-pip-photo.jpg")
                    .caption("Oliver and Pip napping together")
                    .uploadedAt(LocalDateTime.of(2026, 7, 20, 16, 0, 0))
                    .tag("Foster Life")
                    .build());

            log.info("Seeded 3 rescue photos.");

            // ------------------------------------------------------------------
            // Foster Records — mirrors initialFosterRecords
            // ------------------------------------------------------------------
            fosterRecordRepository.save(FosterRecord.builder()
                    .fosterId("FST-001")
                    .fullName("Piumi Senanayake")
                    .phone("+94 77 333 7711")
                    .email("piumi.senanayake@example.com")
                    .address("27/A Havelock Road, Colombo 05")
                    .homeType("Single Family with Walled Garden")
                    .activePlacements(1)
                    .maxCapacity(2)
                    .rating(new BigDecimal("5.0"))
                    .status("Active")
                    .build());

            fosterRecordRepository.save(FosterRecord.builder()
                    .fosterId("FST-002")
                    .fullName("Chamara & Nadeeka Jayawardena")
                    .phone("+94 71 444 8822")
                    .email("jayawardena.family@example.com")
                    .address("8 Torrington Avenue, Colombo 07")
                    .homeType("Spacious Apartment (Cat Friendly)")
                    .activePlacements(1)
                    .maxCapacity(3)
                    .rating(new BigDecimal("4.9"))
                    .status("Active")
                    .build());

            log.info("Seeded 2 foster records.");
        }

        // ------------------------------------------------------------------
        // Phase 7: Care Provider, Services, Package Bookings, Service Logs
        // ------------------------------------------------------------------
        User providerUser = userRepository.findByEmail("provider@petnexus.com")
                .orElseGet(() -> {
                    User newProvider = User.builder()
                            .userId("USR-004")
                            .email("provider@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Dilshan Bandara")
                            .phone("+94 77 987 6543")
                            .address("12 Station Road, Bambalapitiya, Colombo 04")
                            .role(UserRole.PetCareProvider)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-rejected-applicant.jpg")
                            .build();
                    return userRepository.save(newProvider);
                });

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

        // ------------------------------------------------------------------
        // Phase 8: Suppliers & Inventory Items
        // ------------------------------------------------------------------
        if (supplierRepository.count() == 0) {
            log.info("Seeding initial Suppliers into PetNexus database...");
            Supplier sup01 = supplierRepository.save(Supplier.builder()
                    .supplierId("SUP-01")
                    .companyName("Zoetis Animal Health Sri Lanka (Pvt) Ltd")
                    .contactPerson("Ruwan Abeysekara")
                    .email("orders@zoetis-sl.com")
                    .phone("+94 11 234 7700")
                    .category("Pharmaceuticals & Vaccines")
                    .leadTimeDays(2)
                    .rating(new BigDecimal("4.9"))
                    .address("117 Sir James Peiris Mawatha, Colombo 02")
                    .active(true)
                    .build());

            Supplier sup02 = supplierRepository.save(Supplier.builder()
                    .supplierId("SUP-02")
                    .companyName("Sathosa Veterinary & Medical Supplies (Pvt) Ltd")
                    .contactPerson("Pradeep Kumara")
                    .email("supply@sathosamedicalsupplies.lk")
                    .phone("+94 11 456 8800")
                    .category("Surgical & Clinical Equipment")
                    .leadTimeDays(3)
                    .rating(new BigDecimal("4.8"))
                    .address("45 Vauxhall Street, Colombo 02")
                    .active(true)
                    .build());

            Supplier sup03 = supplierRepository.save(Supplier.builder()
                    .supplierId("SUP-03")
                    .companyName("Royal Canin Sri Lanka & Hill's Science Nutrition")
                    .contactPerson("Anoma Rajapaksha")
                    .email("vetcare@royalcanin-sl.com")
                    .phone("+94 11 789 5500")
                    .category("Prescription Diets & Nutrition")
                    .leadTimeDays(4)
                    .rating(new BigDecimal("4.7"))
                    .address("23 R.A. De Mel Mawatha, Colombo 04")
                    .active(true)
                    .build());

            log.info("Seeded 3 suppliers.");

            if (inventoryItemRepository.count() == 0) {
                log.info("Seeding initial Inventory Items into PetNexus database...");
                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-101")
                        .name("Apoquel 16mg (Oclacitinib) 100ct")
                        .category("Pharmaceuticals")
                        .sku("MED-APQ-016")
                        .batchNumber("BT-88912")
                        .currentStock(18)
                        .minStockThreshold(10)
                        .unit("Bottles")
                        .unitPrice(new BigDecimal("38000.00"))
                        .sellingPrice(new BigDecimal("52000.00"))
                        .expiryDate(LocalDate.of(2027, 11, 30))
                        .supplier(sup01)
                        .supplierName(sup01.getCompanyName())
                        .status(StockStatus.IN_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-102")
                        .name("Rabies 3-Year Canine/Feline Vaccine 50-Dose")
                        .category("Vaccines")
                        .sku("VAC-RAB-03Y")
                        .batchNumber("BT-99411")
                        .currentStock(4)
                        .minStockThreshold(8)
                        .unit("Vials (Pack)")
                        .unitPrice(new BigDecimal("22500.00"))
                        .sellingPrice(new BigDecimal("38500.00"))
                        .expiryDate(LocalDate.of(2027, 4, 15))
                        .supplier(sup01)
                        .supplierName(sup01.getCompanyName())
                        .status(StockStatus.LOW_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-103")
                        .name("Surgical Suture Vicryl 3-0 with Reverse Cutting Needle")
                        .category("Surgical Supplies")
                        .sku("SUR-SUT-VIC30")
                        .batchNumber("BT-44102")
                        .currentStock(32)
                        .minStockThreshold(15)
                        .unit("Boxes (12/pk)")
                        .unitPrice(new BigDecimal("11000.00"))
                        .sellingPrice(new BigDecimal("17500.00"))
                        .expiryDate(LocalDate.of(2028, 9, 1))
                        .supplier(sup02)
                        .supplierName(sup02.getCompanyName())
                        .status(StockStatus.IN_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-104")
                        .name("Royal Canin Veterinary Gastrointestinal Low Fat 12kg")
                        .category("Prescription Diet")
                        .sku("NUT-RC-GI-12K")
                        .batchNumber("BT-10293")
                        .currentStock(2)
                        .minStockThreshold(6)
                        .unit("Bags")
                        .unitPrice(new BigDecimal("18000.00"))
                        .sellingPrice(new BigDecimal("25000.00"))
                        .expiryDate(LocalDate.of(2026, 12, 15))
                        .supplier(sup03)
                        .supplierName(sup03.getCompanyName())
                        .status(StockStatus.LOW_STOCK)
                        .build());

                inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-105")
                        .name("Isoflurane Inhalation Anesthetic USP 250ml")
                        .category("Anesthetics")
                        .sku("MED-ISO-250ML")
                        .batchNumber("BT-66129")
                        .currentStock(12)
                        .minStockThreshold(5)
                        .unit("Bottles")
                        .unitPrice(new BigDecimal("14500.00"))
                        .sellingPrice(new BigDecimal("21500.00"))
                        .expiryDate(LocalDate.of(2028, 1, 20))
                        .supplier(sup02)
                        .supplierName(sup02.getCompanyName())
                        .status(StockStatus.IN_STOCK)
                        .build());

                log.info("Seeded 5 inventory items.");
            }
        }

        // ------------------------------------------------------------------
        // Phase 9: Feedback & Notifications
        // ------------------------------------------------------------------
        User manager = userRepository.findByEmail("manager@petnexus.com")
                .orElseGet(() -> {
                    User newManager = User.builder()
                            .userId("USR-005")
                            .email("manager@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Himashi Gunawardena")
                            .phone("+94 77 567 8901")
                            .address("5/1 Gregory's Road, Colombo 07")
                            .role(UserRole.ClinicManager)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-clinic-manager.jpg")
                            .build();
                    return userRepository.save(newManager);
                });

        if (feedbackRepository.count() == 0) {
            log.info("Seeding initial Feedback into PetNexus database...");
            feedbackRepository.save(Feedback.builder()
                    .feedbackId("FDB-001")
                    .user(owner)
                    .userName("Kavindu Perera")
                    .serviceCategory("Veterinary Consultation")
                    .rating(5)
                    .title("Outstanding care by Dr. Wijesinghe for Barnaby's allergies")
                    .comments("Dr. Wijesinghe took the time to explain the difference between food and environmental allergies. Barnaby stopped itching within 48 hours. Incredible clinic atmosphere!")
                    .staffMentioned("Dr. Sachini Wijesinghe")
                    .managerResponse("Thank you Kavindu! We are thrilled to hear Barnaby is feeling playful and allergy-free.")
                    .managerRespondedAt(LocalDateTime.of(2026, 7, 23, 9, 30))
                    .createdAt(LocalDateTime.of(2026, 7, 22, 14, 0))
                    .build());

            feedbackRepository.save(Feedback.builder()
                    .feedbackId("FDB-002")
                    .user(owner)
                    .userName("Kavindu Perera")
                    .serviceCategory("Grooming & Spa")
                    .rating(5)
                    .title("Dilshan is a master with big golden retrievers")
                    .comments("Barnaby came out looking like a show dog! His coat smells fresh and clean, and he wasn’t stressed at all.")
                    .staffMentioned("Dilshan Bandara")
                    .managerResponse("We love having Barnaby in the salon! Thank you for trusting us with his grooming.")
                    .managerRespondedAt(LocalDateTime.of(2026, 7, 27, 10, 0))
                    .createdAt(LocalDateTime.of(2026, 7, 26, 16, 30))
                    .build());
            log.info("Seeded 2 feedback entries.");
        }

        if (notificationRepository.count() == 0) {
            log.info("Seeding initial Notifications into PetNexus database...");
            notificationRepository.save(Notification.builder()
                    .notificationId("NTF-01")
                    .user(owner)
                    .type(NotificationType.Appointment)
                    .title("Appointment Reminder")
                    .message("Barnaby is checked in for today’s Routine Wellness visit with Dr. Sachini Wijesinghe (Token: A-01).")
                    .isRead(false)
                    .link("/owner/appointments")
                    .createdAt(LocalDateTime.of(2026, 8, 15, 9, 30))
                    .build());

            notificationRepository.save(Notification.builder()
                    .notificationId("NTF-02")
                    .user(owner)
                    .type(NotificationType.Adoption)
                    .title("Adoption Application Under Review")
                    .message("Your adoption application for Luna (RSC-2026-001) has been received and is being reviewed by Rescue Officer Shehan Rajapaksha.")
                    .isRead(false)
                    .link("/owner/adopt")
                    .createdAt(LocalDateTime.of(2026, 8, 13, 10, 0))
                    .build());

            notificationRepository.save(Notification.builder()
                    .notificationId("NTF-04")
                    .user(manager)
                    .type(NotificationType.Inventory)
                    .title("Low Stock Alert: Rabies Vaccine")
                    .message("Rabies 3-Year Vaccine has fallen below minimum reorder threshold (4 vials remaining).")
                    .isRead(false)
                    .link("/manager/inventory")
                    .createdAt(LocalDateTime.of(2026, 8, 15, 8, 0))
                    .build());
            log.info("Seeded 3 notifications.");
        }
    }
}
