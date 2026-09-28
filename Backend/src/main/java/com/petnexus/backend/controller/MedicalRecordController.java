package com.petnexus.backend.controller;

import com.petnexus.backend.dto.MedicalHistoryResponse;
import com.petnexus.backend.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class MedicalRecordController {

    private final ConsultationService consultationService;

    /**
     * GET /api/pets/{petId}/medical-history
     * Retrieves aggregated medical history for a pet: consultations, prescriptions, vaccinations.
     */
    @GetMapping("/pets/{petId}/medical-history")
    public ResponseEntity<MedicalHistoryResponse> getPetMedicalHistory(
            @PathVariable String petId,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(consultationService.getPetMedicalHistory(petId, callerOwnerId));
    }
}
