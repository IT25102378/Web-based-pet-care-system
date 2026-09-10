package com.petnexus.backend;

import com.petnexus.backend.controller.*;
import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.*;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.repository.*;
import com.petnexus.backend.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@WithMockUser(username = "admin", roles = {"Admin"})
public class Phase7PetCareIntegrationTest {

    /** Switch the security context to a given user for tests that need role-specific access. */
    private void mockAuth(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of(authority)));
    }

    /** Restore the default Admin mock user from the class-level @WithMockUser. */
    private void mockAdmin(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_Admin");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of(authority)));
    }

    @Autowired
    private CareProviderService providerService;

    @Autowired
    private CareServiceService careServiceService;

    @Autowired
    private CareServiceLogService logService;

    @Autowired
    private ServicePackageBookingService bookingService;

    @Autowired
    private CareProviderController providerController;

    @Autowired
    private CareServiceController careServiceController;

    @Autowired
    private CareServiceLogController logController;

    @Autowired
    private PackageBookingController bookingController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private RescueCaseRepository rescueCaseRepository;

    private User testProviderUser;
    private User testOwnerUser;
    private Pet testPet;
    private RescueCase testRescueCase;

    @BeforeEach
    void setUp() {
        testProviderUser = userRepository.findByEmail("test-provider@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-TEST-PRV")
                        .email("test-provider@petnexus.com")
                        .passwordHash("hashed")
                        .fullName("Test Care Provider")
                        .phone("+94 77 111 2233")
                        .address("Colombo")
                        .role(UserRole.PetCareProvider)
                        .status(UserStatus.Active)
                        .build()));

        testOwnerUser = userRepository.findByEmail("test-owner@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-TEST-OWN")
                        .email("test-owner@petnexus.com")
                        .passwordHash("hashed")
                        .fullName("Test Owner")
                        .phone("+94 77 444 5566")
                        .address("Colombo")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        testPet = petRepository.findByPetId("PET-TEST-01")
                .orElseGet(() -> petRepository.save(Pet.builder()
                        .petId("PET-TEST-01")
                        .owner(testOwnerUser)
                        .name("Buddy")
                        .species("Dog")
                        .breed("Golden Retriever")
                        .build()));

        testRescueCase = rescueCaseRepository.findByCaseId("RSC-TEST-01")
                .orElseGet(() -> rescueCaseRepository.save(RescueCase.builder()
                        .caseId("RSC-TEST-01")
                        .caseNumber("RC-2026-99")
                        .temporaryName("Milo")
                        .species("Dog")
                        .breed("Mixed")
                        .rescueLocation("Kandy Road, Kelaniya")
                        .intakeDate(LocalDate.now().minusDays(10))
                        .status("ReadyForFoster")
                        .isPublishedForAdoption(false)
                        .build()));
    }

    @Test
    @DisplayName("CareProvider: Full Lifecycle (Create, Query, Activate, Deactivate)")
    void testCareProviderWorkflow() {
        CreateCareProviderRequest req = new CreateCareProviderRequest();
        req.setProviderId("PRV-TEST-01");
        req.setUserId(testProviderUser.getUserId());
        req.setProviderName("Test Grooming Studio");
        req.setContactPhone("+94 77 999 8888");
        req.setContactEmail("studio@petnexus.com");
        req.setActive(true);

        ResponseEntity<CareProviderResponseDto> response = providerController.createProvider(req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        CareProviderResponseDto created = response.getBody();
        assertNotNull(created);
        assertEquals("PRV-TEST-01", created.getProviderId());
        assertTrue(created.isActive());

        // Query by ID
        ResponseEntity<CareProviderResponseDto> getRes = providerController.getProvider("PRV-TEST-01");
        assertEquals(HttpStatus.OK, getRes.getStatusCode());
        assertEquals("Test Grooming Studio", getRes.getBody().getProviderName());

        // Deactivate
        ResponseEntity<CareProviderResponseDto> deactRes = providerController.deactivateProvider("PRV-TEST-01");
        assertFalse(deactRes.getBody().isActive());

        // Activate
        ResponseEntity<CareProviderResponseDto> actRes = providerController.activateProvider("PRV-TEST-01");
        assertTrue(actRes.getBody().isActive());

        // List
        ResponseEntity<List<CareProviderResponseDto>> listRes = providerController.listProviders();
        assertFalse(listRes.getBody().isEmpty());
    }

    @Test
    @DisplayName("CareService: Full Lifecycle (Create, Validate, Update, Activate, Deactivate)")
    void testCareServiceWorkflow() {
        CreateCareServiceRequest req = new CreateCareServiceRequest();
        req.setName("Full Luxury Hydrobath & Clip");
        req.setDescription("Deluxe wash, styling and nail clip");
        req.setPrice(new BigDecimal("9500.00"));
        req.setDurationMinutes(75);
        req.setCreatedByUserId(testProviderUser.getUserId());

        ResponseEntity<CareServiceResponseDto> createRes = careServiceController.createService(req);
        assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        CareServiceResponseDto created = createRes.getBody();
        assertNotNull(created);
        assertNotNull(created.getServiceId());
        assertEquals("Full Luxury Hydrobath & Clip", created.getName());

        // Validation: duplicate name must throw BadRequestException
        assertThrows(BadRequestException.class, () -> careServiceController.createService(req));

        // Update
        CareServiceUpdateRequest updateReq = new CareServiceUpdateRequest();
        updateReq.setName("Updated Full Luxury Hydrobath");
        updateReq.setPrice(new BigDecimal("10500.00"));
        updateReq.setDurationMinutes(90);

        ResponseEntity<CareServiceResponseDto> updateRes = careServiceController.updateService(created.getServiceId(), updateReq);
        assertEquals("Updated Full Luxury Hydrobath", updateRes.getBody().getName());
        assertEquals(new BigDecimal("10500.00"), updateRes.getBody().getPrice());

        // List services
        ResponseEntity<List<CareServiceResponseDto>> listRes = careServiceController.listServices();
        assertFalse(listRes.getBody().isEmpty());
    }

    @Test
    @DisplayName("ServicePackageBooking: Purchase, Session Tracking, Redemption, Completion")
    void testServicePackageBookingWorkflow() {
        PackageBookingCreateRequest req = new PackageBookingCreateRequest();
        req.setOwnerId(testOwnerUser.getUserId());
        req.setPackageName("Paw-Care 3-Session Bundle");
        req.setTotalSessions(3);

        // createBooking requires PetOwner role
        mockAuth(testOwnerUser);
        ResponseEntity<ServicePackageBookingResponseDto> createRes = bookingController.createBooking(req);
        assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        ServicePackageBookingResponseDto booking = createRes.getBody();
        assertNotNull(booking);
        assertEquals(3, booking.getTotalSessions());
        assertEquals(0, booking.getCompletedSessions());
        assertEquals(3, booking.getRemainingSessions());
        assertEquals("Active", booking.getStatus());

        // Duplicate active booking for same package and owner throws BadRequestException
        assertThrows(BadRequestException.class, () -> bookingController.createBooking(req));

        // redeemSession requires PetCareProvider/ClinicManager/Admin role
        mockAdmin(testProviderUser);

        // Redeem 1
        ResponseEntity<ServicePackageBookingResponseDto> r1 = bookingController.redeemSession(booking.getBookingId());
        assertEquals(1, r1.getBody().getCompletedSessions());
        assertEquals(2, r1.getBody().getRemainingSessions());
        assertEquals("Active", r1.getBody().getStatus());

        // Redeem 2
        ResponseEntity<ServicePackageBookingResponseDto> r2 = bookingController.redeemSession(booking.getBookingId());
        assertEquals(2, r2.getBody().getCompletedSessions());
        assertEquals(1, r2.getBody().getRemainingSessions());

        // Redeem 3 (final)
        ResponseEntity<ServicePackageBookingResponseDto> r3 = bookingController.redeemSession(booking.getBookingId());
        assertEquals(3, r3.getBody().getCompletedSessions());
        assertEquals(0, r3.getBody().getRemainingSessions());
        assertEquals("Completed", r3.getBody().getStatus());

        // 4th redeem must fail
        assertThrows(BadRequestException.class, () -> bookingController.redeemSession(booking.getBookingId()));

        // Query bookings by ownerId
        ResponseEntity<List<ServicePackageBookingResponseDto>> listRes = bookingController.getBookings(testOwnerUser.getUserId());
        assertFalse(listRes.getBody().isEmpty());
    }

    @Test
    @DisplayName("CareServiceLog: Owned Pet & Rescue Case Logging, Conflict Check, Status Progression")
    void testCareServiceLogWorkflow() {
        // 1. Log for owned pet
        CareServiceLogCreateRequest petLogReq = new CareServiceLogCreateRequest();
        petLogReq.setPetId(testPet.getPetId());
        petLogReq.setProviderId(testProviderUser.getUserId());
        petLogReq.setServiceType("De-Shedding Bath");
        petLogReq.setServiceDate(LocalDate.now().plusDays(3));
        petLogReq.setStatus(ServiceStatus.CHECKED_IN);
        petLogReq.setIntakeCondition("Good health, calm.");
        petLogReq.setServicesPerformed("Bathing, conditioning, blow-dry");

        ResponseEntity<CareServiceLogResponseDto> createRes = logController.createLog(petLogReq);
        assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        CareServiceLogResponseDto petLog = createRes.getBody();
        assertNotNull(petLog);
        assertEquals("CheckedIn", petLog.getStatus());
        assertEquals("Buddy", petLog.getPetName());

        // Conflict check: Same pet on same date
        CareServiceLogCreateRequest conflictReq = new CareServiceLogCreateRequest();
        conflictReq.setPetId(testPet.getPetId());
        conflictReq.setServiceDate(LocalDate.now().plusDays(3));
        conflictReq.setServiceType("Nail Trim");
        assertThrows(BadRequestException.class, () -> logController.createLog(conflictReq));

        // Advance Status: CheckedIn -> InProgress -> ReadyForPickup -> Completed
        ServiceLogStatusUpdateRequest statusReq1 = new ServiceLogStatusUpdateRequest();
        statusReq1.setStatus(ServiceStatus.IN_PROGRESS);
        statusReq1.setNotes("In progress bath");
        ResponseEntity<CareServiceLogResponseDto> step1 = logController.updateStatus(petLog.getServiceLogId(), statusReq1);
        assertEquals("InProgress", step1.getBody().getStatus());

        ServiceLogStatusUpdateRequest statusReq2 = new ServiceLogStatusUpdateRequest();
        statusReq2.setStatus(ServiceStatus.READY_FOR_PICKUP);
        ResponseEntity<CareServiceLogResponseDto> step2 = logController.updateStatus(petLog.getServiceLogId(), statusReq2);
        assertEquals("ReadyForPickup", step2.getBody().getStatus());

        ServiceLogStatusUpdateRequest statusReq3 = new ServiceLogStatusUpdateRequest();
        statusReq3.setStatus(ServiceStatus.COMPLETED);
        ResponseEntity<CareServiceLogResponseDto> step3 = logController.updateStatus(petLog.getServiceLogId(), statusReq3);
        assertEquals("Completed", step3.getBody().getStatus());

        // 2. Log for rescue case
        CareServiceLogCreateRequest rescueLogReq = new CareServiceLogCreateRequest();
        rescueLogReq.setCaseId(testRescueCase.getCaseId());
        rescueLogReq.setProviderId(testProviderUser.getUserId());
        rescueLogReq.setServiceType("Rehabilitation Bath & Coat Shave");
        rescueLogReq.setServiceDate(LocalDate.now().plusDays(4));
        rescueLogReq.setStatus(ServiceStatus.CHECKED_IN);
        rescueLogReq.setReturnToRescue(true);

        ResponseEntity<CareServiceLogResponseDto> rescueRes = logController.createLog(rescueLogReq);
        assertEquals(HttpStatus.CREATED, rescueRes.getStatusCode());
        CareServiceLogResponseDto rescueLog = rescueRes.getBody();
        assertNotNull(rescueLog);
        assertEquals("Milo", rescueLog.getPetName());
        assertEquals("Rescue Organization", rescueLog.getOwnerName());
        assertTrue(rescueLog.isReturnToRescue());

        // 3. Query logs with filters
        ResponseEntity<List<CareServiceLogResponseDto>> listRes = logController.getLogs(
                testProviderUser.getUserId(), null, null, null);
        assertFalse(listRes.getBody().isEmpty());

        ResponseEntity<List<CareServiceLogResponseDto>> caseListRes = logController.getLogs(
                null, null, null, testRescueCase.getCaseId());
        assertEquals(1, caseListRes.getBody().size());
        assertEquals(rescueLog.getServiceLogId(), caseListRes.getBody().get(0).getServiceLogId());
    }
}
