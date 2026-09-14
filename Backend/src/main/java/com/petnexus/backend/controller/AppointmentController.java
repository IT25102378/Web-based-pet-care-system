package com.petnexus.backend.controller;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST controller for Appointments and Scheduling.
 * Matches Frontend/src/api/appointmentApi.js contract.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/appointments")
@PreAuthorize("isAuthenticated()")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // =========================================================================
    // 1. Get Appointments (with optional filters)
    // =========================================================================
    /**
     * GET /api/appointments
     * Supports filtering by ownerId, vetId, status, date.
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @RequestParam(required = false) String ownerId,
            @RequestParam(required = false) String vetId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(appointmentService.getAppointments(ownerId, vetId, status, date));
    }

    // =========================================================================
    // 2. Get Available Slots
    // =========================================================================
    /**
     * GET /api/appointments/available-slots
     * Query: vetName, date (yyyy-MM-dd), optional excludeId
     */
    @GetMapping("/available-slots")
    public ResponseEntity<List<SlotAvailabilityResponse>> getAvailableSlots(
            @RequestParam String vetName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String excludeId
    ) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(vetName, date, excludeId));
    }

    // =========================================================================
    // 3. Get Appointment by ID
    // =========================================================================
    /**
     * GET /api/appointments/{appointmentId}
     */
    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable String appointmentId,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(appointmentId, callerOwnerId));
    }

    // =========================================================================
    // 4. Book Appointment (Pet Owner)
    // =========================================================================
    /**
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentRequest request
    ) {
        AppointmentResponse response = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================================
    // 5. Register Walk-In Patient (Clinic Staff / Front Desk)
    // =========================================================================
    /**
     * POST /api/appointments/walk-in
     */
    @PostMapping("/walk-in")
    public ResponseEntity<AppointmentResponse> registerWalkIn(
            @Valid @RequestBody WalkInRequest request
    ) {
        AppointmentResponse response = appointmentService.registerWalkIn(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================================
    // 6. Update Status (Clinic Staff Live Queue)
    // =========================================================================
    /**
     * PUT /api/appointments/{appointmentId}/status
     */
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable String appointmentId,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(appointmentService.updateStatus(appointmentId, request.getStatus()));
    }

    // =========================================================================
    // 7. Confirm Appointment (Clinic Staff)
    // =========================================================================
    /**
     * PUT /api/appointments/{appointmentId}/confirm
     */
    @PutMapping("/{appointmentId}/confirm")
    public ResponseEntity<AppointmentResponse> confirmAppointment(
            @PathVariable String appointmentId
    ) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(appointmentId));
    }

    // =========================================================================
    // 8. Reschedule Appointment
    // =========================================================================
    /**
     * PUT /api/appointments/{appointmentId}/reschedule
     */
    @PutMapping("/{appointmentId}/reschedule")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable String appointmentId,
            @Valid @RequestBody RescheduleRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(appointmentId, request, callerOwnerId));
    }

    // =========================================================================
    // 9. Cancel Appointment
    // =========================================================================
    /**
     * PUT /api/appointments/{appointmentId}/cancel
     */
    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable String appointmentId,
            @Valid @RequestBody(required = false) CancelRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String callerOwnerId
    ) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId, request, callerOwnerId));
    }
}
