package com.petnexus.backend.controller;

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
public class RescueCaseController {

    private final RescueCaseService rescueCaseService;

    // -----------------------------------------------------------------------
    // GET /api/rescue/cases
    // Supports: ?status=InTreatment  and  ?publishedOnly=true  and  ?reportedByUserId=USR-xxx
    // -----------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<RescueCaseResponse>> getAllRescueCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean publishedOnly,
            @RequestParam(required = false) String reportedByUserId) {

        List<RescueCaseResponse> cases = rescueCaseService.getAllRescueCases(status, publishedOnly, reportedByUserId);
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
    public ResponseEntity<RescueCaseResponse> createRescueCase(@RequestBody RescueCaseRequest request) {
        RescueCaseResponse created = rescueCaseService.createRescueCase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/report
    // Pet Owner reports an animal needing rescue (status=Reported)
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('PetOwner', 'RescueOfficer', 'Admin')")
    @PostMapping("/report")
    public ResponseEntity<RescueCaseResponse> reportAnimalForRescue(@RequestBody RescueCaseRequest request) {
        RescueCaseResponse reported = rescueCaseService.reportAnimalForRescue(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reported);
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/{caseId}/accept-report
    // Rescue Officer accepts report -> moves to Intake & adds to rescued animals list
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping("/{caseId}/accept-report")
    public ResponseEntity<RescueCaseResponse> acceptRescueReport(
            @PathVariable String caseId,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        RescueCaseResponse accepted = rescueCaseService.acceptRescueReport(caseId, notes);
        return ResponseEntity.ok(accepted);
    }

    // -----------------------------------------------------------------------
    // PUT /api/rescue/cases/{caseId}
    // Partial update — state machine enforced server-side
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin', 'Veterinarian', 'PetCareProvider')")
    @PutMapping("/{caseId}")
    public ResponseEntity<RescueCaseResponse> updateRescueCase(
            @PathVariable String caseId,
            @RequestBody RescueCaseRequest request) {

        return ResponseEntity.ok(rescueCaseService.updateRescueCase(caseId, request));
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/{caseId}/logs
    // Add a progress log entry
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin', 'Veterinarian', 'PetCareProvider')")
    @PostMapping("/{caseId}/logs")
    public ResponseEntity<RescueProgressLogResponse> addProgressLog(
            @PathVariable String caseId,
            @RequestBody RescueProgressLogRequest request) {

        RescueProgressLogResponse log = rescueCaseService.addProgressLog(caseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(log);
    }

    // -----------------------------------------------------------------------
    // POST /api/rescue/cases/{caseId}/photos
    // Add a photo to a rescue case
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin', 'Veterinarian', 'PetCareProvider')")
    @PostMapping("/{caseId}/photos")
    public ResponseEntity<RescuePhotoResponse> addPhoto(
            @PathVariable String caseId,
            @RequestBody RescuePhotoRequest request) {

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
            @RequestBody FosterAssignRequest request) {

        return ResponseEntity.ok(rescueCaseService.assignFoster(caseId, request));
    }

    // -----------------------------------------------------------------------
    // DELETE /api/rescue/cases/{caseId}
    // Delete a rescue case and its associated records
    // -----------------------------------------------------------------------
    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @DeleteMapping("/{caseId}")
    public ResponseEntity<Void> deleteRescueCase(@PathVariable String caseId) {
        rescueCaseService.deleteRescueCase(caseId);
        return ResponseEntity.noContent().build();
    }

    // NOTE: GET /api/rescue/cases/{caseId}/consultations is handled by ConsultationController
    // to avoid a duplicate mapping conflict. That endpoint calls consultationService.getRescueCaseConsultations(caseId).
}
