package com.petnexus.backend.controller;


import jakarta.validation.Valid;
import com.petnexus.backend.dto.PrescriptionCreateRequest;
import com.petnexus.backend.dto.PrescriptionResponse;
import com.petnexus.backend.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/prescriptions")
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    /**
     * GET /api/prescriptions
     * Filters: petId, vetId
     */
    @GetMapping
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptions(
            @RequestParam(required = false) String petId,
            @RequestParam(required = false) String vetId,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(prescriptionService.getPrescriptions(petId, vetId, callerOwnerId));
    }

    /**
     * GET /api/prescriptions/{prescriptionId}
     */
    @GetMapping("/{prescriptionId}")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(
            @PathVariable String prescriptionId,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(prescriptionId, callerOwnerId));
    }

    /**
     * POST /api/prescriptions
     * Accepts both { prescriptionData: {...}, items: [...] } and flat JSON
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Veterinarian')")
    @PostMapping
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody PrescriptionCreateRequest request
    ) {
        PrescriptionResponse response = prescriptionService.createPrescription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** PUT /api/prescriptions/{prescriptionId} - revise the administration instructions */
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Veterinarian', 'Admin')")
    @PutMapping("/{prescriptionId}")
    public ResponseEntity<PrescriptionResponse> updatePrescription(
            @PathVariable String prescriptionId,
            @RequestBody java.util.Map<String, Object> body
    ) {
        Object instructions = body != null ? body.get("instructions") : null;
        return ResponseEntity.ok(prescriptionService.updateInstructions(
                prescriptionId, instructions != null ? instructions.toString() : null));
    }

    /** POST /api/prescriptions/{prescriptionId}/revoke - cancel but keep on record */
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Veterinarian', 'Admin')")
    @PostMapping("/{prescriptionId}/revoke")
    public ResponseEntity<PrescriptionResponse> revokePrescription(
            @PathVariable String prescriptionId,
            @RequestBody(required = false) java.util.Map<String, Object> body
    ) {
        Object reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(prescriptionService.revokePrescription(
                prescriptionId, reason != null ? reason.toString() : null));
    }

    /** DELETE /api/prescriptions/{prescriptionId} - remove permanently */
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Veterinarian', 'Admin')")
    @DeleteMapping("/{prescriptionId}")
    public ResponseEntity<Void> deletePrescription(@PathVariable String prescriptionId) {
        prescriptionService.deletePrescription(prescriptionId);
        return ResponseEntity.noContent().build();
    }
}
