package com.petnexus.backend.service;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.RescueCase;
import com.petnexus.backend.entity.RescuePhoto;
import com.petnexus.backend.entity.RescueProgressLog;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.RescueCaseRepository;
import com.petnexus.backend.repository.RescuePhotoRepository;
import com.petnexus.backend.repository.RescueProgressLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RescueCaseService — business logic for rescue case lifecycle.
 * Enforces the rescue state machine on every status transition.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RescueCaseService {

    private final RescueCaseRepository rescueCaseRepository;
    private final RescueProgressLogRepository logRepository;
    private final RescuePhotoRepository photoRepository;

    // -----------------------------------------------------------------------
    // State Machine
    // Mirrors ALLOWED_TRANSITIONS in rescueApi.js
    // -----------------------------------------------------------------------

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = new HashMap<>();

    static {
        ALLOWED_TRANSITIONS.put("Intake",            new HashSet<>(Arrays.asList("InTreatment", "Closed")));
        ALLOWED_TRANSITIONS.put("InTreatment",       new HashSet<>(Arrays.asList("ReadyForFoster", "Closed")));
        ALLOWED_TRANSITIONS.put("ReadyForFoster",    new HashSet<>(Arrays.asList("InFoster", "Closed")));
        ALLOWED_TRANSITIONS.put("InFoster",          new HashSet<>(Arrays.asList("ReadyForAdoption", "Closed")));
        ALLOWED_TRANSITIONS.put("ReadyForAdoption",  new HashSet<>(Arrays.asList("Adopted", "InFoster", "Closed")));
        ALLOWED_TRANSITIONS.put("Adopted",           new HashSet<>(Collections.singletonList("Closed")));
        ALLOWED_TRANSITIONS.put("Closed",            Collections.emptySet());
    }

    private static final Map<String, String> STATUS_LABELS = new HashMap<>();

    static {
        STATUS_LABELS.put("Intake",            "Intake Assessment");
        STATUS_LABELS.put("InTreatment",       "In Medical Treatment");
        STATUS_LABELS.put("ReadyForFoster",    "Ready for Foster");
        STATUS_LABELS.put("InFoster",          "In Foster Care");
        STATUS_LABELS.put("ReadyForAdoption",  "Ready for Adoption");
        STATUS_LABELS.put("Adopted",           "Adopted");
        STATUS_LABELS.put("Closed",            "Closed");
    }

    // -----------------------------------------------------------------------
    // Queries
    // -----------------------------------------------------------------------

    /**
     * List all rescue cases.
     * Supports optional filters: status (exact match) and publishedOnly (boolean flag).
     */
    @Transactional(readOnly = true)
    public List<RescueCaseResponse> getAllRescueCases(String status, Boolean publishedOnly) {
        List<RescueCase> cases;

        if (Boolean.TRUE.equals(publishedOnly)) {
            cases = rescueCaseRepository.findByIsPublishedForAdoptionTrueAndStatus("ReadyForAdoption");
        } else if (status != null && !status.isBlank()) {
            cases = rescueCaseRepository.findByStatus(status);
        } else {
            cases = rescueCaseRepository.findAll();
        }

        return cases.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a single rescue case by business ID, including progress logs and photos.
     */
    @Transactional(readOnly = true)
    public RescueCaseResponse getRescueCaseById(String caseId) {
        RescueCase rescueCase = findByCaseIdOrThrow(caseId);

        List<RescueProgressLogResponse> logs = logRepository
                .findByCaseIdOrderByLogDateDesc(caseId)
                .stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());

        List<RescuePhotoResponse> photos = photoRepository
                .findByCaseIdOrderByUploadedAtDesc(caseId)
                .stream()
                .map(this::toPhotoResponse)
                .collect(Collectors.toList());

        return toFullResponse(rescueCase, logs, photos);
    }

    // -----------------------------------------------------------------------
    // Create
    // -----------------------------------------------------------------------

    @Transactional
    public RescueCaseResponse createRescueCase(RescueCaseRequest request) {
        validateCreateRequest(request);

        // Generate sequential caseId: RSC-YYYY-NNN
        int year = Year.now().getValue();
        long count = rescueCaseRepository.count() + 1;
        String caseId     = String.format("RSC-%d-%03d", year, count);
        String caseNumber = String.format("RC-%d-%02d",  year, count);

        // Avoid collision on concurrent inserts
        while (rescueCaseRepository.existsByCaseId(caseId)) {
            count++;
            caseId     = String.format("RSC-%d-%03d", year, count);
            caseNumber = String.format("RC-%d-%02d",  year, count);
        }

        RescueCase rescueCase = RescueCase.builder()
                .caseId(caseId)
                .caseNumber(caseNumber)
                .temporaryName(request.getTemporaryName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .estimatedAge(request.getEstimatedAge())
                .gender(request.getGender())
                .rescueLocation(request.getRescueLocation())
                .intakeDate(request.getIntakeDate() != null ? request.getIntakeDate() : LocalDate.now())
                .conditionSeverity(request.getConditionSeverity())
                .status("Intake")
                .isPublishedForAdoption(false)
                .microchipId(request.getMicrochipId())
                .intakeOfficer(request.getIntakeOfficer())
                .description(request.getDescription())
                .medicalSummary(request.getMedicalSummary())
                .coverPhotoUrl(request.getCoverPhotoUrl())
                .fosterParentId(request.getFosterParentId())
                .fosterParentName(request.getFosterParentName())
                .build();

        rescueCase = rescueCaseRepository.save(rescueCase);
        log.info("Created rescue case {} for '{}'", caseId, request.getTemporaryName());

        // Auto-create initial Intake progress log
        String logId = generateLogId();
        RescueProgressLog intakeLog = RescueProgressLog.builder()
                .logId(logId)
                .rescueCase(rescueCase)
                .caseId(caseId)
                .loggedBy(request.getIntakeOfficer() != null ? request.getIntakeOfficer() : "Rescue Officer")
                .logDate(LocalDateTime.now())
                .logType("Intake")
                .title("Initial Rescue Intake Registration")
                .notes(buildIntakeLogNotes(request))
                .build();

        logRepository.save(intakeLog);
        log.info("Created intake log {} for case {}", logId, caseId);

        // Auto-create cover photo if provided
        if (request.getCoverPhotoUrl() != null && !request.getCoverPhotoUrl().isBlank()) {
            String photoId = generatePhotoId();
            RescuePhoto coverPhoto = RescuePhoto.builder()
                    .photoId(photoId)
                    .rescueCase(rescueCase)
                    .caseId(caseId)
                    .photoUrl(request.getCoverPhotoUrl())
                    .caption("Intake Photo")
                    .tag("Intake Evidence")
                    .build();
            photoRepository.save(coverPhoto);
        }

        return getRescueCaseById(caseId);
    }

    // -----------------------------------------------------------------------
    // Update (with state machine enforcement)
    // -----------------------------------------------------------------------

    @Transactional
    public RescueCaseResponse updateRescueCase(String caseId, RescueCaseRequest request) {
        RescueCase rescueCase = findByCaseIdOrThrow(caseId);

        // Enforce state machine transition if status is being changed
        if (request.getStatus() != null && !request.getStatus().equals(rescueCase.getStatus())) {
            String currentStatus = rescueCase.getStatus();
            String targetStatus  = request.getStatus();
            Set<String> allowed  = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());

            if (!allowed.contains(targetStatus)) {
                String fromLabel = STATUS_LABELS.getOrDefault(currentStatus, currentStatus);
                String toLabel   = STATUS_LABELS.getOrDefault(targetStatus, targetStatus);
                throw new BadRequestException(
                    String.format("Invalid status transition: \"%s\" → \"%s\". " +
                                  "Please follow the required rescue workflow progression.", fromLabel, toLabel));
            }
        }

        // Business rule: only ReadyForAdoption cases may be published
        Boolean publishedFlag = request.getIsPublishedForAdoption();
        if (Boolean.TRUE.equals(publishedFlag)) {
            String effectiveStatus = request.getStatus() != null ? request.getStatus() : rescueCase.getStatus();
            if (!"ReadyForAdoption".equals(effectiveStatus)) {
                throw new BadRequestException(
                    "Only rescue cases marked Ready for Adoption can be published to the public gallery.");
            }
        }

        // Apply updates (null-safe partial patch)
        if (request.getTemporaryName()       != null) rescueCase.setTemporaryName(request.getTemporaryName());
        if (request.getSpecies()             != null) rescueCase.setSpecies(request.getSpecies());
        if (request.getBreed()               != null) rescueCase.setBreed(request.getBreed());
        if (request.getEstimatedAge()        != null) rescueCase.setEstimatedAge(request.getEstimatedAge());
        if (request.getGender()              != null) rescueCase.setGender(request.getGender());
        if (request.getRescueLocation()      != null) rescueCase.setRescueLocation(request.getRescueLocation());
        if (request.getIntakeDate()          != null) rescueCase.setIntakeDate(request.getIntakeDate());
        if (request.getConditionSeverity()   != null) rescueCase.setConditionSeverity(request.getConditionSeverity());
        if (request.getStatus()              != null) rescueCase.setStatus(request.getStatus());
        if (request.getMicrochipId()         != null) rescueCase.setMicrochipId(request.getMicrochipId());
        if (request.getIntakeOfficer()       != null) rescueCase.setIntakeOfficer(request.getIntakeOfficer());
        if (request.getDescription()         != null) rescueCase.setDescription(request.getDescription());
        if (request.getMedicalSummary()      != null) rescueCase.setMedicalSummary(request.getMedicalSummary());
        if (request.getCoverPhotoUrl()       != null) rescueCase.setCoverPhotoUrl(request.getCoverPhotoUrl());
        if (request.getFosterParentId()      != null) rescueCase.setFosterParentId(request.getFosterParentId());
        if (request.getFosterParentName()    != null) rescueCase.setFosterParentName(request.getFosterParentName());
        if (publishedFlag                    != null) rescueCase.setIsPublishedForAdoption(publishedFlag);

        rescueCaseRepository.save(rescueCase);
        log.info("Updated rescue case {}", caseId);
        return getRescueCaseById(caseId);
    }

    // -----------------------------------------------------------------------
    // Progress Logs
    // -----------------------------------------------------------------------

    @Transactional
    public RescueProgressLogResponse addProgressLog(String caseId, RescueProgressLogRequest request) {
        RescueCase rescueCase = findByCaseIdOrThrow(caseId);

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Log title is required.");
        }
        if (request.getLoggedBy() == null || request.getLoggedBy().isBlank()) {
            throw new BadRequestException("loggedBy is required.");
        }

        String logId = generateLogId();
        RescueProgressLog progressLog = RescueProgressLog.builder()
                .logId(logId)
                .rescueCase(rescueCase)
                .caseId(caseId)
                .loggedBy(request.getLoggedBy())
                .logDate(LocalDateTime.now())
                .logType(request.getLogType())
                .title(request.getTitle())
                .notes(request.getNotes())
                .build();

        logRepository.save(progressLog);
        log.info("Added progress log {} to case {}", logId, caseId);
        return toLogResponse(progressLog);
    }

    // -----------------------------------------------------------------------
    // Photos
    // -----------------------------------------------------------------------

    @Transactional
    public RescuePhotoResponse addPhoto(String caseId, RescuePhotoRequest request) {
        RescueCase rescueCase = findByCaseIdOrThrow(caseId);

        if (request.getPhotoUrl() == null || request.getPhotoUrl().isBlank()) {
            throw new BadRequestException("photoUrl is required.");
        }

        String photoId = generatePhotoId();
        RescuePhoto photo = RescuePhoto.builder()
                .photoId(photoId)
                .rescueCase(rescueCase)
                .caseId(caseId)
                .photoUrl(request.getPhotoUrl())
                .caption(request.getCaption())
                .tag(request.getTag())
                .build();

        photoRepository.save(photo);
        log.info("Added photo {} to case {}", photoId, caseId);
        return toPhotoResponse(photo);
    }

    // -----------------------------------------------------------------------
    // Foster Assignment
    // -----------------------------------------------------------------------

    @Transactional
    public RescueCaseResponse assignFoster(String caseId, FosterAssignRequest request) {
        if (request.getFosterName() == null || request.getFosterName().isBlank()) {
            throw new BadRequestException("fosterName is required for foster assignment.");
        }

        RescueCaseRequest update = new RescueCaseRequest();
        update.setStatus("InFoster");
        update.setFosterParentId(request.getFosterId());
        update.setFosterParentName(request.getFosterName());

        RescueCaseResponse result = updateRescueCase(caseId, update);

        // Add an automatic Foster progress log
        RescueProgressLogRequest logReq = new RescueProgressLogRequest();
        logReq.setLoggedBy("Rescue Officer");
        logReq.setLogType("Foster");
        logReq.setTitle("Placed in Foster Care with " + request.getFosterName());
        logReq.setNotes("Pet placed into foster care home. Foster monitoring protocol active.");
        addProgressLog(caseId, logReq);

        return result;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private RescueCase findByCaseIdOrThrow(String caseId) {
        return rescueCaseRepository.findByCaseId(caseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Rescue case not found with caseId: " + caseId));
    }

    private void validateCreateRequest(RescueCaseRequest req) {
        List<String> errors = new ArrayList<>();
        if (req.getTemporaryName() == null || req.getTemporaryName().isBlank())
            errors.add("temporaryName");
        if (req.getRescueLocation() == null || req.getRescueLocation().isBlank())
            errors.add("rescueLocation");
        if (!errors.isEmpty())
            throw new BadRequestException("Required fields missing: " + String.join(", ", errors));
    }

    private String buildIntakeLogNotes(RescueCaseRequest req) {
        StringBuilder sb = new StringBuilder();
        if (req.getRescueLocation() != null)
            sb.append("Rescued at ").append(req.getRescueLocation()).append(". ");
        if (req.getConditionSeverity() != null)
            sb.append("Initial condition assessed as ").append(req.getConditionSeverity()).append(".");
        return sb.toString().trim();
    }

    private String generateLogId() {
        long count = logRepository.count() + 1;
        return String.format("RPL-%03d", count + 500);
    }

    private String generatePhotoId() {
        long count = photoRepository.count() + 1;
        return String.format("RPH-%02d", count + 10);
    }

    // -----------------------------------------------------------------------
    // Mappers
    // -----------------------------------------------------------------------

    private RescueCaseResponse toSummaryResponse(RescueCase rc) {
        return RescueCaseResponse.builder()
                .caseId(rc.getCaseId())
                .caseNumber(rc.getCaseNumber())
                .temporaryName(rc.getTemporaryName())
                .species(rc.getSpecies())
                .breed(rc.getBreed())
                .estimatedAge(rc.getEstimatedAge())
                .gender(rc.getGender())
                .rescueLocation(rc.getRescueLocation())
                .intakeDate(rc.getIntakeDate())
                .conditionSeverity(rc.getConditionSeverity())
                .status(rc.getStatus())
                .isPublishedForAdoption(rc.getIsPublishedForAdoption())
                .microchipId(rc.getMicrochipId())
                .intakeOfficer(rc.getIntakeOfficer())
                .description(rc.getDescription())
                .medicalSummary(rc.getMedicalSummary())
                .coverPhotoUrl(rc.getCoverPhotoUrl())
                .fosterParentId(rc.getFosterParentId())
                .fosterParentName(rc.getFosterParentName())
                .createdAt(rc.getCreatedAt())
                .updatedAt(rc.getUpdatedAt())
                .progressLogs(Collections.emptyList())
                .photos(Collections.emptyList())
                .build();
    }

    private RescueCaseResponse toFullResponse(RescueCase rc,
                                              List<RescueProgressLogResponse> logs,
                                              List<RescuePhotoResponse> photos) {
        return RescueCaseResponse.builder()
                .caseId(rc.getCaseId())
                .caseNumber(rc.getCaseNumber())
                .temporaryName(rc.getTemporaryName())
                .species(rc.getSpecies())
                .breed(rc.getBreed())
                .estimatedAge(rc.getEstimatedAge())
                .gender(rc.getGender())
                .rescueLocation(rc.getRescueLocation())
                .intakeDate(rc.getIntakeDate())
                .conditionSeverity(rc.getConditionSeverity())
                .status(rc.getStatus())
                .isPublishedForAdoption(rc.getIsPublishedForAdoption())
                .microchipId(rc.getMicrochipId())
                .intakeOfficer(rc.getIntakeOfficer())
                .description(rc.getDescription())
                .medicalSummary(rc.getMedicalSummary())
                .coverPhotoUrl(rc.getCoverPhotoUrl())
                .fosterParentId(rc.getFosterParentId())
                .fosterParentName(rc.getFosterParentName())
                .createdAt(rc.getCreatedAt())
                .updatedAt(rc.getUpdatedAt())
                .progressLogs(logs)
                .photos(photos)
                .build();
    }

    private RescueProgressLogResponse toLogResponse(RescueProgressLog log) {
        return RescueProgressLogResponse.builder()
                .logId(log.getLogId())
                .caseId(log.getCaseId())
                .loggedBy(log.getLoggedBy())
                .logDate(log.getLogDate())
                .logType(log.getLogType())
                .title(log.getTitle())
                .notes(log.getNotes())
                .build();
    }

    private RescuePhotoResponse toPhotoResponse(RescuePhoto photo) {
        return RescuePhotoResponse.builder()
                .photoId(photo.getPhotoId())
                .caseId(photo.getCaseId())
                .photoUrl(photo.getPhotoUrl())
                .caption(photo.getCaption())
                .uploadedAt(photo.getUploadedAt())
                .tag(photo.getTag())
                .build();
    }
}
