package com.petnexus.backend.service;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.patterns.strategy.FeeCalculationContext;
import com.petnexus.backend.patterns.strategy.FeeCalculationStrategy;
import com.petnexus.backend.security.SecurityUtils;
import com.petnexus.backend.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final FeeCalculationContext feeCalculationContext;
    private final NotificationService notificationService;
    private final Clock clock;

    private static final List<AppointmentStatus> EXCLUDED_CONFLICT_STATUSES = List.of(
            AppointmentStatus.Cancelled,
            AppointmentStatus.NoShow
    );

    /**
     * Appointment status workflow. A status can only move along these edges
     * (setting the same status again is a harmless no-op). Completed, Cancelled and NoShow are final.
     */
    private static final Map<AppointmentStatus, Set<AppointmentStatus>> ALLOWED_STATUS_TRANSITIONS = Map.of(
            AppointmentStatus.Scheduled, Set.of(AppointmentStatus.Confirmed, AppointmentStatus.CheckedIn,
                    AppointmentStatus.Cancelled, AppointmentStatus.NoShow),
            AppointmentStatus.Pending, Set.of(AppointmentStatus.Confirmed, AppointmentStatus.CheckedIn,
                    AppointmentStatus.Cancelled, AppointmentStatus.NoShow),
            AppointmentStatus.Confirmed, Set.of(AppointmentStatus.CheckedIn, AppointmentStatus.Cancelled,
                    AppointmentStatus.NoShow),
            AppointmentStatus.CheckedIn, Set.of(AppointmentStatus.InRoom, AppointmentStatus.Completed,
                    AppointmentStatus.Cancelled, AppointmentStatus.NoShow),
            AppointmentStatus.InRoom, Set.of(AppointmentStatus.Completed),
            AppointmentStatus.Completed, Set.of(),
            AppointmentStatus.Cancelled, Set.of(),
            AppointmentStatus.NoShow, Set.of()
    );

    private static final java.time.format.DateTimeFormatter SLOT_FORMAT =
            java.time.format.DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private static final List<String> STANDARD_SLOTS = List.of(
            "09:00 AM",
            "09:30 AM",
            "10:00 AM",
            "10:30 AM",
            "11:00 AM",
            "02:00 PM",
            "02:30 PM",
            "03:00 PM",
            "03:30 PM",
            "04:00 PM",
            "04:30 PM"
    );

    // =========================================================================
    // Retrieval Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointments(String ownerId, String vetId, String statusStr, LocalDate date) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null) {
            if (currentUser.getRole() == UserRole.PetOwner) {
                ownerId = currentUser.getUserId(); // Force owner view
            } else if (currentUser.getRole() == UserRole.Veterinarian) {
                vetId = currentUser.getUserId(); // Force vet view
            } else {
                SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff, UserRole.PetCareProvider);
            }
        }

        AppointmentStatus status = parseStatus(statusStr);
        String cleanOwnerId = (ownerId != null && !ownerId.trim().isEmpty()) ? ownerId.trim() : null;
        String cleanVetId = (vetId != null && !vetId.trim().isEmpty()) ? vetId.trim() : null;

        List<Appointment> list = appointmentRepository.findWithFilters(cleanOwnerId, cleanVetId, status, date);
        return list.stream().map(AppointmentResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(String appointmentId, String callerOwnerId) {
        Appointment appt = findByAppointmentIdOrThrow(appointmentId);

        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null) {
            if (currentUser.getRole() == UserRole.PetOwner) {
                SecurityUtils.enforceOwnershipOrRole(appt.getOwnerId());
            } else if (currentUser.getRole() == UserRole.Veterinarian) {
                if (appt.getVetId() != null && !appt.getVetId().equals(currentUser.getUserId())) {
                    throw new BadRequestException("Access denied: Veterinarian cannot view other veterinarians' appointments.");
                }
            } else {
                SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
            }
        }

        return AppointmentResponse.from(appt);
    }

    // =========================================================================
    // Booking Operations
    // =========================================================================

    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.PetOwner) {
            request.setOwnerId(currentUser.getUserId());
        } else {
            SecurityUtils.enforceOwnershipOrRole(request.getOwnerId(), UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
        }

        // 1. Verify Pet exists
        Pet pet = petRepository.findByPetId(request.getPetId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + request.getPetId()));

        // 2. Verify Owner exists
        User owner = userRepository.findByUserId(request.getOwnerId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + request.getOwnerId()));

        // 3. Authorization / Ownership: Verify the pet actually belongs to this owner
        if (pet.getOwner() != null && !pet.getOwner().getUserId().equalsIgnoreCase(owner.getUserId())) {
            throw new BadRequestException("Validation error: Pet " + pet.getName() + " (" + pet.getPetId() + ") does not belong to owner " + owner.getUserId() + ".");
        }

        // 4. Validate appointment date is not in past
        if (request.getAppointmentDate().isBefore(LocalDate.now(clock))) {
            throw new BadRequestException("Cannot book an appointment for a date in the past.");
        }
        validateClinicSlot(request.getAppointmentDate(), request.getTimeSlot());

        // Serialise concurrent bookings for this vet and pet: the rows are locked until this transaction commits,
        // so the check-then-insert below cannot be raced by a second request.
        lockSchedule(request.getVetId(), pet.getPetId());

        // 5. Double-Booking Prevention: Check if Vet is already booked for date & time slot
        List<Appointment> vetConflicts = appointmentRepository.findVetConflicts(
                request.getAppointmentDate(),
                request.getTimeSlot().trim(),
                request.getVetId() != null ? request.getVetId().trim() : null,
                request.getVetName().trim(),
                EXCLUDED_CONFLICT_STATUSES
        );
        if (!vetConflicts.isEmpty()) {
            throw new BadRequestException("The selected time slot (" + request.getTimeSlot() + ") on " +
                    request.getAppointmentDate() + " is already booked with " + request.getVetName() +
                    ". Please choose a different time or doctor.");
        }

        // 6. Double-Booking Prevention: Check if Pet already has an appointment for date & time slot
        List<Appointment> petConflicts = appointmentRepository.findPetConflicts(
                request.getAppointmentDate(),
                request.getTimeSlot().trim(),
                pet.getPetId(),
                EXCLUDED_CONFLICT_STATUSES
        );
        if (!petConflicts.isEmpty()) {
            throw new BadRequestException("Pet " + pet.getName() + " already has an appointment booked at " +
                    request.getTimeSlot() + " on " + request.getAppointmentDate() + ".");
        }

        // 7. Find optional Vet User entity
        User vetUser = null;
        if (request.getVetId() != null && !request.getVetId().trim().isEmpty()) {
            vetUser = userRepository.findByUserId(request.getVetId().trim()).orElse(null);
        }

        // 8. Generate unique IDs and build appointment
        String newAppointmentId = generateAppointmentId();
        String token = generateScheduledToken();
        FeeQuote quote = quoteFee(request.getServiceType(), pet, owner, null);

        Appointment appt = Appointment.builder()
                .appointmentId(newAppointmentId)
                .pet(pet)
                .petId(pet.getPetId())
                .petName(request.getPetName() != null && !request.getPetName().trim().isEmpty() ? request.getPetName().trim() : pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .owner(owner)
                .ownerId(owner.getUserId())
                .ownerName(request.getOwnerName() != null && !request.getOwnerName().trim().isEmpty() ? request.getOwnerName().trim() : owner.getFullName())
                .ownerPhone(request.getOwnerPhone() != null && !request.getOwnerPhone().trim().isEmpty() ? request.getOwnerPhone().trim() : owner.getPhone())
                .veterinarian(vetUser)
                .vetId(request.getVetId())
                .vetName(request.getVetName().trim())
                .serviceType(request.getServiceType().trim())
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot().trim())
                .status(AppointmentStatus.Scheduled)
                .tokenNumber(token)
                .reason(request.getReason())
                .symptoms(request.getSymptoms() != null ? request.getSymptoms() : "Normal energy levels")
                .notes(request.getNotes() != null ? request.getNotes() : "")
                .consultationFee(quote.fee())
                .feeStrategy(quote.strategyName())
                .build();

        Appointment saved = appointmentRepository.save(appt);
        log.info("Appointment booked: {} for pet {} with vet {} (fee {} via {})",
                saved.getAppointmentId(), saved.getPetId(), saved.getVetName(), quote.fee(), quote.strategyName());
        notificationService.notifyAppointment(saved, saved.getStatus().name());
        return AppointmentResponse.from(saved);
    }

    // =========================================================================
    // Walk-In Patient Registration (Front Desk / Staff)
    // =========================================================================

    @Transactional
    public AppointmentResponse registerWalkIn(WalkInRequest request) {
        SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);

        String newAppointmentId = generateAppointmentId();
        String token = generateWalkInToken();

        LocalDate apptDate = request.getAppointmentDate() != null ? request.getAppointmentDate() : LocalDate.now();
        String timeSlot = (request.getTimeSlot() != null && !request.getTimeSlot().trim().isEmpty())
                ? request.getTimeSlot().trim()
                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));

        String notes = request.getNotes() != null ? request.getNotes() : "";
        if (request.getSeverity() != null && !request.getSeverity().trim().isEmpty()) {
            notes = ("Walk-in severity marked: " + request.getSeverity().trim() + (notes.isEmpty() ? "" : ". " + notes)).trim();
        }

        User vetUser = null;
        if (request.getVetId() != null && !request.getVetId().trim().isEmpty()) {
            vetUser = userRepository.findByUserId(request.getVetId().trim()).orElse(null);
        }

        com.petnexus.backend.entity.Pet pet = null;
        if (request.getPetId() != null && !request.getPetId().trim().isEmpty()) {
            pet = petRepository.findByPetId(request.getPetId().trim()).orElse(null);
        }

        User owner = null;
        if (request.getOwnerId() != null && !request.getOwnerId().trim().isEmpty()) {
            owner = userRepository.findByUserId(request.getOwnerId().trim()).orElse(null);
        } else if (pet != null && pet.getOwner() != null) {
            owner = pet.getOwner();
        }

        FeeQuote quote = quoteFee(request.getServiceType(), pet, owner, request.getSeverity());

        Appointment appt = Appointment.builder()
                .appointmentId(newAppointmentId)
                .pet(pet)
                .petId(pet != null ? pet.getPetId() : request.getPetId())
                .petName(request.getPetName().trim())
                .species(request.getSpecies() != null ? request.getSpecies() : (pet != null ? pet.getSpecies() : null))
                .breed(request.getBreed() != null ? request.getBreed() : (pet != null ? pet.getBreed() : null))
                .owner(owner)
                .ownerId(owner != null ? owner.getUserId() : request.getOwnerId())
                .ownerName(request.getOwnerName().trim())
                .ownerPhone(request.getOwnerPhone() != null ? request.getOwnerPhone() : (owner != null ? owner.getPhone() : null))
                .veterinarian(vetUser)
                .vetId(request.getVetId())
                .vetName(request.getVetName().trim())
                .serviceType(request.getServiceType().trim())
                .appointmentDate(apptDate)
                .timeSlot(timeSlot)
                .status(AppointmentStatus.CheckedIn)
                .tokenNumber(token)
                .reason(request.getReason())
                .symptoms(request.getSymptoms())
                .notes(notes)
                .consultationFee(quote.fee())
                .feeStrategy(quote.strategyName())
                .build();

        Appointment saved = appointmentRepository.save(appt);
        log.info("Walk-in appointment registered: {} (Token: {}) for {} (fee {} via {})",
                saved.getAppointmentId(), token, saved.getPetName(), quote.fee(), quote.strategyName());
        notificationService.notifyAppointment(saved, saved.getStatus().name());
        return AppointmentResponse.from(saved);
    }

    // =========================================================================
    // Staff Queue / Status Operations
    // =========================================================================

    @Transactional
    public AppointmentResponse confirmAppointment(String appointmentId) {
        SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);

        Appointment appt = findByAppointmentIdOrThrow(appointmentId);

        // New bookings start as Scheduled; Pending covers requests created by other channels.
        if (appt.getStatus() != AppointmentStatus.Pending && appt.getStatus() != AppointmentStatus.Scheduled) {
            throw new BadRequestException("Appointments with status \"" + appt.getStatus() + "\" cannot be confirmed.");
        }

        appt.setStatus(AppointmentStatus.Confirmed);
        appt.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appt);
        log.info("Appointment confirmed: {}", appointmentId);
        notificationService.notifyAppointment(saved, saved.getStatus().name());
        return AppointmentResponse.from(saved);
    }

    @Transactional
    public AppointmentResponse updateStatus(String appointmentId, String newStatusStr) {
        SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff, UserRole.Veterinarian);

        Appointment appt = findByAppointmentIdOrThrow(appointmentId);
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.Veterinarian) {
            if (appt.getVetId() != null && !appt.getVetId().equals(currentUser.getUserId())) {
                throw new BadRequestException("Veterinarians can only update their own appointments.");
            }
        }

        AppointmentStatus newStatus = parseStatus(newStatusStr);
        if (newStatus == null) {
            throw new BadRequestException("Invalid appointment status: " + newStatusStr);
        }

        if (newStatus != appt.getStatus()
                && !ALLOWED_STATUS_TRANSITIONS.getOrDefault(appt.getStatus(), Set.of()).contains(newStatus)) {
            throw new BadRequestException("Appointment cannot move from " + appt.getStatus() + " to " + newStatus
                    + ". Allowed: " + ALLOWED_STATUS_TRANSITIONS.getOrDefault(appt.getStatus(), Set.of()) + ".");
        }

        appt.setStatus(newStatus);
        appt.setUpdatedAt(LocalDateTime.now());
        Appointment saved = appointmentRepository.save(appt);
        log.info("Appointment {} status updated to {}", appointmentId, newStatus);
        return AppointmentResponse.from(saved);
    }

    // =========================================================================
    // Reschedule Operations
    // =========================================================================

    @Transactional
    public AppointmentResponse rescheduleAppointment(String appointmentId, RescheduleRequest request, String callerOwnerId) {
        Appointment appt = findByAppointmentIdOrThrow(appointmentId);

        // Authorization check
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null) {
            if (currentUser.getRole() == UserRole.PetOwner) {
                SecurityUtils.enforceOwnershipOrRole(appt.getOwnerId());
            } else {
                SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
            }
        }

        // Eligible statuses for reschedule
        Set<AppointmentStatus> eligibleStatuses = Set.of(
                AppointmentStatus.Scheduled,
                AppointmentStatus.Confirmed,
                AppointmentStatus.Pending
        );
        if (!eligibleStatuses.contains(appt.getStatus())) {
            throw new BadRequestException("Appointments with status \"" + appt.getStatus() + "\" cannot be rescheduled.");
        }

        // Validate date
        if (request.getAppointmentDate().isBefore(LocalDate.now(clock))) {
            throw new BadRequestException("Cannot reschedule an appointment to a date in the past.");
        }
        validateClinicSlot(request.getAppointmentDate(), request.getTimeSlot());

        String effectiveVetName = (request.getVetName() != null && !request.getVetName().trim().isEmpty())
                ? request.getVetName().trim()
                : appt.getVetName();

        String effectiveVetId = (request.getVetId() != null && !request.getVetId().trim().isEmpty())
                ? request.getVetId().trim()
                : appt.getVetId();

        lockSchedule(effectiveVetId, appt.getPetId());

        // Double-Booking Check: Conflict for vet excluding this appointment
        List<Appointment> vetConflicts = appointmentRepository.findVetConflictsExcluding(
                request.getAppointmentDate(),
                request.getTimeSlot().trim(),
                effectiveVetId,
                effectiveVetName,
                EXCLUDED_CONFLICT_STATUSES,
                appt.getAppointmentId()
        );
        if (!vetConflicts.isEmpty()) {
            throw new BadRequestException("The selected time slot (" + request.getTimeSlot() + ") on " +
                    request.getAppointmentDate() + " is already booked with " + effectiveVetName +
                    ". Please choose a different time or doctor.");
        }

        // Double-Booking Check: Conflict for pet excluding this appointment
        if (appt.getPetId() != null) {
            List<Appointment> petConflicts = appointmentRepository.findPetConflictsExcluding(
                    request.getAppointmentDate(),
                    request.getTimeSlot().trim(),
                    appt.getPetId(),
                    EXCLUDED_CONFLICT_STATUSES,
                    appt.getAppointmentId()
            );
            if (!petConflicts.isEmpty()) {
                throw new BadRequestException("Pet already has an appointment booked at " +
                        request.getTimeSlot() + " on " + request.getAppointmentDate() + ".");
            }
        }

        // Record reschedule audit history
        appt.setRescheduledFromDate(appt.getAppointmentDate());
        appt.setRescheduledFromTimeSlot(appt.getTimeSlot());
        appt.setRescheduledFromVetName(appt.getVetName());
        appt.setRescheduleReason(request.getRescheduleReason());

        // Update to new schedule
        appt.setAppointmentDate(request.getAppointmentDate());
        appt.setTimeSlot(request.getTimeSlot().trim());
        appt.setVetName(effectiveVetName);
        appt.setVetId(effectiveVetId);
        appt.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appt);
        log.info("Appointment {} rescheduled to {} at {} with {}", appointmentId, request.getAppointmentDate(), request.getTimeSlot(), effectiveVetName);
        notificationService.notifyAppointment(saved, "Rescheduled");
        return AppointmentResponse.from(saved);
    }

    // =========================================================================
    // Cancellation Operations
    // =========================================================================

    @Transactional
    public AppointmentResponse cancelAppointment(String appointmentId, CancelRequest request, String callerOwnerId) {
        Appointment appt = findByAppointmentIdOrThrow(appointmentId);

        // Authorization check
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null) {
            if (currentUser.getRole() == UserRole.PetOwner) {
                SecurityUtils.enforceOwnershipOrRole(appt.getOwnerId());
            } else {
                SecurityUtils.enforceOwnershipOrRole(null, UserRole.Admin, UserRole.ClinicManager, UserRole.ClinicStaff);
            }
        }

        if (appt.getStatus() == AppointmentStatus.Cancelled) {
            throw new BadRequestException("This appointment has already been cancelled.");
        }

        if (appt.getStatus() == AppointmentStatus.Completed || appt.getStatus() == AppointmentStatus.InRoom) {
            throw new BadRequestException("Cannot cancel an appointment with status \"" + appt.getStatus() + "\".");
        }

        String reason = (request != null && request.getCancellationReason() != null && !request.getCancellationReason().trim().isEmpty())
                ? request.getCancellationReason().trim()
                : "Cancelled by Pet Owner";

        appt.setStatus(AppointmentStatus.Cancelled);
        appt.setCancellationReason(reason);
        appt.setCancelledAt(LocalDateTime.now());
        appt.setUpdatedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appt);
        log.info("Appointment {} cancelled. Reason: {}", appointmentId, reason);
        notificationService.notifyAppointment(saved, saved.getStatus().name());
        return AppointmentResponse.from(saved);
    }

    // =========================================================================
    // Availability Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<SlotAvailabilityResponse> getAvailableSlots(String vetName, LocalDate date, String excludeAppointmentId) {
        String cleanVet = (vetName != null && !vetName.trim().isEmpty()) ? vetName.trim() : null;
        List<Appointment> active = appointmentRepository.findActiveForDateAndVet(date, cleanVet, EXCLUDED_CONFLICT_STATUSES);

        Set<String> bookedSlots = new HashSet<>();
        for (Appointment a : active) {
            if (excludeAppointmentId != null && a.getAppointmentId().equalsIgnoreCase(excludeAppointmentId.trim())) {
                continue;
            }
            bookedSlots.add(a.getTimeSlot());
        }

        return STANDARD_SLOTS.stream()
                .map(slot -> new SlotAvailabilityResponse(slot, !bookedSlots.contains(slot)))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    // =========================================================================
    // Fee calculation (Strategy pattern)
    // =========================================================================

    /** Fee plus the name of the strategy that produced it, stored on the appointment. */
    private record FeeQuote(java.math.BigDecimal fee, String strategyName) {}

    /**
     * Quotes the consultation fee by delegating to {@link FeeCalculationContext}.
     * This service only gathers the facts (base price, pet age, emergency, rescue);
     * choosing and applying the pricing rule is the strategy's job.
     */
    private FeeQuote quoteFee(String serviceType, Pet pet, User owner, String severity) {
        String type = serviceType != null ? serviceType.toLowerCase() : "";

        boolean emergency = type.contains("emergency")
                || (severity != null && (severity.equalsIgnoreCase("High") || severity.equalsIgnoreCase("Critical")));
        // Animals registered to the rescue organisation are covered by the welfare subsidy
        boolean rescueAnimal = type.contains("rescue")
                || (owner != null && owner.getRole() == UserRole.RescueOfficer);

        int ageYears = 0;
        if (pet != null) {
            if (pet.getAgeYears() != null) {
                ageYears = pet.getAgeYears();
            } else if (pet.getDateOfBirth() != null) {
                ageYears = java.time.Period.between(pet.getDateOfBirth(), LocalDate.now()).getYears();
            }
        }

        FeeCalculationStrategy strategy = feeCalculationContext.resolveStrategy(ageYears, emergency, rescueAnimal);
        double fee = strategy.calculateFee(baseFeeFor(type), ageYears, emergency, rescueAnimal);
        return new FeeQuote(java.math.BigDecimal.valueOf(fee).setScale(2, java.math.RoundingMode.HALF_UP),
                strategy.getStrategyName());
    }

    /** Clinic price list: base fee in LKR before any strategy adjustment. */
    private double baseFeeFor(String lowerCaseServiceType) {
        if (lowerCaseServiceType.contains("surgery")) return 25000.00;
        if (lowerCaseServiceType.contains("dental")) return 7500.00;
        if (lowerCaseServiceType.contains("emergency")) return 5000.00;
        if (lowerCaseServiceType.contains("vaccin")) return 2500.00;
        return 3500.00;
    }

    /**
     * Appointments can only be placed on the clinic's published working-hour slots,
     * and a slot whose time has already passed today cannot be booked.
     */
    private void validateClinicSlot(LocalDate date, String timeSlot) {
        if (timeSlot == null || !STANDARD_SLOTS.contains(timeSlot.trim())) {
            throw new BadRequestException("Time slot \"" + timeSlot + "\" is outside clinic hours. Available slots: "
                    + String.join(", ", STANDARD_SLOTS));
        }
        if (date != null && date.equals(LocalDate.now(clock))) {
            LocalTime slotTime = LocalTime.parse(timeSlot.trim(), SLOT_FORMAT);
            if (!slotTime.isAfter(LocalTime.now(clock))) {
                throw new BadRequestException("The " + timeSlot.trim() + " slot has already passed today. "
                        + "Please choose a later slot or another day.");
            }
        }
    }

    /** Locks the vet's and the pet's rows (database write lock) until the current transaction ends. */
    private void lockSchedule(String vetId, String petId) {
        if (vetId != null && !vetId.trim().isEmpty()) {
            userRepository.findByUserIdForUpdate(vetId.trim());
        }
        if (petId != null && !petId.trim().isEmpty()) {
            petRepository.findByPetIdForUpdate(petId.trim());
        }
    }

    private Appointment findByAppointmentIdOrThrow(String appointmentId) {
        return appointmentRepository.findByAppointmentId(appointmentId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));
    }

    private String generateAppointmentId() {
        long count = appointmentRepository.count() + 1001;
        String candidate;
        do {
            candidate = "APT-" + count++;
        } while (appointmentRepository.existsByAppointmentId(candidate));
        return candidate;
    }

    private String generateScheduledToken() {
        long count = appointmentRepository.countByTokenNumberStartingWith("A-") + 1;
        return "A-" + String.format("%02d", count);
    }

    private String generateWalkInToken() {
        long count = appointmentRepository.countByTokenNumberStartingWith("W-") + 1;
        return "W-" + String.format("%02d", count);
    }

    private AppointmentStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.trim().isEmpty() || statusStr.equalsIgnoreCase("ALL")) {
            return null;
        }
        for (AppointmentStatus s : AppointmentStatus.values()) {
            if (s.name().equalsIgnoreCase(statusStr.trim())) {
                return s;
            }
        }
        return null;
    }
}
