package com.petnexus.backend.service;

import com.petnexus.backend.dto.PackageBookingCreateRequest;
import com.petnexus.backend.dto.ServicePackageBookingResponseDto;
import com.petnexus.backend.entity.CareService;
import com.petnexus.backend.entity.ServicePackageBooking;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.security.SecurityUtils;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.CareServiceRepository;
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
    private final CareServiceRepository careServiceRepository;

    @Transactional
    public ServicePackageBookingResponseDto createBooking(PackageBookingCreateRequest request) {
        // A pet owner can only buy a package for themselves, whatever ownerId the request carries
        User current = SecurityUtils.getCurrentUser();
        if (current != null && current.getRole() == UserRole.PetOwner) {
            request.setOwnerId(current.getUserId());
        }

        // The package must exist in the catalogue and be on sale; its catalogue name is what gets recorded
        String packageName = request.getPackageName();
        if (request.getPackageId() != null && !request.getPackageId().isBlank()) {
            CareService catalogue = careServiceRepository.findByServiceId(request.getPackageId().trim())
                    .orElseThrow(() -> new BadRequestException("Package not found: " + request.getPackageId()));
            if (!catalogue.isActive()) {
                throw new BadRequestException("This package is not currently available.");
            }
            packageName = catalogue.getName();
        }

        // Bookings past their one-year validity are closed first, so they never block a new purchase
        expireStale(bookingRepository.findByOwnerId(request.getOwnerId()));

        // Ensure uniqueness: owner cannot have an active booking with same package name
        if (bookingRepository.existsByOwnerIdAndPackageNameAndStatus(request.getOwnerId(), packageName, "Active")) {
            throw new BadRequestException("Owner already has an active booking for this package");
        }
        ServicePackageBooking booking = ServicePackageBooking.builder()
                .bookingId(generateBookingId())
                .ownerId(request.getOwnerId())
                .ownerName(request.getOwnerName())
                .petId(request.getPetId())
                .petName(request.getPetName())
                .packageId(request.getPackageId())
                .packageName(packageName)
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

    @Transactional
    public List<ServicePackageBookingResponseDto> listBookings(String ownerId) {
        // Pet owners only ever see their own bookings; staff roles may list all or filter by owner
        User current = SecurityUtils.getCurrentUser();
        if (current != null && current.getRole() == UserRole.PetOwner) {
            ownerId = current.getUserId();
        }
        List<ServicePackageBooking> bookings = (ownerId == null) ?
                bookingRepository.findAll() : bookingRepository.findByOwnerId(ownerId);
        expireStale(bookings);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /** Marks Active bookings whose validity date has passed as Expired (done lazily, no scheduler needed). */
    private void expireStale(List<ServicePackageBooking> bookings) {
        LocalDate today = LocalDate.now();
        for (ServicePackageBooking b : bookings) {
            if ("Active".equalsIgnoreCase(b.getStatus()) && b.getExpiryDate() != null && b.getExpiryDate().isBefore(today)) {
                b.setStatus("Expired");
                bookingRepository.save(b);
            }
        }
    }

    private String generateBookingId() {
        long next = bookingRepository.count() + 1;
        String candidate;
        do {
            candidate = String.format("PKB-%06d", next++);
        } while (bookingRepository.existsByBookingId(candidate));
        return candidate;
    }

    @Transactional
    public ServicePackageBookingResponseDto redeemSession(String bookingId) {
        ServicePackageBooking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        expireStale(List.of(booking));
        if ("Expired".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("This package has expired");
        }
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
