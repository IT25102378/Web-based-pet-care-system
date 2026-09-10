package com.petnexus.backend.controller;

import com.petnexus.backend.dto.AdoptionListingDto;
import com.petnexus.backend.dto.CreateListingRequest;
import com.petnexus.backend.dto.UpdateListingRequest;
import com.petnexus.backend.service.AdoptionListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/adoptions/listings")
@PreAuthorize("isAuthenticated()")
public class AdoptionListingController {

    private final AdoptionListingService listingService;

    @GetMapping
    public ResponseEntity<List<AdoptionListingDto>> getPublishedListings() {
        return ResponseEntity.ok(listingService.getPublishedListings());
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<AdoptionListingDto> getListingByCaseId(@PathVariable String caseId) {
        return ResponseEntity.ok(listingService.getListingByCaseId(caseId));
    }

    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PostMapping
    public ResponseEntity<AdoptionListingDto> createListing(@RequestBody CreateListingRequest request) {
        AdoptionListingDto created = listingService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('RescueOfficer', 'Admin')")
    @PutMapping("/{caseId}")
    public ResponseEntity<AdoptionListingDto> updateListing(
            @PathVariable String caseId,
            @RequestBody UpdateListingRequest request
    ) {
        return ResponseEntity.ok(listingService.updateListing(caseId, request));
    }
}
