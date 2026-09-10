package com.petnexus.backend.controller;

import com.petnexus.backend.dto.CareServiceLogCreateRequest;
import com.petnexus.backend.dto.CareServiceLogResponseDto;
import com.petnexus.backend.dto.ServiceLogStatusUpdateRequest;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.service.CareServiceLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for Care Service Log operations.
 * Matches the frontend contract defined in careServiceApi.js.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/care-services/logs")
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class CareServiceLogController {

    private final CareServiceLogService logService;

    // ------------------- GET list -------------------
    @GetMapping
    public ResponseEntity<List<CareServiceLogResponseDto>> getLogs(
            @RequestParam(required = false) String providerId,
            @RequestParam(required = false) String ownerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String caseId) {
        List<CareServiceLogResponseDto> logs = logService.listLogs(providerId, ownerId, status);
        // Additional optional filter for caseId (frontend may request)
        if (caseId != null) {
            logs = logs.stream()
                    .filter(l -> caseId.equals(l.getCaseId()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(logs);
    }

    // ------------------- GET single -------------------
    @GetMapping("/{serviceLogId}")
    public ResponseEntity<CareServiceLogResponseDto> getLog(@PathVariable String serviceLogId) {
        return ResponseEntity.ok(logService.getLog(serviceLogId));
    }

    // ------------------- CREATE -------------------
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('PetCareProvider', 'ClinicManager', 'Admin')")
    @PostMapping
    public ResponseEntity<CareServiceLogResponseDto> createLog(@RequestBody CareServiceLogCreateRequest request) {
        CareServiceLogResponseDto created = logService.createLog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ------------------- UPDATE STATUS -------------------
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('PetCareProvider', 'ClinicManager', 'Admin')")
    @PutMapping("/{serviceLogId}/status")
    public ResponseEntity<CareServiceLogResponseDto> updateStatus(
            @PathVariable String serviceLogId,
            @RequestBody ServiceLogStatusUpdateRequest request) {
        ServiceStatus newStatus = request.getStatus();
        String notes = request.getNotes();
        CareServiceLogResponseDto updated = logService.updateStatus(serviceLogId, newStatus, notes);
        return ResponseEntity.ok(updated);
    }
}
