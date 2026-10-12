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

    private User seedOrUpdateUser(
            String defaultUserId,
            String email,
            String fullName,
            String phone,
            String address,
            UserRole role,
            String avatarUrl,
            String emergencyContact,
            String licenseNumber,
            String specialization,
            String staffId,
            String managerCode,
            String badgeNumber,
            String serviceSpecialty
    ) {
        return userRepository.findByEmail(email)
                .map(existing -> {
                    boolean modified = false;
                    if (existing.getStatus() != UserStatus.Active) {
                        existing.setStatus(UserStatus.Active);
                        modified = true;
                    }
                    if (existing.getRole() != role) {
                        existing.setRole(role);
                        modified = true;
                    }
                    if (fullName != null && existing.getFullName() == null) {
                        existing.setFullName(fullName);
                        modified = true;
                    }
                    if (phone != null && (existing.getPhone() == null
                            || !existing.getPhone().matches(com.petnexus.backend.validation.ValidationRules.PHONE))) {
                        existing.setPhone(phone);
                        modified = true;
                    }
                    if (address != null && existing.getAddress() == null) {
                        existing.setAddress(address);
                        modified = true;
                    }
                    if (avatarUrl != null && existing.getAvatarUrl() == null) {
                        existing.setAvatarUrl(avatarUrl);
                        modified = true;
                    }
                    if (emergencyContact != null && existing.getEmergencyContact() == null) {
                        existing.setEmergencyContact(emergencyContact);
                        modified = true;
                    }
                    if (licenseNumber != null && (existing instanceof com.petnexus.backend.entity.Veterinarian v ? v.getLicenseNumber() : null) == null) {
                        if (existing instanceof com.petnexus.backend.entity.Veterinarian v) v.setLicenseNumber(licenseNumber);
                        modified = true;
                    }
                    if (specialization != null && (existing instanceof com.petnexus.backend.entity.Veterinarian v ? v.getSpecialization() : null) == null) {
                        if (existing instanceof com.petnexus.backend.entity.Veterinarian v) v.setSpecialization(specialization);
                        modified = true;
                    }
                    if (staffId != null && (existing instanceof com.petnexus.backend.entity.ClinicStaff s ? s.getStaffId() : null) == null) {
                        if (existing instanceof com.petnexus.backend.entity.ClinicStaff s) s.setStaffId(staffId);
                        modified = true;
                    }
                    if (managerCode != null && (existing instanceof com.petnexus.backend.entity.ClinicManager m ? m.getManagerCode() : null) == null) {
                        if (existing instanceof com.petnexus.backend.entity.ClinicManager m) m.setManagerCode(managerCode);
                        modified = true;
                    }
                    if (badgeNumber != null && (existing instanceof com.petnexus.backend.entity.RescueOfficer r ? r.getBadgeNumber() : null) == null) {
                        if (existing instanceof com.petnexus.backend.entity.RescueOfficer r) r.setBadgeNumber(badgeNumber);
                        modified = true;
                    }
                    if (serviceSpecialty != null && (existing instanceof com.petnexus.backend.entity.PetCareProvider p ? p.getServiceSpecialty() : null) == null) {
                        if (existing instanceof com.petnexus.backend.entity.PetCareProvider p) p.setServiceSpecialty(serviceSpecialty);
                        modified = true;
                    }
                    if (!passwordEncoder.matches("password123", existing.getPasswordHash())) {
                        existing.setPasswordHash(passwordEncoder.encode("password123"));
                        modified = true;
                    }
                    if (modified) {
                        userRepository.save(existing);
                        log.info("Updated stakeholder account ({}) to Active with valid credentials", email);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    String finalUserId = defaultUserId;
                    if (userRepository.existsByUserId(finalUserId)) {
                        finalUserId = "USR-" + (System.currentTimeMillis() % 100000);
                    }
                    User newUser;
                    switch (role) {
                        case Veterinarian -> newUser = com.petnexus.backend.entity.Veterinarian.builder()
                                .licenseNumber(licenseNumber).specialization(specialization).build();
                        case ClinicStaff -> newUser = com.petnexus.backend.entity.ClinicStaff.builder()
                                .staffId(staffId).build();
                        case ClinicManager -> newUser = com.petnexus.backend.entity.ClinicManager.builder()
                                .managerCode(managerCode).build();
                        case RescueOfficer -> newUser = com.petnexus.backend.entity.RescueOfficer.builder()
                                .badgeNumber(badgeNumber).build();
                        case PetCareProvider -> newUser = com.petnexus.backend.entity.PetCareProvider.builder()
                                .serviceSpecialty(serviceSpecialty).build();
                        case PetOwner -> newUser = com.petnexus.backend.entity.PetOwner.builder().build();
                        default -> newUser = new User();
                    }
                    newUser.setUserId(finalUserId);
                    newUser.setEmail(email);
                    newUser.setPasswordHash(passwordEncoder.encode("password123"));
                    newUser.setFullName(fullName);
                    newUser.setPhone(phone);
                    newUser.setAddress(address);
                    newUser.setRole(role);
                    newUser.setStatus(UserStatus.Active);
                    newUser.setAvatarUrl(avatarUrl);
                    newUser.setEmergencyContact(emergencyContact);
                    User saved = userRepository.save(newUser);
                    log.info("Seeded stakeholder account: {} ({}) with role {}", finalUserId, email, role);
                    return saved;
                });
    }

    /** Converts a stored "+94 77 123 4567" style number to the local 10-digit format; returns null if no change is needed. */
    private String normalizeLegacyPhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^0-9]", "");
        String fixed;
        if (digits.matches("0\\d{9}")) {
            fixed = digits;                         // 077-123 4567, (077) 1234567
        } else if (digits.matches("94\\d{9}")) {
            fixed = "0" + digits.substring(2);      // +94 77 123 4567, 94771234567
        } else if (digits.matches("0094\\d{9}")) {
            fixed = "0" + digits.substring(4);      // 0094 77 123 4567
        } else if (digits.matches("[1-9]\\d{8}")) {
            fixed = "0" + digits;                   // 771234567
        } else {
            return null;                            // cannot be converted safely - left for the user to correct
        }
        return fixed.equals(phone) ? null : fixed;
    }

    /** Rewrites a +94 number written inside free text (e.g. "Thilini (Spouse) - +94 77 234 9988"). */
    private String normalizeLegacyContactText(String text) {
        if (text == null) return null;
        String fixed = text.replaceAll("\\+94[\\s-]?(\\d{2})[\\s-]?(\\d{3})[\\s-]?(\\d{4})(?!\\d)", "0$1$2$3");
        return fixed.equals(text) ? null : fixed;
    }

    private void normalizeLegacyPhoneNumbers() {
        userRepository.findAll().forEach(u -> {
            String fixed = normalizeLegacyPhone(u.getPhone());
            String fixedContact = normalizeLegacyContactText(u.getEmergencyContact());
            if (fixed != null) u.setPhone(fixed);
            if (fixedContact != null) u.setEmergencyContact(fixedContact);
            if (fixed != null || fixedContact != null) userRepository.save(u);
        });
        petRepository.findAll().forEach(p -> {
            String fixedContact = normalizeLegacyContactText(p.getEmergencyContact());
            if (fixedContact != null) {
                p.setEmergencyContact(fixedContact);
                petRepository.save(p);
            }
        });
        supplierRepository.findAll().forEach(sup -> {
            String fixed = normalizeLegacyPhone(sup.getPhone());
            if (fixed != null) {
                sup.setPhone(fixed);
                supplierRepository.save(sup);
            }
        });
        fosterRecordRepository.findAll().forEach(fr -> {
            String fixed = normalizeLegacyPhone(fr.getPhone());
            if (fixed != null) {
                fr.setPhone(fixed);
                fosterRecordRepository.save(fr);
            }
        });
        careProviderRepository.findAll().forEach(cp -> {
            String fixed = normalizeLegacyPhone(cp.getContactPhone());
            if (fixed != null) {
                cp.setContactPhone(fixed);
                careProviderRepository.save(cp);
            }
        });
    }

    @Override
    public void run(String... args) {
        normalizeLegacyPhoneNumbers();

        // Ensure all 6 core Stakeholders and System Administrator exist with Active status and password123
        seedOrUpdateUser(
                "USR-007", "admin@petnexus.com", "PetNexus System Administrator",
                "0112345678", "Pet Nexus Clinic, Colombo 05", UserRole.Admin,
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
                "Not provided", null, null, null, null, null, null
        );

        User owner = seedOrUpdateUser(
                "USR-001", "owner@petnexus.com", "Kavindu Perera",
                "0771234567", "45/3 Galle Road, Colombo 06", UserRole.PetOwner,
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                "Thilini Perera (Spouse) - 0772349988", null, null, null, null, null, null
        );

        seedOrUpdateUser(
                "USR-002", "vet@petnexus.com", "Dr. Sachini Wijesinghe, BVSc",
                "0712345678", "12 Wijerama Mawatha, Colombo 07", UserRole.Veterinarian,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
                "Not provided", "SLVC-VET-2019-0842", "Small Animal Surgery & Internal Medicine", null, null, null, null
        );

        seedOrUpdateUser(
                "USR-003", "staff@petnexus.com", "Nethmi Fernando",
                "0763456789", "22 Nawala Road, Rajagiriya", UserRole.ClinicStaff,
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "Not provided", null, null, "STF-104", null, null, null
        );

        User providerUser = seedOrUpdateUser(
                "USR-004", "provider@petnexus.com", "Dilshan Bandara",
                "0704567890", "78 High Level Road, Maharagama", UserRole.PetCareProvider,
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "Not provided", null, null, null, null, null, "Master Groomer & Canine Behaviour Specialist"
        );

        User manager = seedOrUpdateUser(
                "USR-005", "manager@petnexus.com", "Himashi Gunawardena",
                "0775678901", "5/1 Gregory's Road, Colombo 07", UserRole.ClinicManager,
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                "Not provided", null, null, null, "MGR-001", null, null
        );

        seedOrUpdateUser(
                "USR-006", "rescue@petnexus.com", "Shehan Rajapaksha",
                "0716789012", "33 Baseline Road, Nugegoda", UserRole.RescueOfficer,
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "Not provided", null, null, null, null, "RSC-882", null
        );

        // User-created stakeholder accounts
        seedOrUpdateUser(
                "USR-013", "ifaza@petnexus.com", "Ifaza Dilshad",
                "0789984329", "colombo", UserRole.PetOwner,
                "https://api.dicebear.com/7.x/bottts/svg?seed=USR-013",
                "Not provided", null, null, null, null, null, null
        );

        seedOrUpdateUser(
                "USR-014", "oshada@petnexus.com", "Oshada",
                "0704685236", "Rajagiriya", UserRole.Veterinarian,
                "https://api.dicebear.com/7.x/bottts/svg?seed=USR-014",
                "Not provided", "VET-NY-765", "Clinical Veterinarian", null, null, null, null
        );

        seedOrUpdateUser(
                "USR-015", "lakdin@petnexus.com", "Lakdin",
                "0705896156", "Colombo", UserRole.ClinicStaff,
                "https://api.dicebear.com/7.x/bottts/svg?seed=USR-015",
                "Not provided", null, null, "STF-098", null, null, null
        );

        User eshaniUser = seedOrUpdateUser(
                "USR-016", "eshani@petnexus.com", "Eshani",
                "0704564985", "Colombo", UserRole.PetCareProvider,
                "https://api.dicebear.com/7.x/bottts/svg?seed=USR-016",
                "Not provided", null, null, null, null, null, "Master Groomer"
        );

        seedOrUpdateUser(
                "USR-017", "ediriweera@petnexus.com", "Ediriweera D.L",
                "0778452169", "COlombo", UserRole.ClinicManager,
                "https://api.dicebear.com/7.x/bottts/svg?seed=USR-017",
                "Not provided", null, null, null, "MGR-PASS-002", null, null
        );
        seedOrUpdateUser(
                "USR-018", "avijeeva6@gmail.com", "Avinash",
                "0712345678", "Colombo", UserRole.RescueOfficer,
                "https://api.dicebear.com/7.x/bottts/svg?seed=USR-018",
                "Not provided", null, null, null, null, "RSC-018", null
        );



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
                    .imageUrl("https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80")
                    .emergencyContact("Thilini Perera (Spouse) - 0772349988")
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
                    .imageUrl("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80")
                    .emergencyContact("Thilini Perera (Spouse) - 0772349988")
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
                    .imageUrl("https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&auto=format&fit=crop&q=80")
                    .emergencyContact("Thilini Perera (Spouse) - 0772349988")
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
                    .fileUrl("https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600&auto=format&fit=crop&q=80")
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
                    .fileUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80")
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
                    .fileUrl("https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600&auto=format&fit=crop&q=80")
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
                    .fileUrl("https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80")
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
                    .fileUrl("https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600&auto=format&fit=crop&q=80")
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
                    .fileUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80")
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
                    .fileUrl("https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600&auto=format&fit=crop&q=80")
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
                    .ownerPhone("0717778899")
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
                    .status("InFoster")
                    .isPublishedForAdoption(false)
                    .microchipId("985141099238471")
                    .intakeOfficer("Shehan Rajapaksha (Rescue Officer)")
                    .description("Energetic, affectionate, and great with humans. Luna was found dehydrated and underweight, but has made a 100% recovery.")
                    .medicalSummary("Spayed, fully vaccinated, treated for tick fever, negative for heartworm.")
                    .coverPhotoUrl("https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop&q=80")
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
                    .coverPhotoUrl("https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop&q=80")
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
                    .coverPhotoUrl("https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&auto=format&fit=crop&q=80")
                    .build());

            // RSC-2026-004 — Daisy (ReadyForAdoption, published)
            rescueCaseRepository.save(RescueCase.builder()
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
                    .coverPhotoUrl("https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop&q=80")
                    .build());

            // RSC-2026-005 — Brownie (Reported by Pet Owner Kavindu Perera, awaiting officer triage)
            RescueCase brownie = rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-005")
                    .caseNumber("RC-2026-05")
                    .temporaryName("Brownie (Injured Stray)")
                    .species("Dog")
                    .breed("Indie / Sri Lankan Stray")
                    .estimatedAge("1 year")
                    .gender("Male")
                    .rescueLocation("Near Viharamahadevi Park, Library Gate")
                    .intakeDate(LocalDate.of(2026, 8, 15))
                    .conditionSeverity("High")
                    .status("Reported")
                    .isPublishedForAdoption(false)
                    .reportedByUserId("USR-001")
                    .reportedByUserName("Kavindu Perera")
                    .reportedByUserPhone("0771234567")
                    .description("Found limping on left hind leg, sheltering under park bench. Very timid but friendly with treats.")
                    .medicalSummary("Noticeable left rear leg laceration, needs clinical cleaning and x-ray.")
                    .coverPhotoUrl("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80")
                    .build());

            log.info("Seeded 5 rescue cases (including community-reported case).");

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

            rescueProgressLogRepository.save(RescueProgressLog.builder()
                    .logId("RPL-505")
                    .rescueCase(brownie)
                    .caseId("RSC-2026-005")
                    .loggedBy("Kavindu Perera (Pet Owner)")
                    .logDate(LocalDateTime.of(2026, 8, 15, 8, 45, 0))
                    .logType("Community Report")
                    .title("Animal Needing Rescue Reported")
                    .notes("Observed near Viharamahadevi Park with visible rear leg injury. Requires rescue field response.")
                    .build());

            log.info("Seeded 5 rescue progress logs.");

            // ------------------------------------------------------------------
            // Photos — mirrors initialRescuePhotos
            // ------------------------------------------------------------------
            rescuePhotoRepository.save(RescuePhoto.builder()
                    .photoId("RPH-01")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .photoUrl("https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80")
                    .caption("Luna smiling during afternoon foster play session")
                    .uploadedAt(LocalDateTime.of(2026, 7, 28, 10, 30, 0))
                    .tag("Adoption Profile")
                    .build());

            rescuePhotoRepository.save(RescuePhoto.builder()
                    .photoId("RPH-02")
                    .rescueCase(luna)
                    .caseId("RSC-2026-001")
                    .photoUrl("https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80")
                    .caption("Luna on first day of intake rescue")
                    .uploadedAt(LocalDateTime.of(2026, 7, 2, 10, 35, 0))
                    .tag("Intake Evidence")
                    .build());

            rescuePhotoRepository.save(RescuePhoto.builder()
                    .photoId("RPH-03")
                    .rescueCase(oliverPip)
                    .caseId("RSC-2026-002")
                    .photoUrl("https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop&q=80")
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
                    .phone("0773337711")
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
                    .phone("0714448822")
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
        careProviderRepository.findByUser_Id(providerUser.getId())
                .or(() -> careProviderRepository.findByProviderId("PRV-001"))
                .orElseGet(() -> {
                    CareProvider newPrv = CareProvider.builder()
                            .providerId("PRV-001")
                            .user(providerUser)
                            .providerName("Dilshan Bandara")
                            .contactPhone("0779876543")
                            .contactEmail("provider@petnexus.com")
                            .active(true)
                            .build();
                    return careProviderRepository.save(newPrv);
                });

        careProviderRepository.findByUser_Id(eshaniUser.getId())
                .or(() -> careProviderRepository.findByProviderId("USR-016"))
                .orElseGet(() -> {
                    CareProvider eshaniPrv = CareProvider.builder()
                            .providerId("USR-016")
                            .user(eshaniUser)
                            .providerName("Eshani")
                            .contactPhone("0704564985")
                            .contactEmail("eshani@petnexus.com")
                            .active(true)
                            .build();
                    return careProviderRepository.save(eshaniPrv);
                });

        if (careServiceRepository.count() == 0) {
            log.info("Seeding initial Care Services into PetNexus database...");
            careServiceRepository.save(CareService.builder()
                    .serviceId("CSR-001")
                    .name("Deluxe Spa & Hydrotherapy Grooming Plan")
                    .description("Full grooming with hydrobath, coat conditioning, ear cleaning, and paw pad trim")
                    .price(new BigDecimal("15000.00"))
                    .originalValue(new BigDecimal("15000.00"))
                    .discountPercent(0)
                    .badge("Premium Grooming")
                    .tagline("Full spa grooming and hydrotherapy for a healthy, conditioned coat")
                    .recommendedFor("All breeds and coat types")
                    .durationMinutes(90)
                    .status(ServiceStatus.SCHEDULED)
                    .createdBy(providerUser)
                    .build());

            careServiceRepository.save(CareService.builder()
                    .serviceId("CSR-002")
                    .name("De-Shedding & Blowout Treatment")
                    .description("Deep brush out, de-shedding shampoo, and high-velocity blowout")
                    .price(new BigDecimal("8500.00"))
                    .originalValue(new BigDecimal("8500.00"))
                    .discountPercent(0)
                    .badge("Coat Care")
                    .tagline("Deep de-shedding and blowout to keep heavy coats under control")
                    .recommendedFor("Double-coated and heavy-shedding breeds")
                    .durationMinutes(60)
                    .status(ServiceStatus.SCHEDULED)
                    .createdBy(providerUser)
                    .build());

            careServiceRepository.save(CareService.builder()
                    .serviceId("CSR-003")
                    .name("Puppy Spa & Gentle Bath")
                    .description("Tearless shampoo, gentle warm water rinse, light brush, and nail trim")
                    .price(new BigDecimal("5500.00"))
                    .originalValue(new BigDecimal("5500.00"))
                    .discountPercent(0)
                    .badge("Puppy Friendly")
                    .tagline("A gentle first bath and brush for young puppies")
                    .recommendedFor("Puppies under 12 months")
                    .durationMinutes(45)
                    .status(ServiceStatus.SCHEDULED)
                    .createdBy(providerUser)
                    .build());
            log.info("Seeded 3 care services.");
        }

        if (servicePackageBookingRepository.count() == 0) {
            log.info("Seeding initial Service Package Bookings into PetNexus database...");
            // Booking 1: Owned Pet Barnaby (Owner: Kavindu Perera USR-001)
            servicePackageBookingRepository.save(ServicePackageBooking.builder()
                    .bookingId("PKB-101")
                    .ownerId("USR-001")
                    .ownerName("Kavindu Perera")
                    .petId("PET-001")
                    .petName("Barnaby (Golden Retriever)")
                    .packageId("PKG-03")
                    .packageName("Deluxe Spa & Hydrotherapy Grooming Plan")
                    .totalSessions(3)
                    .completedSessions(1)
                    .remainingSessions(2)
                    .purchaseDate(LocalDate.of(2026, 7, 10))
                    .expiryDate(LocalDate.of(2027, 1, 10))
                    .status("Active")
                    .createdAt(LocalDate.of(2026, 7, 10))
                    .build());

            // Booking 2: Owned Cat Cleo (Owner: Kavindu Perera USR-001)
            servicePackageBookingRepository.save(ServicePackageBooking.builder()
                    .bookingId("PKB-102")
                    .ownerId("USR-001")
                    .ownerName("Kavindu Perera")
                    .petId("PET-002")
                    .petName("Cleo (British Shorthair)")
                    .packageId("PKG-03")
                    .packageName("Deluxe Spa & Hydrotherapy Grooming Plan")
                    .totalSessions(2)
                    .completedSessions(0)
                    .remainingSessions(2)
                    .purchaseDate(LocalDate.of(2026, 8, 5))
                    .expiryDate(LocalDate.of(2027, 2, 5))
                    .status("Active")
                    .createdAt(LocalDate.of(2026, 8, 5))
                    .build());
            log.info("Seeded 2 service package bookings.");
        }

        if (careServiceLogRepository.count() == 0) {
            log.info("Seeding initial Care Service Logs into PetNexus database...");
            // Log 1: Completed session on owned pet Barnaby
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-201")
                    .petId("PET-001")
                    .petName("Barnaby (Golden Retriever)")
                    .ownerId("USR-001")
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

            // Log 2: In-Progress session on owned pet Barnaby
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-202")
                    .petId("PET-001")
                    .petName("Barnaby (Golden Retriever)")
                    .ownerId("USR-001")
                    .ownerName("Kavindu Perera")
                    .providerId(providerUser.getUserId())
                    .providerName(providerUser.getFullName())
                    .serviceType("Deluxe Spa Session #2 - De-Shedding & Paw Balming")
                    .serviceDate(LocalDate.of(2026, 8, 15))
                    .status(ServiceStatus.IN_PROGRESS)
                    .intakeCondition("Checked in at 09:00 AM. Excellent spirits, ready for coat thinning.")
                    .servicesPerformed("High-velocity blowout completed. Currently applying soothing paw pad balm.")
                    .notes("Owner requested gentle dremel buffing for nails.")
                    .returnToRescue(false)
                    .createdAt(LocalDate.of(2026, 8, 15))
                    .build());

            // Log 3: Rescued Animal Care & Rehabilitation (Cross-Module: Connects Rescue Case RSC-2026-001 Luna)
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-203")
                    .caseId("RSC-2026-001")
                    .petName("Luna (Rescue Australian Shepherd Mix)")
                    .providerId(providerUser.getUserId())
                    .providerName(providerUser.getFullName())
                    .serviceType("Rescue Rehabilitation Medicated Bath & Desensitization")
                    .serviceDate(LocalDate.of(2026, 7, 26))
                    .status(ServiceStatus.COMPLETED)
                    .intakeCondition("Nervous around water, healing tick bites on torso.")
                    .servicesPerformed("Medicated chlorhexidine wash, slow towel dry, gentle positive-reinforcement brushing.")
                    .notes("Luna became very trusting after 20 minutes. Skin irritation reduced. Cleared to return to foster parent Piumi Senanayake.")
                    .returnToRescue(true)
                    .createdAt(LocalDate.of(2026, 7, 26))
                    .build());

            // Log 4: Rescued Animal Care & Rehabilitation (Cross-Module: Connects Rescue Case RSC-2026-003 Zeus)
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-204")
                    .caseId("RSC-2026-003")
                    .petName("Zeus (Rescue Siberian Husky)")
                    .providerId(providerUser.getUserId())
                    .providerName(providerUser.getFullName())
                    .serviceType("Therapeutic Hydrobath & Undercoat Brush")
                    .serviceDate(LocalDate.of(2026, 8, 14))
                    .status(ServiceStatus.READY_FOR_PICKUP)
                    .intakeCondition("Post-pelvic fracture physical rehab support. Supported with sling.")
                    .servicesPerformed("Warm hydrotherapy muscle soak, light dry-brushing to remove dead undercoat.")
                    .notes("Muscles relaxed noticeably. Animal standing comfortably. Ready for Rescue Officer Shehan Rajapaksha pickup.")
                    .returnToRescue(true)
                    .createdAt(LocalDate.of(2026, 8, 14))
                    .build());

            log.info("Seeded 4 care service logs connecting owned pets and rescue cases.");
        }

        // Ensure any unassigned care service logs for Loki (RSC-2026-005) have Eshani assigned
        careServiceLogRepository.findAll().stream()
                .filter(l -> ("RSC-2026-005".equals(l.getCaseId()) || (l.getPetName() != null && l.getPetName().contains("Loki"))) && l.getProviderId() == null)
                .forEach(l -> {
                    l.setProviderId("USR-016");
                    l.setProviderName("Eshani");
                    careServiceLogRepository.save(l);
                    log.info("Assigned Eshani (USR-016) to Loki's care service log {}", l.getServiceLogId());
                });

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
                    .phone("0112347700")
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
                    .phone("0114568800")
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
                    .phone("0117895500")
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
            }

            // Seed prescription medications and care & grooming supplies if missing
            seedInventoryItemIfMissing("INV-106", "Clavamox / Amoxicillin-Clavulanate 250mg 14ct", "Pharmaceuticals", "PHARM-CLAV-250", "BT-77182", 25, 5, "Boxes", new BigDecimal("3500.00"), new BigDecimal("4800.00"), LocalDate.of(2027, 10, 31), sup01);
            seedInventoryItemIfMissing("INV-107", "Metacam / Meloxicam Oral Suspension 1.5mg/ml 32ml", "Pharmaceuticals", "PHARM-MELOX-32", "BT-66231", 20, 5, "Bottles", new BigDecimal("4200.00"), new BigDecimal("5600.00"), LocalDate.of(2028, 2, 28), sup01);
            seedInventoryItemIfMissing("INV-108", "Prednisolone 5mg Anti-Inflammatory Tablets 100ct", "Pharmaceuticals", "PHARM-PREDN-100", "BT-55104", 30, 5, "Bottles", new BigDecimal("2200.00"), new BigDecimal("3100.00"), LocalDate.of(2027, 8, 15), sup01);
            seedInventoryItemIfMissing("INV-109", "Otomax / Gentamicin-Betamethasone Ear Drops 15g", "Pharmaceuticals", "PHARM-OTOM-15", "BT-44129", 22, 5, "Tubes", new BigDecimal("2800.00"), new BigDecimal("3900.00"), LocalDate.of(2027, 12, 31), sup02);
            seedInventoryItemIfMissing("INV-110", "Chlorhexidine 2% Antiseptic Wound Spray 250ml", "Pharmaceuticals", "PHARM-CHLOR-250", "BT-33291", 18, 5, "Bottles", new BigDecimal("1900.00"), new BigDecimal("2700.00"), LocalDate.of(2028, 5, 30), sup02);

            seedInventoryItemIfMissing("INV-111", "Medicated Chlorhexidine & Ketoconazole Shampoo 500ml", "Care & Grooming Supplies", "GROOM-CHLOR-500", "BT-22190", 25, 5, "Bottles", new BigDecimal("2500.00"), new BigDecimal("3500.00"), LocalDate.of(2027, 9, 30), sup01);
            seedInventoryItemIfMissing("INV-112", "Soothing Oatmeal & Aloe Vera Natural Pet Shampoo 1L", "Care & Grooming Supplies", "GROOM-OATM-1000", "BT-11204", 30, 6, "Bottles", new BigDecimal("3200.00"), new BigDecimal("4500.00"), LocalDate.of(2027, 11, 15), sup02);
            seedInventoryItemIfMissing("INV-113", "De-Shedding & Undercoat Release Rinse Conditioner 1L", "Care & Grooming Supplies", "GROOM-DESHED-1000", "BT-99120", 20, 5, "Bottles", new BigDecimal("3600.00"), new BigDecimal("4900.00"), LocalDate.of(2027, 10, 20), sup02);
            seedInventoryItemIfMissing("INV-114", "Antiseptic Cleansing Ear Flush & Care Solution 250ml", "Care & Grooming Supplies", "GROOM-EAR-250", "BT-88219", 28, 5, "Bottles", new BigDecimal("1800.00"), new BigDecimal("2500.00"), LocalDate.of(2028, 3, 31), sup01);
            seedInventoryItemIfMissing("INV-115", "Organic Herbal Paw Pad & Nose Soothing Balm 100g", "Care & Grooming Supplies", "GROOM-PAW-100", "BT-77312", 35, 8, "Tins", new BigDecimal("1500.00"), new BigDecimal("2200.00"), LocalDate.of(2028, 6, 30), sup02);
            seedInventoryItemIfMissing("INV-116", "Flea & Tick Botanical Medicated Dip Solution 500ml", "Care & Grooming Supplies", "GROOM-FLEA-500", "BT-66418", 24, 5, "Bottles", new BigDecimal("2800.00"), new BigDecimal("3900.00"), LocalDate.of(2027, 12, 15), sup01);
            seedInventoryItemIfMissing("INV-117", "Hypoallergenic Coconut Coat Finishing Spray 250ml", "Care & Grooming Supplies", "GROOM-COCO-250", "BT-55320", 22, 5, "Bottles", new BigDecimal("1900.00"), new BigDecimal("2800.00"), LocalDate.of(2028, 1, 31), sup02);

            log.info("Inventory items verified and seeded for prescriptions and care services.");
        }

        // ------------------------------------------------------------------
        // Phase 9: Feedback & Notifications
        // ------------------------------------------------------------------
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

        // Phase 10: Rich Demonstration Data across all stakeholder modules
        seedDemonstrationData();
    }

    private void seedDemonstrationData() {
        log.info("Verifying and seeding comprehensive demonstration data...");

        User ifaza = userRepository.findByEmail("ifaza@petnexus.com").orElse(null);
        User owner = userRepository.findByEmail("owner@petnexus.com").orElse(null);
        User oshada = userRepository.findByEmail("oshada@petnexus.com").orElse(null);
        User sachini = userRepository.findByEmail("vet@petnexus.com").orElse(null);
        User eshani = userRepository.findByEmail("eshani@petnexus.com").orElse(null);
        User avinash = userRepository.findByEmail("avijeeva6@gmail.com").orElse(null);

        // 1. Pets
        if (ifaza != null) {
            if (petRepository.findByPetId("PET-004").isEmpty()) {
                petRepository.save(Pet.builder()
                        .petId("PET-004")
                        .owner(ifaza)
                        .name("Luna")
                        .species("Cat")
                        .breed("Persian")
                        .gender("Female")
                        .ageYears(2)
                        .ageMonths(3)
                        .dateOfBirth(LocalDate.of(2024, 6, 1))
                        .weightKg(new BigDecimal("3.80"))
                        .microchipId("985141008821455")
                        .allergies("None recorded")
                        .medicalNotes("Indoor cat. Annual vaccinations current. Gentle demeanor.")
                        .imageUrl("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80")
                        .emergencyContact("0789984329")
                        .createdAt(LocalDateTime.of(2026, 9, 13, 18, 0))
                        .build());
            }

            if (petRepository.findByPetId("PET-005").isEmpty()) {
                petRepository.save(Pet.builder()
                        .petId("PET-005")
                        .owner(ifaza)
                        .name("Simba")
                        .species("Dog")
                        .breed("English Cocker Spaniel")
                        .gender("Male")
                        .ageYears(1)
                        .ageMonths(6)
                        .dateOfBirth(LocalDate.of(2025, 2, 10))
                        .weightKg(new BigDecimal("13.50"))
                        .microchipId("985141007733221")
                        .allergies("Beef protein (mild)")
                        .medicalNotes("Active and friendly puppy. Loves swimming and agility fetch.")
                        .imageUrl("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80")
                        .emergencyContact("0789984329")
                        .createdAt(LocalDateTime.of(2026, 9, 15, 9, 0))
                        .build());
            }
        }

        if (owner != null && petRepository.findByPetId("PET-006").isEmpty()) {
            petRepository.save(Pet.builder()
                    .petId("PET-006")
                    .owner(owner)
                    .name("Rocky")
                    .species("Dog")
                    .breed("German Shepherd")
                    .gender("Male")
                    .ageYears(4)
                    .ageMonths(2)
                    .dateOfBirth(LocalDate.of(2022, 8, 15))
                    .weightKg(new BigDecimal("34.00"))
                    .microchipId("985141006622119")
                    .allergies("None recorded")
                    .medicalNotes("Trained family and protection dog. Active daily exercise regimen.")
                    .imageUrl("https://images.unsplash.com/photo-1589941013453-ec89f33b5455?w=500&auto=format&fit=crop&q=80")
                    .emergencyContact("Thilini Perera (Spouse) - 0772349988")
                    .createdAt(LocalDateTime.of(2026, 1, 20, 11, 0))
                    .build());
        }

        // 2. Vaccinations
        Pet simba = petRepository.findByPetId("PET-005").orElse(null);
        Pet ifazaLuna = petRepository.findByPetId("PET-004").orElse(null);
        if (simba != null) {
            if (vaccinationRepository.findByVaccineId("VAC-006").isEmpty()) {
                vaccinationRepository.save(Vaccination.builder()
                        .vaccineId("VAC-006")
                        .pet(simba)
                        .petName("Simba")
                        .vaccineName("DHPP Canine Core Vaccine")
                        .batchNumber("DH-2026-8819")
                        .administeredDate(LocalDate.of(2026, 6, 10))
                        .nextDueDate(LocalDate.of(2027, 6, 10))
                        .administeredBy("Dr. Oshada")
                        .status("Up-to-Date")
                        .build());
            }
            if (vaccinationRepository.findByVaccineId("VAC-007").isEmpty()) {
                vaccinationRepository.save(Vaccination.builder()
                        .vaccineId("VAC-007")
                        .pet(simba)
                        .petName("Simba")
                        .vaccineName("Rabies 1-Year Canine")
                        .batchNumber("RB-2026-1122")
                        .administeredDate(LocalDate.of(2026, 6, 10))
                        .nextDueDate(LocalDate.of(2027, 6, 10))
                        .administeredBy("Dr. Oshada")
                        .status("Up-to-Date")
                        .build());
            }
        }
        if (ifazaLuna != null && vaccinationRepository.findByVaccineId("VAC-008").isEmpty()) {
            vaccinationRepository.save(Vaccination.builder()
                    .vaccineId("VAC-008")
                    .pet(ifazaLuna)
                    .petName("Luna")
                    .vaccineName("FVRCP Feline Core Vaccine")
                    .batchNumber("FV-2026-5510")
                    .administeredDate(LocalDate.of(2026, 5, 15))
                    .nextDueDate(LocalDate.of(2027, 5, 15))
                    .administeredBy("Dr. Oshada")
                    .status("Up-to-Date")
                    .build());
        }

        // 3. Appointments
        if (simba != null && ifaza != null && appointmentRepository.findByAppointmentId("APT-1005").isEmpty()) {
            appointmentRepository.save(Appointment.builder()
                    .appointmentId("APT-1005")
                    .pet(simba)
                    .petId(simba.getPetId())
                    .petName(simba.getName())
                    .species(simba.getSpecies())
                    .breed(simba.getBreed())
                    .owner(ifaza)
                    .ownerId(ifaza.getUserId())
                    .ownerName(ifaza.getFullName())
                    .ownerPhone(ifaza.getPhone())
                    .veterinarian(oshada)
                    .vetId(oshada != null ? oshada.getUserId() : "USR-014")
                    .vetName("Dr. Oshada")
                    .serviceType("Routine Wellness & Ear Examination")
                    .appointmentDate(LocalDate.of(2026, 8, 20))
                    .timeSlot("10:00 AM")
                    .status(AppointmentStatus.Completed)
                    .tokenNumber("A-04")
                    .reason("Routine checkup and slight head shaking after lake swimming.")
                    .symptoms("Right ear slightly erythematous, clear otoscopy.")
                    .notes("Surolan ear drops prescribed for 7 days.")
                    .createdAt(LocalDateTime.of(2026, 8, 16, 10, 0))
                    .build());
        }

        if (ifazaLuna != null && ifaza != null && appointmentRepository.findByAppointmentId("APT-1006").isEmpty()) {
            appointmentRepository.save(Appointment.builder()
                    .appointmentId("APT-1006")
                    .pet(ifazaLuna)
                    .petId(ifazaLuna.getPetId())
                    .petName(ifazaLuna.getName())
                    .species(ifazaLuna.getSpecies())
                    .breed(ifazaLuna.getBreed())
                    .owner(ifaza)
                    .ownerId(ifaza.getUserId())
                    .ownerName(ifaza.getFullName())
                    .ownerPhone(ifaza.getPhone())
                    .veterinarian(oshada)
                    .vetId(oshada != null ? oshada.getUserId() : "USR-014")
                    .vetName("Dr. Oshada")
                    .serviceType("Feline Dental & Wellness Assessment")
                    .appointmentDate(LocalDate.of(2026, 8, 22))
                    .timeSlot("11:30 AM")
                    .status(AppointmentStatus.CheckedIn)
                    .tokenNumber("A-05")
                    .reason("Persian coat assessment and annual wellness evaluation.")
                    .symptoms("Mild occasional hairballs, good appetite.")
                    .notes("Checked in by Lakdin at clinic front desk.")
                    .createdAt(LocalDateTime.of(2026, 8, 18, 14, 30))
                    .build());
        }

        Pet rocky = petRepository.findByPetId("PET-006").orElse(null);
        if (rocky != null && owner != null && appointmentRepository.findByAppointmentId("APT-1007").isEmpty()) {
            appointmentRepository.save(Appointment.builder()
                    .appointmentId("APT-1007")
                    .pet(rocky)
                    .petId(rocky.getPetId())
                    .petName(rocky.getName())
                    .species(rocky.getSpecies())
                    .breed(rocky.getBreed())
                    .owner(owner)
                    .ownerId(owner.getUserId())
                    .ownerName(owner.getFullName())
                    .ownerPhone(owner.getPhone())
                    .veterinarian(sachini)
                    .vetId(sachini != null ? sachini.getUserId() : "USR-002")
                    .vetName("Dr. Sachini Wijesinghe, BVSc")
                    .serviceType("Orthopedic & Joint Evaluation")
                    .appointmentDate(LocalDate.of(2026, 8, 25))
                    .timeSlot("02:00 PM")
                    .status(AppointmentStatus.Confirmed)
                    .tokenNumber("A-06")
                    .reason("Routine mobility assessment and joint supplement consultation.")
                    .symptoms("Active, no visible stiffness.")
                    .notes("Confirmed by reception. Pre-consultation form submitted.")
                    .createdAt(LocalDateTime.of(2026, 8, 19, 9, 15))
                    .build());
        }

        // 4. Consultation & Prescription for Simba
        Appointment apt1005 = appointmentRepository.findByAppointmentId("APT-1005").orElse(null);
        if (simba != null && consultationRepository.findByConsultationId("CNS-2026-02").isEmpty()) {
            Consultation c2 = Consultation.builder()
                    .consultationId("CNS-2026-02")
                    .appointment(apt1005)
                    .appointmentId("APT-1005")
                    .pet(simba)
                    .petId(simba.getPetId())
                    .petName(simba.getName())
                    .veterinarian(oshada)
                    .vetId(oshada != null ? oshada.getUserId() : "USR-014")
                    .vetName("Dr. Oshada")
                    .consultationDate(LocalDateTime.of(2026, 8, 20, 10, 15))
                    .temperatureC(new BigDecimal("38.6"))
                    .heartRateBpm(92)
                    .respiratoryRateBpm(24)
                    .weightKg(new BigDecimal("13.50"))
                    .subjectiveNotes("Owner noticed Simba shaking head occasionally after swimming.")
                    .objectiveFindings("Erythema and mild ceruminous discharge in right ear canal. Tympanic membrane intact.")
                    .assessmentDiagnosis("Acute Otitis Externa (mild, environmental moisture related)")
                    .treatmentPlan("Ear flush daily and Surolan Otic drops 4 drops twice daily for 7 days.")
                    .followUpDate(LocalDate.of(2026, 9, 1))
                    .status("Completed")
                    .build();
            consultationRepository.save(c2);

            if (prescriptionRepository.findByPrescriptionId("RX-2026-002").isEmpty()) {
                Prescription rx2 = Prescription.builder()
                        .prescriptionId("RX-2026-002")
                        .consultation(c2)
                        .consultationId("CNS-2026-02")
                        .pet(simba)
                        .petId(simba.getPetId())
                        .petName(simba.getName())
                        .ownerName("Ifaza Dilshad")
                        .veterinarian(oshada)
                        .vetId(oshada != null ? oshada.getUserId() : "USR-014")
                        .vetName("Dr. Oshada")
                        .vetLicense("VET-NY-765")
                        .issueDate(LocalDate.of(2026, 8, 20))
                        .validUntil(LocalDate.of(2026, 9, 20))
                        .status("Active")
                        .instructions("Clean ear with gentle flush before applying drops. Complete 7 day course.")
                        .digitalSignature("Dr. Oshada [Verified Electronic Signature]")
                        .build();

                PrescriptionItem rxi3 = PrescriptionItem.builder()
                        .itemId("RXI-03")
                        .prescription(rx2)
                        .prescriptionId("RX-2026-002")
                        .medicationName("Surolan Otic Ear Drops 15ml")
                        .dosage("4 drops into affected ear")
                        .frequency("Twice Daily (q12h)")
                        .durationDays(7)
                        .quantityPrescribed(1)
                        .refillsAllowed(1)
                        .build();

                PrescriptionItem rxi4 = PrescriptionItem.builder()
                        .itemId("RXI-04")
                        .prescription(rx2)
                        .prescriptionId("RX-2026-002")
                        .medicationName("Gentle Aloe Vera Ear Cleansing Flush 200ml")
                        .dosage("5ml rinse prior to medication")
                        .frequency("Once Daily")
                        .durationDays(7)
                        .quantityPrescribed(1)
                        .refillsAllowed(0)
                        .build();

                rx2.setItems(List.of(rxi3, rxi4));
                prescriptionRepository.save(rx2);
            }
        }

        // 5. Rescue Cases
        String avinashName = avinash != null ? avinash.getFullName() + " (Rescue Officer)" : "Avinash (Rescue Officer)";

        if (rescueCaseRepository.findByCaseId("RSC-2026-006").isEmpty()) {
            rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-006")
                    .caseNumber("RC-2026-06")
                    .temporaryName("Koko & Bella (Calico Kittens)")
                    .species("Cat")
                    .breed("Domestic Short Hair (Calico)")
                    .estimatedAge("4 months")
                    .gender("Female Pair")
                    .rescueLocation("Found sheltering in crate near Colombo Port, Fort")
                    .intakeDate(LocalDate.of(2026, 8, 5))
                    .conditionSeverity("Low")
                    .status("ReadyForAdoption")
                    .isPublishedForAdoption(true)
                    .microchipId("985141009918223")
                    .intakeOfficer(avinashName)
                    .description("Energetic, purring bonded sisters who love feather wands and napping together.")
                    .medicalSummary("Vaccinated, dewormed, negative for FIV/FeLV, spayed.")
                    .coverPhotoUrl("https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80")
                    .build());
        }

        if (rescueCaseRepository.findByCaseId("RSC-2026-007").isEmpty()) {
            rescueCaseRepository.save(RescueCase.builder()
                    .caseId("RSC-2026-007")
                    .caseNumber("RC-2026-07")
                    .temporaryName("Cooper")
                    .species("Dog")
                    .breed("Labrador Retriever Mix")
                    .estimatedAge("2 years")
                    .gender("Male")
                    .rescueLocation("Rescued from canal embankment during flash flood, Wellawatte")
                    .intakeDate(LocalDate.of(2026, 8, 8))
                    .conditionSeverity("Moderate")
                    .status("InFoster")
                    .isPublishedForAdoption(true)
                    .microchipId("985141003344556")
                    .intakeOfficer(avinashName)
                    .description("Gentle, house-trained golden-brown mix who loves tennis balls and children.")
                    .medicalSummary("Fully vaccinated, treated for ear infection, neutered.")
                    .coverPhotoUrl("https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80")
                    .fosterParentId("FST-001")
                    .fosterParentName("Piumi Senanayake")
                    .build());
        }

        // 6. Care Service Logs for Eshani
        String eshaniId = eshani != null ? eshani.getUserId() : "USR-016";
        String eshaniName = eshani != null ? eshani.getFullName() : "Eshani";

        if (careServiceLogRepository.findByServiceLogId("CSL-0009").isEmpty()) {
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-0009")
                    .petId("PET-005")
                    .petName("Simba (English Cocker Spaniel)")
                    .ownerId("USR-013")
                    .ownerName("Ifaza Dilshad")
                    .providerId(eshaniId)
                    .providerName(eshaniName)
                    .serviceType("Full Breed Haircut & Style")
                    .serviceDate(LocalDate.of(2026, 8, 18))
                    .status(ServiceStatus.COMPLETED)
                    .intakeCondition("Cocker spaniel coat wavy and healthy. Playful, wagging tail.")
                    .servicesPerformed("Warm colloidal oatmeal bath, ear feathering trim, sanitary clip, paw balm.")
                    .notes("Simba stood patiently throughout styling. Coat is super soft and feathering is styled perfectly.")
                    .returnToRescue(false)
                    .createdAt(LocalDate.of(2026, 8, 18))
                    .build());
        }

        if (careServiceLogRepository.findByServiceLogId("CSL-0010").isEmpty()) {
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-0010")
                    .petId("PET-004")
                    .petName("Luna (Persian Cat)")
                    .ownerId("USR-013")
                    .ownerName("Ifaza Dilshad")
                    .providerId(eshaniId)
                    .providerName(eshaniName)
                    .serviceType("Deluxe Spa & Grooming Session")
                    .serviceDate(LocalDate.of(2026, 8, 21))
                    .status(ServiceStatus.IN_PROGRESS)
                    .intakeCondition("Persian coat in good condition, slight undercoat knots around collar.")
                    .servicesPerformed("Gentle undercoat rake, tear-stain cleansing, currently relaxing in warm drying cabin.")
                    .notes("Very gentle and purring. Finished grooming planned with hypoallergenic leave-in mist.")
                    .returnToRescue(false)
                    .createdAt(LocalDate.of(2026, 8, 21))
                    .build());
        }

        if (careServiceLogRepository.findByServiceLogId("CSL-0011").isEmpty()) {
            careServiceLogRepository.save(CareServiceLog.builder()
                    .serviceLogId("CSL-0011")
                    .caseId("RSC-2026-005")
                    .petName("Brownie (Injured Stray)")
                    .providerId(eshaniId)
                    .providerName(eshaniName)
                    .serviceType("Rehabilitation & Foster Care Intake")
                    .serviceDate(LocalDate.of(2026, 8, 20))
                    .status(ServiceStatus.READY_FOR_PICKUP)
                    .intakeCondition("Post-treatment clean wound, calm and trusting with caregiver.")
                    .servicesPerformed("Antiseptic chlorhexidine bath, soft towel dry, tick dip treatment.")
                    .notes("Companion is completely clean and happy. Ready for Rescue Officer Avinash handoff to foster care.")
                    .returnToRescue(true)
                    .createdAt(LocalDate.of(2026, 8, 20))
                    .build());
        }

        // 7. Feedback Reviews
        if (ifaza != null) {
            if (feedbackRepository.findByFeedbackId("FDB-003").isEmpty()) {
                feedbackRepository.save(Feedback.builder()
                        .feedbackId("FDB-003")
                        .user(ifaza)
                        .userName("Ifaza Dilshad")
                        .serviceCategory("Veterinary Consultation")
                        .rating(5)
                        .title("Dr. Oshada was so gentle and attentive with Simba")
                        .comments("Simba's ear irritation cleared up within 2 days after Dr. Oshada prescribed the ear flush and Surolan drops. Dr. Oshada explained everything with great care!")
                        .staffMentioned("Dr. Oshada")
                        .managerResponse("Thank you Ifaza! Dr. Oshada is dedicated to compassionate clinical care.")
                        .managerRespondedAt(LocalDateTime.of(2026, 8, 23, 9, 0))
                        .createdAt(LocalDateTime.of(2026, 8, 22, 15, 0))
                        .build());
            }

            if (feedbackRepository.findByFeedbackId("FDB-004").isEmpty()) {
                feedbackRepository.save(Feedback.builder()
                        .feedbackId("FDB-004")
                        .user(ifaza)
                        .userName("Ifaza Dilshad")
                        .serviceCategory("Grooming & Spa")
                        .rating(5)
                        .title("Eshani does magic with Persian cats!")
                        .comments("Grooming Persian cats is always stressful, but Eshani made Luna so comfortable and relaxed. Her coat looks silky and magnificent!")
                        .staffMentioned("Eshani")
                        .managerResponse("We are delighted to hear Luna loved her spa day with Eshani! Thank you for your wonderful review.")
                        .managerRespondedAt(LocalDateTime.of(2026, 8, 24, 10, 15))
                        .createdAt(LocalDateTime.of(2026, 8, 23, 16, 45))
                        .build());
            }
        }

        log.info("Comprehensive demonstration data verification complete.");
    }

    private void seedInventoryItemIfMissing(String itemId, String name, String category, String sku,
                                           String batchNumber, int currentStock, int minThreshold,
                                           String unit, BigDecimal unitPrice, BigDecimal sellingPrice,
                                           LocalDate expiryDate, Supplier supplier) {
        if (!inventoryItemRepository.existsBySku(sku) && inventoryItemRepository.findByItemId(itemId).isEmpty()) {
            StockStatus status = currentStock <= 0 ? StockStatus.OUT_OF_STOCK :
                    (currentStock <= minThreshold ? StockStatus.LOW_STOCK : StockStatus.IN_STOCK);
            inventoryItemRepository.save(InventoryItem.builder()
                    .itemId(itemId)
                    .name(name)
                    .category(category)
                    .sku(sku)
                    .batchNumber(batchNumber)
                    .currentStock(currentStock)
                    .minStockThreshold(minThreshold)
                    .unit(unit)
                    .unitPrice(unitPrice)
                    .sellingPrice(sellingPrice)
                    .expiryDate(expiryDate)
                    .supplier(supplier)
                    .supplierName(supplier != null ? supplier.getCompanyName() : null)
                    .status(status)
                    .build());
        }
    }
}
