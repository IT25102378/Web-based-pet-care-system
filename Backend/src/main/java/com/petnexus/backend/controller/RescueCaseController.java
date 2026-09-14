package com.petnexus.backend.controller;

import jakarta.validation.Valid;
import com.petnexus.backend.dto.*;
import com.petnexus.backend.service.RescueCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RescueCaseController — REST endpoints under /api/rescue/cases.
 * Implements all endpoints consumed by rescueApi.js.
 */
@RestController
@RequestMapping("/rescue/cases")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class RescueCaseController {

    private final RescueCaseService rescueCaseService;

    // -----------------------------------------------------------------------
    // GET /api/rescue/cases
    // Supports: ?status=InTreatment  and  ?publishedOnly=true
    // -----------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<RescueCaseResponse>> getAllRescueCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean publishedOnly) {

        List<RescueCaseResponse> cases = rescueCaseService.getAllRescueCases(status, publishedOnly);
        return ResponseEntity.ok(cases);
    }

    // -----------------------------------------------------------------------
    // GET /api/rescue/cases/{caseId}
    // Returns full case including nested progressLogs and photos
    // -----------------------------------------------------------------------
    @GetMapping("/{caseId}")
    public ResponseEntity<RescueCaseResponse> getRescueCaseById(@PathVariable String caseId) {
        return ResponseEntity.ok(rescueCaseService.getRescueCaseById(caseId));
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases
    // Create a new rescue case (automatically sets status=Intake and creates intake log)
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping
    public ResponseEntity<RescueCaseResponse> createRescueCase(@Valid @RequestBody RescueCaseRequest request) {
        RescueCaseResponse created = rescueCaseService.createRescueCase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // -----------------------------------------------------------------------
    // PUT /api/rescue/cases/{caseId}
    // Partial update — state machine enforced server-side
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PutMapping("/{caseId}")
    public ResponseEntity<RescueCaseResponse> updateRescueCase(
            @PathVariable String caseId,
            @Valid @RequestBody RescueCaseRequest request) {

        return ResponseEntity.ok(rescueCaseService.updateRescueCase(caseId, request));
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/{caseId}/logs
    // Add a progress log entry
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping("/{caseId}/logs")
    public ResponseEntity<RescueProgressLogResponse> addProgressLog(
            @PathVariable String caseId,
            @Valid @RequestBody RescueProgressLogRequest request) {

        RescueProgressLogResponse log = rescueCaseService.addProgressLog(caseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(log);
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/{caseId}/photos
    // Add a photo to a rescue case
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping("/{caseId}/photos")
    public ResponseEntity<RescuePhotoResponse> addPhoto(
            @PathVariable String caseId,
            @Valid @RequestBody RescuePhotoRequest request) {

        RescuePhotoResponse photo = rescueCaseService.addPhoto(caseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(photo);
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/{caseId}/foster
    // Assign a foster parent — transitions case to InFoster status
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping("/{caseId}/foster")
    public ResponseEntity<RescueCaseResponse> assignFoster(
            @PathVariable String caseId,
            @Valid @RequestBody FosterAssignRequest request) {

        return ResponseEntity.ok(rescueCaseService.assignFoster(caseId, request));
    }

    // NOTE: GET /api/rescue/cases/{caseId}/consultations is handled by ConsultationController
    // to avoid a duplicate mapping conflict. That endpoint calls consultationService.getRescueCaseConsultations(caseId).
}
