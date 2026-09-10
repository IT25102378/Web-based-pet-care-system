package com.petnexus.backend.controller;

import com.petnexus.backend.dto.CareProviderResponseDto;
import com.petnexus.backend.dto.CreateCareProviderRequest;
import com.petnexus.backend.service.CareProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing Care Providers (pet care / grooming professionals).
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/care-providers")
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class CareProviderController {

    private final CareProviderService careProviderService;

    @GetMapping
    public ResponseEntity<List<CareProviderResponseDto>> listProviders() {
        return ResponseEntity.ok(careProviderService.listProviders());
    }

    @GetMapping("/{providerId}")
    public ResponseEntity<CareProviderResponseDto> getProvider(@PathVariable String providerId) {
        return ResponseEntity.ok(careProviderService.getProvider(providerId));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PostMapping
    public ResponseEntity<CareProviderResponseDto> createProvider(@Valid @RequestBody CreateCareProviderRequest request) {
        CareProviderResponseDto created = careProviderService.createProvider(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PutMapping("/{providerId}/activate")
    public ResponseEntity<CareProviderResponseDto> activateProvider(@PathVariable String providerId) {
        return ResponseEntity.ok(careProviderService.activateProvider(providerId));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('Admin', 'ClinicManager')")
    @PutMapping("/{providerId}/deactivate")
    public ResponseEntity<CareProviderResponseDto> deactivateProvider(@PathVariable String providerId) {
        return ResponseEntity.ok(careProviderService.deactivateProvider(providerId));
    }
}
