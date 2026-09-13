package com.petnexus.backend.controller;

import jakarta.validation.Valid;
import com.petnexus.backend.dto.AdoptionApplicationDto;
import com.petnexus.backend.dto.CreateApplicationRequest;
import com.petnexus.backend.dto.ReviewApplicationRequest;
import com.petnexus.backend.service.AdoptionApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/adoptions/applications")
@PreAuthorize("isAuthenticated()")
public class AdoptionApplicationController {

    private final AdoptionApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<AdoptionApplicationDto>> getApplications(
            @RequestParam(required = false) String caseId,
            @RequestParam(required = false) String applicantId
    ) {
        return ResponseEntity.ok(applicationService.getApplications(caseId, applicantId));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<AdoptionApplicationDto> getApplicationById(@PathVariable String applicationId) {
        return ResponseEntity.ok(applicationService.getApplicationById(applicationId));
    }

    @PreAuthorize("hasRole('PetOwner')")
    @PostMapping
    public ResponseEntity<AdoptionApplicationDto> submitApplication(@Valid @RequestBody CreateApplicationRequest request) {
        AdoptionApplicationDto response = applicationService.submitApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping("/{applicationId}/review")
    public ResponseEntity<AdoptionApplicationDto> reviewApplication(
            @PathVariable String applicationId,
            @Valid @RequestBody ReviewApplicationRequest request
    ) {
        return ResponseEntity.ok(applicationService.reviewApplication(applicationId, request));
    }

    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PutMapping("/{applicationId}/review")
    public ResponseEntity<AdoptionApplicationDto> reviewApplicationPut(
            @PathVariable String applicationId,
            @Valid @RequestBody ReviewApplicationRequest request
    ) {
        return ResponseEntity.ok(applicationService.reviewApplication(applicationId, request));
    }
}
