package com.petnexus.backend.config;

import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.PetDocument;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.entity.Vaccination;
import com.petnexus.backend.repository.PetDocumentRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the demo pets, their vaccination records and their uploaded documents (M1).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PetSeeder {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PetDocumentRepository petDocumentRepository;

    public void seed() {
        User owner = userRepository.findByEmail("owner@petnexus.com")
                .orElseThrow(() -> new IllegalStateException(
                        "Pet owner account is missing. UserSeeder must run before this seeder."));

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
    }
}
