package com.petnexus.backend.service;

import com.petnexus.backend.dto.PackageBookingCreateRequest;
import com.petnexus.backend.dto.ServicePackageBookingResponseDto;
import com.petnexus.backend.entity.ServicePackageBooking;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.ServicePackageBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling service package bookings.
 * Supports creation, retrieval, and session redemption.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicePackageBookingService {

    private final ServicePackageBookingRepository bookingRepository;

    @Transactional
    public ServicePackageBookingResponseDto createBooking(PackageBookingCreateRequest request) {
        // Ensure uniqueness: owner cannot have an active booking with same package name
        if (bookingRepository.existsByOwnerIdAndPackageNameAndStatus(request.getOwnerId(), request.getPackageName(), "Active")) {
            throw new BadRequestException("Owner already has an active booking for this package");
        }
        ServicePackageBooking booking = ServicePackageBooking.builder()
                .bookingId("PKB-" + System.currentTimeMillis())
                .ownerId(request.getOwnerId())
                .ownerName(request.getOwnerName())
                .petId(request.getPetId())
                .petName(request.getPetName())
                .packageId(request.getPackageId())
                .packageName(request.getPackageName())
                .totalSessions(request.getTotalSessions())
                .completedSessions(0)
                .remainingSessions(request.getTotalSessions())
                .purchaseDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1)) // 1 year validity
                .status("Active")
                .createdAt(LocalDate.now())
                .build();
        bookingRepository.save(booking);
        log.info("Created ServicePackageBooking {} for owner {}", booking.getBookingId(), request.getOwnerId());
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<ServicePackageBookingResponseDto> listBookings(String ownerId) {
        List<ServicePackageBooking> bookings = (ownerId == null) ?
                bookingRepository.findAll() : bookingRepository.findByOwnerId(ownerId);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ServicePackageBookingResponseDto redeemSession(String bookingId) {
        ServicePackageBooking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        if ("Completed".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Package already completed");
        }
        if (booking.getRemainingSessions() <= 0) {
            throw new BadRequestException("No remaining sessions to redeem");
        }
        booking.setCompletedSessions(booking.getCompletedSessions() + 1);
        booking.setRemainingSessions(booking.getRemainingSessions() - 1);
        if (booking.getRemainingSessions() == 0) {
            booking.setStatus("Completed");
        }
        bookingRepository.save(booking);
        log.info("Redeemed session for booking {}. Remaining: {}", bookingId, booking.getRemainingSessions());
        return mapToResponse(booking);
    }

    private ServicePackageBookingResponseDto mapToResponse(ServicePackageBooking booking) {
        ServicePackageBookingResponseDto dto = new ServicePackageBookingResponseDto();
        dto.setBookingId(booking.getBookingId());
        dto.setOwnerId(booking.getOwnerId());
        dto.setOwnerName(booking.getOwnerName());
        dto.setPetId(booking.getPetId());
        dto.setPetName(booking.getPetName());
        dto.setPackageId(booking.getPackageId());
        dto.setPackageName(booking.getPackageName());
        dto.setTotalSessions(booking.getTotalSessions());
        dto.setCompletedSessions(booking.getCompletedSessions());
        dto.setRemainingSessions(booking.getRemainingSessions());
        dto.setPurchaseDate(booking.getPurchaseDate());
        dto.setExpiryDate(booking.getExpiryDate());
        dto.setStatus(booking.getStatus());
        return dto;
    }
}
