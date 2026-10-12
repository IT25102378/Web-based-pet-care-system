package com.petnexus.backend.whitebox;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.patterns.strategy.*;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.service.AppointmentService;
import com.petnexus.backend.service.NotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * WHITE-BOX: AppointmentService - every decision in book / walk-in / confirm / status /
 * reschedule / cancel / availability is driven down both its true and false branch.
 */
class WB1_AppointmentServicePathsTest {

    private AppointmentRepository appointments;
    private PetRepository pets;
    private UserRepository users;
    private NotificationService notifications;
    private AppointmentService service;

    private User owner;
    private Pet pet;

    @BeforeEach
    void setUp() {
        appointments = mock(AppointmentRepository.class);
        pets = mock(PetRepository.class);
        users = mock(UserRepository.class);
        notifications = mock(NotificationService.class);
        StandardConsultationStrategy standard = new StandardConsultationStrategy();
        FeeCalculationContext fee = new FeeCalculationContext(
                List.of(standard, new EmergencyTriageStrategy(), new SeniorPetDiscountStrategy(), new RescueAnimalWelfareStrategy()),
                standard);
        service = new AppointmentService(appointments, pets, users, fee, notifications);

        owner = User.builder().userId("USR-001").fullName("Owner One").phone("0771234567").role(UserRole.PetOwner).build();
        pet = Pet.builder().petId("PET-1").name("Bella").species("Dog").breed("Lab").owner(owner).ageYears(3).build();

        when(pets.findByPetId("PET-1")).thenReturn(Optional.of(pet));
        when(users.findByUserId("USR-001")).thenReturn(Optional.of(owner));
        when(appointments.findVetConflicts(any(), any(), any(), any(), any())).thenReturn(List.of());
        when(appointments.findPetConflicts(any(), any(), any(), any())).thenReturn(List.of());
        when(appointments.save(any(Appointment.class))).thenAnswer(i -> i.getArgument(0));
        when(appointments.count()).thenReturn(0L);
        authenticate(owner);
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(User u) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u, null, List.of()));
    }

    private User user(String id, UserRole role) {
        return User.builder().userId(id).fullName(id).role(role).build();
    }

    private AppointmentRequest request() {
        return AppointmentRequest.builder().petId("PET-1").ownerId("USR-001").vetId("USR-002")
                .vetName("Dr. Chen").serviceType("Checkup").appointmentDate(LocalDate.now().plusDays(3))
                .timeSlot("09:00 AM").reason("Routine visit").build();
    }

    private Appointment existing(AppointmentStatus status) {
        return Appointment.builder().appointmentId("APT-1").petId("PET-1").ownerId("USR-001").owner(owner)
                .vetId("USR-002").vetName("Dr. Chen").appointmentDate(LocalDate.now().plusDays(3))
                .timeSlot("09:00 AM").status(status).build();
    }

    private void found(Appointment a) {
        when(appointments.findByAppointmentId(a.getAppointmentId())).thenReturn(Optional.of(a));
    }

    // ------------------------------------------------------------------ bookAppointment

    @Test
    @DisplayName("book: caller is a PetOwner -> ownerId is overwritten with the caller's id")
    void bookOverridesOwnerId() {
        AppointmentRequest r = request();
        r.setOwnerId("USR-OTHER");
        AppointmentResponse res = service.bookAppointment(r);
        assertEquals("USR-001", res.getOwnerId());
        assertEquals("Scheduled", res.getStatus());
        verify(notifications).notifyAppointment(any(), eq("Scheduled"));
    }

    @Test
    @DisplayName("book: caller is clinic staff -> allowed for any owner")
    void bookByStaff() {
        authenticate(user("USR-003", UserRole.ClinicStaff));
        assertEquals("USR-001", service.bookAppointment(request()).getOwnerId());
    }

    @Test
    @DisplayName("book: caller is a vet booking for someone else -> AccessDenied")
    void bookByVetDenied() {
        authenticate(user("USR-002", UserRole.Veterinarian));
        assertThrows(AccessDeniedException.class, () -> service.bookAppointment(request()));
    }

    @Test
    @DisplayName("book: unknown pet -> ResourceNotFound")
    void bookUnknownPet() {
        when(pets.findByPetId("PET-1")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.bookAppointment(request()));
    }

    @Test
    @DisplayName("book: unknown owner -> ResourceNotFound")
    void bookUnknownOwner() {
        authenticate(user("USR-003", UserRole.ClinicStaff));
        AppointmentRequest r = request();
        r.setOwnerId("USR-404");
        assertThrows(ResourceNotFoundException.class, () -> service.bookAppointment(r));
    }

    @Test
    @DisplayName("book: pet belongs to a different owner -> BadRequest")
    void bookPetOwnerMismatch() {
        pet.setOwner(user("USR-099", UserRole.PetOwner));
        assertThrows(BadRequestException.class, () -> service.bookAppointment(request()));
    }

    @Test
    @DisplayName("book: pet without an owner (walk-in style record) skips the ownership check")
    void bookPetWithoutOwner() {
        pet.setOwner(null);
        assertDoesNotThrow(() -> service.bookAppointment(request()));
    }

    @Test
    @DisplayName("book: past date -> BadRequest; today is accepted")
    void bookDateBoundary() {
        AppointmentRequest r = request();
        r.setAppointmentDate(LocalDate.now().minusDays(1));
        assertThrows(BadRequestException.class, () -> service.bookAppointment(r));
        r.setAppointmentDate(LocalDate.now());
        assertDoesNotThrow(() -> service.bookAppointment(r));
    }

    @Test
    @DisplayName("book / reschedule: only the published clinic slots are accepted (null, blank, off-hours rejected)")
    void clinicSlotValidation() {
        for (String bad : new String[]{null, "", "  ", "03:17 AM", "9:00", "12:00 PM", "05:00 PM"}) {
            AppointmentRequest r = request();
            r.setTimeSlot(bad);
            assertThrows(BadRequestException.class, () -> service.bookAppointment(r), "book " + bad);
        }
        for (String good : new String[]{"09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM", " 09:30 AM "}) {
            AppointmentRequest r = request();
            r.setTimeSlot(good);
            assertDoesNotThrow(() -> service.bookAppointment(r), "book " + good);
        }
        found(existing(AppointmentStatus.Scheduled));
        assertThrows(BadRequestException.class,
                () -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().plusDays(5), "03:17 AM"), null));
    }

    @Test
    @DisplayName("book: vet conflict -> BadRequest naming the vet")
    void bookVetConflict() {
        when(appointments.findVetConflicts(any(), any(), any(), any(), any())).thenReturn(List.of(existing(AppointmentStatus.Scheduled)));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.bookAppointment(request()));
        assertTrue(ex.getMessage().contains("Dr. Chen"));
    }

    @Test
    @DisplayName("book: pet conflict -> BadRequest")
    void bookPetConflict() {
        when(appointments.findPetConflicts(any(), any(), any(), any())).thenReturn(List.of(existing(AppointmentStatus.Scheduled)));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.bookAppointment(request()));
        assertTrue(ex.getMessage().contains("Bella"));
    }

    @Test
    @DisplayName("book: blank vetId -> no vet user lookup; conflict is matched by vet name instead of id")
    void bookWithoutVetId() {
        AppointmentRequest r = request();
        r.setVetId("  ");
        service.bookAppointment(r);
        verify(users, never()).findByUserId("  ");
        verify(appointments).findVetConflicts(any(), any(), eq(""), eq("Dr. Chen"), any());
    }

    @Test
    @DisplayName("book: optional petName / symptoms / notes defaults vs overrides")
    void bookOptionalFields() {
        AppointmentResponse defaults = service.bookAppointment(request());
        assertEquals("Bella", defaults.getPetName());
        assertEquals("Normal energy levels", defaults.getSymptoms());

        AppointmentRequest r = request();
        r.setPetName("Bellie");
        r.setSymptoms("Coughing");
        r.setNotes("Bring records");
        AppointmentResponse custom = service.bookAppointment(r);
        assertEquals("Bellie", custom.getPetName());
        assertEquals("Coughing", custom.getSymptoms());
        assertEquals("Bring records", custom.getNotes());
    }

    // ------------------------------------------------------------------ fee branches (Strategy wiring)

    @Test
    @DisplayName("fee: age from date of birth when ageYears is null (senior discount)")
    void feeAgeFromDob() {
        pet.setAgeYears(null);
        pet.setDateOfBirth(LocalDate.now().minusYears(9));
        assertEquals("SENIOR_PET_DISCOUNT", service.bookAppointment(request()).getFeeStrategy());
    }

    @Test
    @DisplayName("fee: no age information at all -> treated as young, standard fee")
    void feeNoAge() {
        pet.setAgeYears(null);
        pet.setDateOfBirth(null);
        assertEquals("STANDARD", service.bookAppointment(request()).getFeeStrategy());
    }

    @Test
    @DisplayName("fee: age boundary 7 -> standard, 8 -> senior")
    void feeAgeBoundary() {
        pet.setAgeYears(7);
        assertEquals("STANDARD", service.bookAppointment(request()).getFeeStrategy());
        pet.setAgeYears(8);
        assertEquals("SENIOR_PET_DISCOUNT", service.bookAppointment(request()).getFeeStrategy());
    }

    @Test
    @DisplayName("fee: service type decides base price (surgery / dental / vaccination / emergency / default)")
    void feeBasePrices() {
        String[][] cases = {{"Surgery", "25000.00"}, {"Dental Cleaning", "7500.00"}, {"Vaccination", "2500.00"}, {"Checkup", "3500.00"}};
        for (String[] c : cases) {
            AppointmentRequest r = request();
            r.setServiceType(c[0]);
            assertEquals(c[1], service.bookAppointment(r).getConsultationFee().toPlainString(), c[0]);
        }
    }

    @Test
    @DisplayName("fee: rescue organisation owner and 'rescue' service type -> welfare strategy (0.00)")
    void feeRescue() {
        owner.setRole(UserRole.RescueOfficer);
        authenticate(user("USR-003", UserRole.ClinicStaff));
        assertEquals("RESCUE_WELFARE", service.bookAppointment(request()).getFeeStrategy());

        owner.setRole(UserRole.PetOwner);
        AppointmentRequest r = request();
        r.setServiceType("Rescue intake exam");
        assertEquals("RESCUE_WELFARE", service.bookAppointment(r).getFeeStrategy());
    }

    @Test
    @DisplayName("walk-in: High / Critical severity -> emergency triage; Low -> standard; staff-only")
    void walkInSeverity() {
        authenticate(user("USR-003", UserRole.ClinicStaff));
        WalkInRequest w = WalkInRequest.builder().ownerName("Walk In").petName("Rex").serviceType("Checkup")
                .vetName("Dr. Chen").reason("Limping badly").severity("Critical").build();
        assertEquals("EMERGENCY_TRIAGE", service.registerWalkIn(w).getFeeStrategy());
        w.setSeverity("High");
        assertEquals("EMERGENCY_TRIAGE", service.registerWalkIn(w).getFeeStrategy());
        w.setSeverity("Low");
        assertEquals("STANDARD", service.registerWalkIn(w).getFeeStrategy());

        authenticate(owner);
        assertThrows(AccessDeniedException.class, () -> service.registerWalkIn(w));
    }

    @Test
    @DisplayName("walk-in: pet known -> owner taken from pet; time slot defaults; severity folded into notes")
    void walkInDefaults() {
        authenticate(user("USR-003", UserRole.ClinicStaff));
        WalkInRequest w = WalkInRequest.builder().ownerName("Walk In").petName("Bella").petId("PET-1")
                .serviceType("Checkup").vetName("Dr. Chen").reason("Itchy skin").severity("Low").notes("Allergy?").build();
        AppointmentResponse res = service.registerWalkIn(w);
        assertEquals("USR-001", res.getOwnerId());
        assertEquals("CheckedIn", res.getStatus());
        assertNotNull(res.getTimeSlot());
        assertTrue(res.getNotes().startsWith("Walk-in severity marked: Low"));
        assertTrue(res.getNotes().contains("Allergy?"));
    }

    // ------------------------------------------------------------------ confirm / status

    @Test
    @DisplayName("confirm: Pending -> Confirmed; any other status -> BadRequest; not found -> 404")
    void confirmPaths() {
        authenticate(user("USR-003", UserRole.ClinicStaff));
        Appointment pending = existing(AppointmentStatus.Pending);
        found(pending);
        assertEquals("Confirmed", service.confirmAppointment("APT-1").getStatus());

        Appointment scheduled = existing(AppointmentStatus.Scheduled);
        found(scheduled);
        assertEquals("Confirmed", service.confirmAppointment("APT-1").getStatus());   // freshly booked

        for (AppointmentStatus s : new AppointmentStatus[]{AppointmentStatus.Confirmed, AppointmentStatus.CheckedIn,
                AppointmentStatus.InRoom, AppointmentStatus.Completed, AppointmentStatus.Cancelled, AppointmentStatus.NoShow}) {
            found(existing(s));
            assertThrows(BadRequestException.class, () -> service.confirmAppointment("APT-1"), s.name());
        }

        when(appointments.findByAppointmentId("APT-X")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.confirmAppointment("APT-X"));
    }

    @Test
    @DisplayName("updateStatus: vet may only touch own appointments; unknown status rejected; all-caps parsed")
    void updateStatusPaths() {
        found(existing(AppointmentStatus.Scheduled));

        authenticate(user("USR-099", UserRole.Veterinarian));
        assertThrows(BadRequestException.class, () -> service.updateStatus("APT-1", "CheckedIn"));

        authenticate(user("USR-002", UserRole.Veterinarian));
        assertEquals("InRoom", service.updateStatus("APT-1", "INROOM").getStatus());
        assertThrows(BadRequestException.class, () -> service.updateStatus("APT-1", "Banana"));
        assertThrows(BadRequestException.class, () -> service.updateStatus("APT-1", "ALL"));
    }

    // ------------------------------------------------------------------ reschedule

    private RescheduleRequest resched(LocalDate d, String slot) {
        return RescheduleRequest.builder().appointmentDate(d).timeSlot(slot).build();
    }

    @Test
    @DisplayName("reschedule: eligible statuses succeed (Scheduled, Confirmed, Pending); others rejected")
    void rescheduleEligibility() {
        for (AppointmentStatus s : AppointmentStatus.values()) {
            found(existing(s));
            boolean eligible = s == AppointmentStatus.Scheduled || s == AppointmentStatus.Confirmed || s == AppointmentStatus.Pending;
            if (eligible) {
                assertDoesNotThrow(() -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().plusDays(5), "10:00 AM"), null), s.name());
            } else {
                assertThrows(BadRequestException.class, () -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().plusDays(5), "10:00 AM"), null), s.name());
            }
        }
    }

    @Test
    @DisplayName("reschedule: past date, vet conflict, pet conflict, and pet-less appointment skips pet check")
    void rescheduleConflicts() {
        Appointment a = existing(AppointmentStatus.Scheduled);
        found(a);
        assertThrows(BadRequestException.class, () -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().minusDays(1), "10:00 AM"), null));

        when(appointments.findVetConflictsExcluding(any(), any(), any(), any(), any(), any())).thenReturn(List.of(existing(AppointmentStatus.Scheduled)));
        assertThrows(BadRequestException.class, () -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().plusDays(5), "10:00 AM"), null));

        when(appointments.findVetConflictsExcluding(any(), any(), any(), any(), any(), any())).thenReturn(List.of());
        when(appointments.findPetConflictsExcluding(any(), any(), any(), any(), any())).thenReturn(List.of(existing(AppointmentStatus.Scheduled)));
        assertThrows(BadRequestException.class, () -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().plusDays(5), "10:00 AM"), null));

        a.setPetId(null);   // no pet -> pet-conflict query must not be consulted
        assertDoesNotThrow(() -> service.rescheduleAppointment("APT-1", resched(LocalDate.now().plusDays(5), "10:00 AM"), null));
    }

    @Test
    @DisplayName("reschedule: audit fields hold the previous schedule; vet defaults to current vet; owner-only access")
    void rescheduleAuditAndAccess() {
        Appointment a = existing(AppointmentStatus.Scheduled);
        found(a);
        LocalDate oldDate = a.getAppointmentDate();
        AppointmentResponse res = service.rescheduleAppointment("APT-1", resched(oldDate.plusDays(2), "11:00 AM"), null);
        assertEquals(oldDate, res.getRescheduledFrom().getDate());
        assertEquals("09:00 AM", res.getRescheduledFrom().getTimeSlot());
        assertEquals("Dr. Chen", res.getVetName());

        authenticate(user("USR-099", UserRole.PetOwner));
        assertThrows(AccessDeniedException.class, () -> service.rescheduleAppointment("APT-1", resched(oldDate.plusDays(4), "11:00 AM"), null));
        authenticate(user("USR-002", UserRole.Veterinarian));
        assertThrows(AccessDeniedException.class, () -> service.rescheduleAppointment("APT-1", resched(oldDate.plusDays(4), "11:00 AM"), null));
    }

    // ------------------------------------------------------------------ cancel

    @Test
    @DisplayName("cancel: already cancelled, completed, in-room are rejected; others cancel with default or given reason")
    void cancelPaths() {
        found(existing(AppointmentStatus.Cancelled));
        assertThrows(BadRequestException.class, () -> service.cancelAppointment("APT-1", null, null));
        found(existing(AppointmentStatus.Completed));
        assertThrows(BadRequestException.class, () -> service.cancelAppointment("APT-1", null, null));
        found(existing(AppointmentStatus.InRoom));
        assertThrows(BadRequestException.class, () -> service.cancelAppointment("APT-1", null, null));

        found(existing(AppointmentStatus.Scheduled));
        assertEquals("Cancelled by Pet Owner", service.cancelAppointment("APT-1", null, null).getCancellationReason());
        found(existing(AppointmentStatus.Scheduled));
        assertEquals("Cancelled by Pet Owner",
                service.cancelAppointment("APT-1", CancelRequest.builder().cancellationReason("   ").build(), null).getCancellationReason());
        found(existing(AppointmentStatus.Scheduled));
        assertEquals("Moving abroad",
                service.cancelAppointment("APT-1", CancelRequest.builder().cancellationReason(" Moving abroad ").build(), null).getCancellationReason());
    }

    // ------------------------------------------------------------------ read paths

    @Test
    @DisplayName("getAppointments: role-based forcing of owner/vet filters")
    void listFiltering() {
        when(appointments.findWithFilters(any(), any(), any(), any())).thenReturn(List.of());

        authenticate(owner);
        service.getAppointments("USR-HACK", null, null, null);
        verify(appointments).findWithFilters(eq("USR-001"), isNull(), isNull(), isNull());

        authenticate(user("USR-002", UserRole.Veterinarian));
        service.getAppointments(null, "USR-HACK", "scheduled", null);
        verify(appointments).findWithFilters(isNull(), eq("USR-002"), eq(AppointmentStatus.Scheduled), isNull());

        authenticate(user("USR-003", UserRole.ClinicStaff));
        service.getAppointments("  ", "", "ALL", null);
        verify(appointments, atLeastOnce()).findWithFilters(isNull(), isNull(), isNull(), isNull());

        authenticate(user("USR-050", UserRole.RescueOfficer));
        assertThrows(AccessDeniedException.class, () -> service.getAppointments(null, null, null, null));
    }

    @Test
    @DisplayName("getAppointmentById: owner sees own, not others'; vet sees own only; staff any")
    void getByIdAccess() {
        found(existing(AppointmentStatus.Scheduled));
        authenticate(owner);
        assertNotNull(service.getAppointmentById("APT-1", null));

        authenticate(user("USR-099", UserRole.PetOwner));
        assertThrows(AccessDeniedException.class, () -> service.getAppointmentById("APT-1", null));

        authenticate(user("USR-099", UserRole.Veterinarian));
        assertThrows(BadRequestException.class, () -> service.getAppointmentById("APT-1", null));

        authenticate(user("USR-003", UserRole.ClinicStaff));
        assertNotNull(service.getAppointmentById("APT-1", null));
    }

    @Test
    @DisplayName("available slots: booked slots flagged, excludeAppointmentId frees its own slot")
    void availableSlots() {
        Appointment a = existing(AppointmentStatus.Scheduled);
        a.setTimeSlot("10:00 AM");
        when(appointments.findActiveForDateAndVet(any(), any(), any())).thenReturn(List.of(a));

        List<SlotAvailabilityResponse> all = service.getAvailableSlots("Dr. Chen", LocalDate.now(), null);
        assertEquals(11, all.size());
        assertFalse(all.stream().filter(s -> s.getTimeSlot().equals("10:00 AM")).findFirst().orElseThrow().isAvailable());

        List<SlotAvailabilityResponse> excl = service.getAvailableSlots(" ", LocalDate.now(), "apt-1");
        assertTrue(excl.stream().allMatch(SlotAvailabilityResponse::isAvailable));
    }
}
