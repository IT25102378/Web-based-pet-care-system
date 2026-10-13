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
    private final com.petnexus.backend.repository.AdoptionListingRepository adoptionListingRepository;
    private final com.petnexus.backend.repository.AdoptionApplicationDocumentRepository documentRepository;
    private final NotificationService notificationService;


    @Transactional(readOnly = true)
    public List<AdoptionApplicationDto> getApplications(String caseId, String applicantId) {
        User current = SecurityUtils.getCurrentUser();
        String effectiveApplicantId = applicantId;

        if (current != null && current.getRole() != UserRole.Admin && current.getRole() != UserRole.RescueOfficer) {
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

        if (!"ReadyForAdoption".equals(rescueCase.getStatus()) && !"ReadyForFoster".equals(rescueCase.getStatus()) && !"InFoster".equals(rescueCase.getStatus())) {
            throw new BadRequestException("Rescue case is not ready for adoption or foster.");
        }

        User current = SecurityUtils.getCurrentUser();
        String applicantId;
        if (current != null) {
            applicantId = ((current.getRole() == UserRole.Admin || current.getRole() == UserRole.RescueOfficer)
                    && request.getApplicantId() != null && !request.getApplicantId().isBlank())
                    ? request.getApplicantId().trim()
                    : current.getUserId();
        } else {
            applicantId = (request.getApplicantId() != null ? request.getApplicantId().trim() : null);
        }

        if (applicantId == null || applicantId.isBlank()) {
            throw new BadRequestException("Applicant ID is required.");
        }

        User applicant = userRepository.findByUserId(applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant user not found: " + applicantId));

        // One open application per applicant per case
        if (applicationRepository.existsByRescueCase_CaseIdAndApplicant_UserIdAndStatusIn(
                rescueCase.getCaseId(), applicant.getUserId(),
                List.of(AdoptionApplicationStatus.SUBMITTED, AdoptionApplicationStatus.UNDER_REVIEW))) {
            throw new BadRequestException("You already have an open application for this animal.");
        }

        validateApplicationDetails(request);

        long count = applicationRepository.count() + 1;
        String applicationId = String.format("APP-%04d", count);
        while (applicationRepository.existsById(applicationId)) {
            count++;
            applicationId = String.format("APP-%04d", count);
        }

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
        application.setApplicationType(request.getApplicationType() != null ? request.getApplicationType() : "Adoption");
        application.setStatus(AdoptionApplicationStatus.SUBMITTED);
        application.setCreatedAt(LocalDateTime.now());

        AdoptionApplication saved = applicationRepository.save(application);

        // Process Documents
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            for (java.util.Map<String, Object> docMap : request.getDocuments()) {
                String fileName = (String) docMap.get("fileName");
                String fileUrl = (String) docMap.get("fileUrl");
                if (fileName != null && fileUrl != null) {
                    com.petnexus.backend.entity.AdoptionApplicationDocument doc = new com.petnexus.backend.entity.AdoptionApplicationDocument();
                    doc.setApplication(saved);
                    doc.setDocumentType(docMap.containsKey("documentType") ? (String) docMap.get("documentType") : "General");
                    doc.setFileName(fileName);
                    doc.setFileUrl(fileUrl);
                    doc.setFileSize(docMap.containsKey("fileSize") ? String.valueOf(docMap.get("fileSize")) : null);
                    doc.setStatus("Pending");
                    documentRepository.save(doc);
                }
            }
        }

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
            status = AdoptionApplicationStatus.fromString(request.getStatus().trim());
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
                if ("Foster".equalsIgnoreCase(app.getApplicationType())) {
                    rc.setStatus("InFoster");
                    rc.setIsPublishedForAdoption(false);

                    // No longer creating a global FosterRecord, just update the RescueCase
                    rc.setFosterParentId(app.getApplicant() != null ? app.getApplicant().getUserId() : null);
                    rc.setFosterParentName(app.getApplicantName());

                } else {
                    rc.setStatus("Adopted");
                    rc.setIsPublishedForAdoption(false);
                }
                rescueCaseRepository.save(rc);
                log.info("Rescue case {} marked {} following approval of application {}", rc.getCaseId(), rc.getStatus(), applicationId);

                // Unpublish corresponding adoption listing in database
                adoptionListingRepository.findByRescueCase_CaseId(rc.getCaseId())
                        .ifPresent(listing -> {
                            listing.setPublishedForAdoption(false);
                            listing.setUpdatedAt(LocalDateTime.now());
                            adoptionListingRepository.save(listing);
                            log.info("Adoption listing for case {} set to unpublished in database", rc.getCaseId());
                        });
            }
        }

        AdoptionApplication saved = applicationRepository.save(app);
        notificationService.notifyAdoptionStatus(saved, saved.getStatus().getValue());
        return toDto(saved);
    }

    private static final long MAX_DOCUMENT_BYTES = 10L * 1024 * 1024;
    private static final java.util.regex.Pattern DOCUMENT_FILE_NAME =
            java.util.regex.Pattern.compile("(?i).+\\.(jpe?g|png|webp|pdf)$");
    private static final java.util.regex.Pattern DOCUMENT_SIZE =
            java.util.regex.Pattern.compile("(?i)^\\s*(\\d+(?:\\.\\d+)?)\\s*(B|KB|MB|GB)?\\s*$");

    /** Mirrors the adoption wizard rules so the API cannot be used to skip them. */
    private void validateApplicationDetails(CreateApplicationRequest request) {
        List<String> missing = new java.util.ArrayList<>();
        if (isBlank(request.getApplicantEmail()))   missing.add("applicantEmail");
        if (isBlank(request.getApplicantAddress())) missing.add("applicantAddress");
        if (!missing.isEmpty()) {
            throw new BadRequestException("Required fields missing: " + String.join(", ", missing));
        }

        String reason = request.getReasonForAdoption() == null ? "" : request.getReasonForAdoption().trim();
        if (reason.length() < 20) {
            throw new BadRequestException("Reason for adoption must be at least 20 characters.");
        }
        if (request.getApplicantAddress().trim().length() < 5) {
            throw new BadRequestException("Address must be at least 5 characters.");
        }
        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new BadRequestException("The adoption terms must be accepted.");
        }

        boolean hasId = false;
        boolean hasResidence = false;
        List<java.util.Map<String, Object>> docs = request.getDocuments();
        if (docs != null) {
            for (java.util.Map<String, Object> doc : docs) {
                String fileName = doc.get("fileName") == null ? null : String.valueOf(doc.get("fileName")).trim();
                String fileUrl  = doc.get("fileUrl")  == null ? null : String.valueOf(doc.get("fileUrl")).trim();
                if (isBlank(fileName) || isBlank(fileUrl)) {
                    throw new BadRequestException("Each document needs a file name and file URL.");
                }
                if (!DOCUMENT_FILE_NAME.matcher(fileName).matches()) {
                    throw new BadRequestException("Document '" + fileName + "' must be a JPG, PNG, WEBP or PDF file.");
                }
                if (doc.get("fileSize") != null && documentBytes(String.valueOf(doc.get("fileSize"))) > MAX_DOCUMENT_BYTES) {
                    throw new BadRequestException("Document '" + fileName + "' exceeds the 10MB limit.");
                }
                String type = doc.get("documentType") == null ? "" : String.valueOf(doc.get("documentType")).toLowerCase();
                if (type.contains("photo id") || type.contains("government")) hasId = true;
                if (type.contains("residence") || type.contains("lease")) hasResidence = true;
            }
        }
        if (!hasId)        throw new BadRequestException("Government ID proof is required.");
        if (!hasResidence) throw new BadRequestException("Proof of residence or lease document is required.");
    }

    /** Parses "1.8 MB", "512 KB" or a plain byte count; unparseable values are treated as 0. */
    private long documentBytes(String raw) {
        java.util.regex.Matcher m = DOCUMENT_SIZE.matcher(raw);
        if (!m.matches()) return 0;
        double value = Double.parseDouble(m.group(1));
        String unit = m.group(2) == null ? "B" : m.group(2).toUpperCase();
        switch (unit) {
            case "KB": return (long) (value * 1024);
            case "MB": return (long) (value * 1024 * 1024);
            case "GB": return (long) (value * 1024 * 1024 * 1024);
            default:   return (long) value;
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private AdoptionApplicationDto toDto(AdoptionApplication app) {
        return new AdoptionApplicationDto(
                app.getApplicationId(),
                app.getRescueCase() != null ? app.getRescueCase().getCaseId() : null,
                app.getApplicant() != null ? app.getApplicant().getUserId() : null,
                app.getApplicationType(),
                app.getPetName(),
                app.getApplicantName(),
                app.getApplicantPhone(),
                app.getStatus() != null ? app.getStatus().getValue() : null,
                app.getReviewNotes(),
                app.getReviewedBy() != null ? app.getReviewedBy().getUserId() : null,
                app.getCreatedAt(),
                app.getReviewedAt()
        );
    }
}
