package com.petnexus.backend.config;

import com.petnexus.backend.entity.FosterRecord;
import com.petnexus.backend.entity.RescueCase;
import com.petnexus.backend.entity.RescuePhoto;
import com.petnexus.backend.entity.RescueProgressLog;
import com.petnexus.backend.repository.FosterRecordRepository;
import com.petnexus.backend.repository.RescueCaseRepository;
import com.petnexus.backend.repository.RescuePhotoRepository;
import com.petnexus.backend.repository.RescueProgressLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Seeds the rescue cases together with their progress logs, photos and foster records (M3).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RescueSeeder {

    private final RescueCaseRepository rescueCaseRepository;
    private final RescueProgressLogRepository rescueProgressLogRepository;
    private final RescuePhotoRepository rescuePhotoRepository;
    private final FosterRecordRepository fosterRecordRepository;

    public void seed() {
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
    }
}
