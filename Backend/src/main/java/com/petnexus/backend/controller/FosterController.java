package com.petnexus.backend.controller;

import com.petnexus.backend.dto.FosterRecordRequest;
import com.petnexus.backend.dto.FosterRecordResponse;
import com.petnexus.backend.service.FosterRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FosterController — REST endpoint under /api/rescue/fosters.
 * Exposes the registered foster family directory and CRUD consumed by rescueApi.
 */
@RestController
@RequestMapping("/rescue/fosters")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
public class FosterController {

    private final FosterRecordService fosterRecordService;

    /**
     * GET /api/rescue/fosters
     * Returns all registered foster families.
     */
    @GetMapping
    public ResponseEntity<List<FosterRecordResponse>> getAllFosterRecords() {
        return ResponseEntity.ok(fosterRecordService.getAllFosterRecords());
    }

    /**
     * GET /api/rescue/fosters/{fosterId}
     */
    @GetMapping("/{fosterId}")
    public ResponseEntity<FosterRecordResponse> getFosterRecord(@PathVariable String fosterId) {
        return ResponseEntity.ok(fosterRecordService.getFosterRecord(fosterId));
    }

    /**
     * POST /api/rescue/fosters
     */
    @PostMapping
    public ResponseEntity<FosterRecordResponse> createFosterRecord(@Valid @RequestBody FosterRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fosterRecordService.createFosterRecord(request));
    }

    /**
     * PUT /api/rescue/fosters/{fosterId}
     */
    @PutMapping("/{fosterId}")
    public ResponseEntity<FosterRecordResponse> updateFosterRecord(
            @PathVariable String fosterId,
            @Valid @RequestBody FosterRecordRequest request) {
        return ResponseEntity.ok(fosterRecordService.updateFosterRecord(fosterId, request));
    }

    /**
     * DELETE /api/rescue/fosters/{fosterId}
     */
    @DeleteMapping("/{fosterId}")
    public ResponseEntity<Void> deleteFosterRecord(@PathVariable String fosterId) {
        fosterRecordService.deleteFosterRecord(fosterId);
        return ResponseEntity.noContent().build();
    }
}
