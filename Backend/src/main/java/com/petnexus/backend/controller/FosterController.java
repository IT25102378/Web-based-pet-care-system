package com.petnexus.backend.controller;

import com.petnexus.backend.dto.FosterRecordResponse;
import com.petnexus.backend.service.FosterRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * FosterController — REST endpoint under /api/rescue/fosters.
 * Exposes the registered foster family directory consumed by rescueApi.getFosterRecords().
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
}
