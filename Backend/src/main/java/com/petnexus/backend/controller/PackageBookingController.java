package com.petnexus.backend.controller;

import jakarta.validation.Valid;
import com.petnexus.backend.dto.PackageBookingCreateRequest;
import com.petnexus.backend.dto.ServicePackageBookingResponseDto;
import com.petnexus.backend.service.ServicePackageBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Service Package Booking operations.
 * Aligns with the contract defined in frontend src/api/careServiceApi.js.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/packages/bookings")
@org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
public class PackageBookingController {

    private final ServicePackageBookingService bookingService;

    // ------------------- GET list -------------------
    @GetMapping
    public ResponseEntity<List<ServicePackageBookingResponseDto>> getBookings(
            @RequestParam(required = false) String ownerId) {
        List<ServicePackageBookingResponseDto> bookings = bookingService.listBookings(ownerId);
        return ResponseEntity.ok(bookings);
    }

    // ------------------- CREATE -------------------
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PetOwner')")
    @PostMapping
    public ResponseEntity<ServicePackageBookingResponseDto> createBooking(
            @Valid @RequestBody PackageBookingCreateRequest request) {
        ServicePackageBookingResponseDto created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ------------------- REDEEM SESSION -------------------
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('PetCareProvider', 'ClinicManager', 'Admin')")
    @PostMapping("/{bookingId}/redeem")
    public ResponseEntity<ServicePackageBookingResponseDto> redeemSession(
            @PathVariable String bookingId) {
        ServicePackageBookingResponseDto updated = bookingService.redeemSession(bookingId);
        return ResponseEntity.ok(updated);
    }
}
