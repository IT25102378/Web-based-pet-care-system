package com.petnexus.backend.controller;

import com.petnexus.backend.dto.CareServiceResponseDto;
import com.petnexus.backend.dto.CareServiceUpdateRequest;
import com.petnexus.backend.dto.CreateCareServiceRequest;
import com.petnexus.backend.service.CareServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing Care Services (grooming, boarding, day care offerings).
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping({"/care-services", "/packages"})
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class CareServiceController {

    private final CareServiceService careServiceService;

    @GetMapping
    public ResponseEntity<List<CareServiceResponseDto>> listServices() {
        return ResponseEntity.ok(careServiceService.listServices());
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<CareServiceResponseDto> getService(@PathVariable String serviceId) {
        return ResponseEntity.ok(careServiceService.getService(serviceId));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PostMapping
    public ResponseEntity<CareServiceResponseDto> createService(@Valid @RequestBody CreateCareServiceRequest request) {
        CareServiceResponseDto created = careServiceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PutMapping("/{serviceId}")
    public ResponseEntity<CareServiceResponseDto> updateService(
            @PathVariable String serviceId,
            @Valid @RequestBody CareServiceUpdateRequest request) {
        request.setServiceId(serviceId);
        return ResponseEntity.ok(careServiceService.updateService(request));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PutMapping("/{serviceId}/activate")
    public ResponseEntity<CareServiceResponseDto> activateService(@PathVariable String serviceId) {
        return ResponseEntity.ok(careServiceService.activateService(serviceId));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PutMapping("/{serviceId}/deactivate")
    public ResponseEntity<CareServiceResponseDto> deactivateService(@PathVariable String serviceId) {
        return ResponseEntity.ok(careServiceService.deactivateService(serviceId));
    }
}
