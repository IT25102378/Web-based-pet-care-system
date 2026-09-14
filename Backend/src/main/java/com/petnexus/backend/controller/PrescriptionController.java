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
}
