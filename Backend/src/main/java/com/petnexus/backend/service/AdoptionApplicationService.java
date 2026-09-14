package com.petnexus.backend.service;

import com.petnexus.backend.dto.AdoptionApplicationDto;
import com.petnexus.backend.dto.CreateApplicationRequest;
import com.petnexus.backend.dto.ReviewApplicationRequest;
import com.petnexus.backend.entity.AdoptionApplication;
import com.petnexus.backend.entity.RescueCase;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.AdoptionApplicationStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.AdoptionApplicationRepository;
import com.petnexus.backend.repository.RescueCaseRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdoptionApplicationService {

    private final AdoptionApplicationRepository applicationRepository;
    private final RescueCaseRepository rescueCaseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdoptionApplicationDto> getApplications(String caseId, String applicantId) {
        User current = SecurityUtils.getCurrentUser();
        String effectiveApplicantId = applicantId;

        if (current != null && current.getRole() == UserRole.PetOwner) {
            effectiveApplicantId = current.getUserId();
        } else if (effectiveApplicantId != null && !effectiveApplicantId.isBlank()) {
            SecurityUtils.enforceOwnershipOrRole(effectiveApplicantId, UserRole.Admin, UserRole.RescueOfficer);
        }

        List<AdoptionApplication> list;
        if (effectiveApplicantId != null && !effectiveApplicantId.isBlank()) {
            list = applicationRepository.findByApplicant_UserId(effectiveApplicantId.trim());
        } else if (caseId != null && !caseId.isBlank()) {
            list = applicationRepository.findByRescueCase_CaseId(caseId.trim());
        } else {
            list = applicationRepository.findAll();
        }

        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdoptionApplicationDto getApplicationById(String applicationId) {
        AdoptionApplication app = applicationRepository.findByApplicationId(applicationId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Adoption application not found: " + applicationId));

        if (app.getApplicant() != null) {
            SecurityUtils.enforceOwnershipOrRole(app.getApplicant().getUserId(), UserRole.Admin, UserRole.RescueOfficer);
        }

        return toDto(app);
    }

    @Transactional
    public AdoptionApplicationDto submitApplication(CreateApplicationRequest request) {
        if (request.getCaseId() == null || request.getCaseId().isBlank()) {
            throw new BadRequestException("Rescue case ID is required.");
        }

        RescueCase rescueCase = rescueCaseRepository.findByCaseId(request.getCaseId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Rescue case not found: " + request.getCaseId()));

        if (!"ReadyForAdoption".equals(rescueCase.getStatus())) {
            throw new BadRequestException("Rescue case is not ready for adoption.");
        }

        User current = SecurityUtils.getCurrentUser();
        String applicantId = (current != null && current.getRole() == UserRole.PetOwner)
                ? current.getUserId()
                : (request.getApplicantId() != null ? request.getApplicantId().trim() : null);

        if (applicantId == null || applicantId.isBlank()) {
            throw new BadRequestException("Applicant ID is required.");
        }

        User applicant = userRepository.findByUserId(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant user not found: " + applicantId));

        long count = applicationRepository.count() + 1;
        String applicationId = String.format("APP-%04d", count);

        String petName = (request.getPetName() != null && !request.getPetName().isBlank())
                ? request.getPetName().trim() : rescueCase.getTemporaryName();
        String applicantName = (request.getApplicantName() != null && !request.getApplicantName().isBlank())
                ? request.getApplicantName().trim() : applicant.getFullName();
        String applicantPhone = (request.getApplicantPhone() != null && !request.getApplicantPhone().isBlank())
                ? request.getApplicantPhone().trim() : (applicant.getPhone() != null ? applicant.getPhone() : "N/A");

        AdoptionApplication application = new AdoptionApplication();
        application.setApplicationId(applicationId);
        application.setRescueCase(rescueCase);
        application.setApplicant(applicant);
        application.setPetName(petName);
        application.setApplicantName(applicantName);
        application.setApplicantPhone(applicantPhone);
        application.setStatus(AdoptionApplicationStatus.SUBMITTED);
        application.setCreatedAt(LocalDateTime.now());

        AdoptionApplication saved = applicationRepository.save(application);
        log.info("Adoption application {} submitted by {} for case {}", applicationId, applicantId, rescueCase.getCaseId());
        return toDto(saved);
    }

    @Transactional
    public AdoptionApplicationDto reviewApplication(String applicationId, ReviewApplicationRequest request) {
        SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.RescueOfficer);

        AdoptionApplication app = applicationRepository.findByApplicationId(applicationId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Adoption application not found: " + applicationId));

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            throw new BadRequestException("Status is required for application review.");
        }

        AdoptionApplicationStatus status;
        try {
            // fromJson accepts the value the frontend sends as well as the constant name.
            status = AdoptionApplicationStatus.fromJson(request.getStatus().trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid application status: " + request.getStatus());
        }

        User current = SecurityUtils.getCurrentUser();
        app.setStatus(status);
        app.setReviewNotes(request.getReviewNotes());
        app.setReviewedBy(current);
        app.setReviewedAt(LocalDateTime.now());

        if (status == AdoptionApplicationStatus.APPROVED) {
            RescueCase rc = app.getRescueCase();
            if (rc != null) {
                rc.setStatus("Adopted");
                rc.setIsPublishedForAdoption(false);
                rescueCaseRepository.save(rc);
                log.info("Rescue case {} marked Adopted following approval of application {}", rc.getCaseId(), applicationId);
            }
        }

        AdoptionApplication saved = applicationRepository.save(app);
        return toDto(saved);
    }

    private AdoptionApplicationDto toDto(AdoptionApplication app) {
        return new AdoptionApplicationDto(
                app.getApplicationId(),
                app.getRescueCase() != null ? app.getRescueCase().getCaseId() : null,
                app.getApplicant() != null ? app.getApplicant().getUserId() : null,
                app.getPetName(),
                app.getApplicantName(),
                app.getApplicantPhone(),
                app.getStatus() != null ? app.getStatus().name() : null,
                app.getReviewNotes(),
                app.getReviewedBy() != null ? app.getReviewedBy().getUserId() : null,
                app.getCreatedAt(),
                app.getReviewedAt()
        );
    }
}
