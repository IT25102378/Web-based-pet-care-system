package com.petnexus.backend.controller;

import com.petnexus.backend.dto.ConsultationRequest;
import com.petnexus.backend.dto.ConsultationResponse;
import com.petnexus.backend.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class ConsultationController {

    private final ConsultationService consultationService;

    // =========================================================================
    // Consultation Endpoints
    // =========================================================================

    /**
     * GET /api/consultations
     * Filters: petId, caseId, vetId
     */
    @GetMapping("/consultations")
    public ResponseEntity<List<ConsultationResponse>> getConsultations(
            @RequestParam(required = false) String petId,
            @RequestParam(required = false) String caseId,
            @RequestParam(required = false) String vetId,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(consultationService.getConsultations(petId, caseId, vetId, callerOwnerId));
    }

    /**
     * GET /api/consultations/{consultationId}
     */
    @GetMapping("/consultations/{consultationId}")
    public ResponseEntity<ConsultationResponse> getConsultationById(
            @PathVariable String consultationId,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(consultationService.getConsultationById(consultationId, callerOwnerId));
    }

    /**
     * POST /api/consultations
     * Records clinical SOAP notes and automatically completes linked appointment if provided.
     */
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('Veterinarian')")
    @PostMapping("/consultations")
    public ResponseEntity<ConsultationResponse> createConsultation(
            @Valid @RequestBody ConsultationRequest request
    ) {
        ConsultationResponse response = consultationService.createConsultation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/rescue/cases/{caseId}/consultations
     * Cross-module endpoint called by rescueApi.js getRescueCaseConsultations(caseId)
     */
    @GetMapping("/rescue/cases/{caseId}/consultations")
    public ResponseEntity<List<ConsultationResponse>> getRescueCaseConsultations(
            @PathVariable String caseId
    ) {
        return ResponseEntity.ok(consultationService.getRescueCaseConsultations(caseId));
    }
}
