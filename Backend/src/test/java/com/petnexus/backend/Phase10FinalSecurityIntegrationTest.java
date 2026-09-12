package com.petnexus.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.*;
import com.petnexus.backend.enums.*;
import com.petnexus.backend.repository.*;
import com.petnexus.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class Phase10FinalSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private RescueCaseRepository rescueCaseRepository;

    @Autowired
    private ApprovalHistoryRepository approvalHistoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // Users for all 6 operational roles + Admin
    private User admin;
    private User manager;
    private User vet;
    private User rescue;
    private User provider;
    private User ownerA;
    private User ownerB;

    // Users with non-active statuses
    private User suspendedUser;
    private User rejectedUser;
    private User pendingApprovalUser;
    private User pendingEmailUser;

    // Shared resources
    private Pet petA;
    private Pet petB;
    private Appointment apptA;
    private Appointment apptB;
    private RescueCase rescueCase;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // 1. System Administrator
        admin = userRepository.findByEmail("admin.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-ADM-01")
                        .email("admin.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("System Admin User")
                        .role(UserRole.Admin)
                        .status(UserStatus.Active)
                        .build()));

        // 2. Clinic Manager
        manager = userRepository.findByEmail("manager.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-MGR-01")
                        .email("manager.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Clinic Manager User")
                        .role(UserRole.ClinicManager)
                        .status(UserStatus.Active)
                        .managerCode("MGR-2026")
                        .build()));

        // 3. Veterinarian
        vet = userRepository.findByEmail("vet.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-VET-01")
                        .email("vet.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Dr. Michael Vet")
                        .role(UserRole.Veterinarian)
                        .status(UserStatus.Active)
                        .licenseNumber("VET-LIC-999")
                        .specialization("Small Animal Surgery")
                        .build()));

        // 4. Rescue Officer
        rescue = userRepository.findByEmail("rescue.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-RSC-01")
                        .email("rescue.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Rescue Officer Sarah")
                        .role(UserRole.RescueOfficer)
                        .status(UserStatus.Active)
                        .badgeNumber("RO-442")
                        .build()));

        // 5. Pet Care Provider
        provider = userRepository.findByEmail("provider.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-PRV-01")
                        .email("provider.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Care Provider Sam")
                        .role(UserRole.PetCareProvider)
                        .status(UserStatus.Active)
                        .serviceSpecialty("Canine Grooming")
                        .build()));

        // 6. Pet Owner A
        ownerA = userRepository.findByEmail("ownera.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-OWN-01")
                        .email("ownera.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Owner Alice")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        // 7. Pet Owner B
        ownerB = userRepository.findByEmail("ownerb.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-OWN-02")
                        .email("ownerb.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Owner Bob")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        // Non-active accounts
        suspendedUser = userRepository.findByEmail("suspended.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-SUS-01")
                        .email("suspended.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Suspended User")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Suspended)
                        .suspensionReason("Breach of terms")
                        .build()));

        rejectedUser = userRepository.findByEmail("rejected.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-REJ-01")
                        .email("rejected.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Rejected User")
                        .role(UserRole.Veterinarian)
                        .status(UserStatus.Rejected)
                        .rejectionReason("Fake credentials")
                        .build()));

        pendingApprovalUser = userRepository.findByEmail("pendingapp.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-PND-01")
                        .email("pendingapp.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Pending App User")
                        .role(UserRole.Veterinarian)
                        .status(UserStatus.PendingApproval)
                        .build()));

        pendingEmailUser = userRepository.findByEmail("pendingemail.sec@petnexus.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .userId("USR-PVE-01")
                        .email("pendingemail.sec@petnexus.com")
                        .passwordHash(passwordEncoder.encode("Password123!"))
                        .fullName("Pending Email User")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.PendingEmailVerification)
                        .build()));

        // Seed test pets
        petA = petRepository.findByPetId("PET-SEC-A").orElseGet(() ->
                petRepository.save(Pet.builder()
                        .petId("PET-SEC-A")
                        .name("Barnaby A")
                        .species("Dog")
                        .breed("Golden Retriever")
                        .owner(ownerA)
                        .build()));

        petB = petRepository.findByPetId("PET-SEC-B").orElseGet(() ->
                petRepository.save(Pet.builder()
                        .petId("PET-SEC-B")
                        .name("Whiskers B")
                        .species("Cat")
                        .breed("Siamese")
                        .owner(ownerB)
                        .build()));

        // Seed test appointments
        apptA = appointmentRepository.findByAppointmentId("APT-SEC-A").orElseGet(() ->
                appointmentRepository.save(Appointment.builder()
                        .appointmentId("APT-SEC-A")
                        .pet(petA)
                        .petId(petA.getPetId())
                        .petName(petA.getName())
                        .owner(ownerA)
                        .ownerId(ownerA.getUserId())
                        .ownerName(ownerA.getFullName())
                        .veterinarian(vet)
                        .vetId(vet.getUserId())
                        .vetName(vet.getFullName())
                        .serviceType("Consultation")
                        .appointmentDate(LocalDate.now().plusDays(2))
                        .timeSlot("10:00 AM")
                        .status(AppointmentStatus.Scheduled)
                        .build()));

        apptB = appointmentRepository.findByAppointmentId("APT-SEC-B").orElseGet(() ->
                appointmentRepository.save(Appointment.builder()
                        .appointmentId("APT-SEC-B")
                        .pet(petB)
                        .petId(petB.getPetId())
                        .petName(petB.getName())
                        .owner(ownerB)
                        .ownerId(ownerB.getUserId())
                        .ownerName(ownerB.getFullName())
                        .veterinarian(vet)
                        .vetId(vet.getUserId())
                        .vetName(vet.getFullName())
                        .serviceType("Consultation")
                        .appointmentDate(LocalDate.now().plusDays(3))
                        .timeSlot("11:00 AM")
                        .status(AppointmentStatus.Scheduled)
                        .build()));

        // Seed rescue case
        rescueCase = rescueCaseRepository.findByCaseId("CAS-SEC-01").orElseGet(() ->
                rescueCaseRepository.save(RescueCase.builder()
                        .caseId("CAS-SEC-01")
                        .temporaryName("Lucky")
                        .species("Dog")
                        .breed("Mixed")
                        .status("ReadyForAdoption")
                        .isPublishedForAdoption(true)
                        .intakeDate(LocalDate.now().minusDays(10))
                        .rescueLocation("Test Shelter")
                        .build()));
    }

    private org.springframework.security.core.Authentication auth(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        return new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(authority));
    }

    // =============================================================
    // 1. AUTHENTICATION (Tests 1-3)
    // =============================================================

    @Test
    @DisplayName("1. Missing JWT -> 401 Unauthorized")
    void testMissingJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me").servletPath("/api"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Invalid JWT -> 401 Unauthorized")
    void testInvalidJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me").servletPath("/api")
                        .header("Authorization", "Bearer not.a.valid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. Expired JWT -> 401 Unauthorized")
    void testExpiredJwtReturns401() throws Exception {
        String expiredToken = jwtService.generateTokenWithExpiration(ownerA, -60000L);
        mockMvc.perform(get("/api/auth/me").servletPath("/api")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    // =============================================================
    // 2. ADMIN LIFECYCLE & SECURITY (Tests 4-11)
    // =============================================================

    @Test
    @DisplayName("4. Admin can approve user -> 200 OK")
    void testAdminCanApprove() throws Exception {
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/approve").servletPath("/api")
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Active"));
    }

    @Test
    @DisplayName("5. Admin can reject user -> 200 OK")
    void testAdminCanReject() throws Exception {
        RejectRequest req = new RejectRequest();
        req.setRejectionReason("Invalid degree certificate");
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/reject").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Rejected"));
    }

    @Test
    @DisplayName("6. Admin can suspend user -> 200 OK")
    void testAdminCanSuspend() throws Exception {
        SuspendRequest req = new SuspendRequest();
        req.setSuspensionReason("Terms violation");
        mockMvc.perform(post("/api/users/" + ownerA.getUserId() + "/suspend").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Suspended"));
    }

    @Test
    @DisplayName("7. Admin can reactivate user -> 200 OK")
    void testAdminCanReactivate() throws Exception {
        mockMvc.perform(post("/api/users/" + suspendedUser.getUserId() + "/reactivate").servletPath("/api")
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Active"));
    }

    @Test
    @DisplayName("8. Admin can view approval history -> 200 OK")
    void testAdminCanViewApprovalHistory() throws Exception {
        mockMvc.perform(get("/api/admin/approval-history").servletPath("/api")
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("9. Clinic Manager cannot approve user -> 403 Forbidden")
    void testClinicManagerCannotApprove() throws Exception {
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/approve").servletPath("/api")
                        .with(authentication(auth(manager))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. Veterinarian cannot approve user -> 403 Forbidden")
    void testVeterinarianCannotApprove() throws Exception {
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/approve").servletPath("/api")
                        .with(authentication(auth(vet))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11. Pet Owner cannot approve user -> 403 Forbidden")
    void testPetOwnerCannotApprove() throws Exception {
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/approve").servletPath("/api")
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 3. CLINIC MANAGER SECURITY (Tests 12-16)
    // =============================================================

    @Test
    @DisplayName("12. Manager can manage inventory -> 200 OK")
    void testManagerCanManageInventory() throws Exception {
        mockMvc.perform(get("/api/inventory").servletPath("/api")
                        .with(authentication(auth(manager))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("13. Manager can manage suppliers -> 200 OK")
    void testManagerCanManageSuppliers() throws Exception {
        mockMvc.perform(get("/api/suppliers").servletPath("/api")
                        .with(authentication(auth(manager))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("14. Manager can manage purchase orders -> 200 OK")
    void testManagerCanManagePurchaseOrders() throws Exception {
        mockMvc.perform(get("/api/purchase-orders").servletPath("/api")
                        .with(authentication(auth(manager))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("15. Owner cannot modify inventory -> 403 Forbidden")
    void testOwnerCannotModifyInventory() throws Exception {
        InventoryItemRequest req = InventoryItemRequest.builder()
                .name("Antibiotic Drops")
                .category("Pharmacy")
                .sku("SKU-TEST-99")
                .unitPrice(new BigDecimal("1500.00"))
                .sellingPrice(new BigDecimal("2200.00"))
                .currentStock(20)
                .minStockThreshold(5)
                .unit("bottle")
                .build();

        mockMvc.perform(post("/api/inventory").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("16. Vet cannot modify inventory -> 403 Forbidden")
    void testVetCannotModifyInventory() throws Exception {
        String validItemJson = "{" +
                "\"name\":\"Antibiotic Ointment\"," +
                "\"category\":\"Medication\"," +
                "\"sku\":\"MED-ANT-001\"," +
                "\"currentStock\":50," +
                "\"minStockThreshold\":10," +
                "\"unit\":\"Tubes\"," +
                "\"unitPrice\":5.50," +
                "\"sellingPrice\":12.00" +
                "}";
        mockMvc.perform(post("/api/inventory").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validItemJson)
                        .with(authentication(auth(vet))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 4. VETERINARIAN SECURITY (Tests 17-21)
    // =============================================================

    @Test
    @DisplayName("17. Vet can create consultation -> 201 Created")
    void testVetCanCreateConsultation() throws Exception {
        ConsultationRequest req = ConsultationRequest.builder()
                .petId(petA.getPetId())
                .appointmentId(apptA.getAppointmentId())
                .vetId(vet.getUserId())
                .assessmentDiagnosis("Mild dermatitis")
                .treatmentPlan("Apply topical soothing lotion daily")
                .build();

        mockMvc.perform(post("/api/consultations").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(vet))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("18. Vet can create prescription -> 201 Created")
    void testVetCanCreatePrescription() throws Exception {
        PrescriptionItemDto item = PrescriptionItemDto.builder()
                .medicationName("Amoxicillin 250mg")
                .dosage("1 tablet twice daily")
                .frequency("Twice daily")
                .durationDays(7)
                .quantityPrescribed(14)
                .build();

        PrescriptionCreateRequest req = PrescriptionCreateRequest.builder()
                .petId(petA.getPetId())
                .vetId(vet.getUserId())
                .items(List.of(item))
                .instructions("Give with food")
                .build();

        mockMvc.perform(post("/api/prescriptions").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(vet))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("19. Vet can access medical history -> 200 OK")
    void testVetCanAccessMedicalHistory() throws Exception {
        mockMvc.perform(get("/api/pets/" + petA.getPetId() + "/medical-history").servletPath("/api")
                        .with(authentication(auth(vet))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("20. Owner cannot create consultation -> 403 Forbidden")
    void testOwnerCannotCreateConsultation() throws Exception {
        ConsultationRequest req = ConsultationRequest.builder()
                .petId(petA.getPetId())
                .assessmentDiagnosis("Self diagnosis")
                .treatmentPlan("Rest")
                .build();

        mockMvc.perform(post("/api/consultations").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("21. Care Provider cannot create prescription -> 403 Forbidden")
    void testCareProviderCannotCreatePrescription() throws Exception {
        PrescriptionCreateRequest req = PrescriptionCreateRequest.builder()
                .petId(petA.getPetId())
                .instructions("Diagnosis from groomer")
                .build();

        mockMvc.perform(post("/api/prescriptions").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(provider))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 5. RESCUE OFFICER SECURITY (Tests 22-25)
    // =============================================================

    @Test
    @DisplayName("22. Rescue Officer can create rescue case -> 201 Created")
    void testRescueOfficerCanCreateRescueCase() throws Exception {
        RescueCaseRequest req = RescueCaseRequest.builder()
                .temporaryName("Rescued Pup")
                .species("Dog")
                .breed("Hound Mix")
                .rescueLocation("Colombo 04")
                .build();

        mockMvc.perform(post("/api/rescue/cases").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(rescue))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("Intake"));
    }

    @Test
    @DisplayName("23. Rescue Officer can perform valid transition (Intake -> InTreatment) -> 200 OK")
    void testRescueOfficerCanPerformValidTransition() throws Exception {
        RescueCase newCase = rescueCaseRepository.save(RescueCase.builder()
                .caseId("CAS-VALID-01")
                .temporaryName("Rusty")
                .species("Dog")
                .breed("Street Dog")
                .status("Intake")
                .intakeDate(LocalDate.now())
                .rescueLocation("Test Street")
                .build());

        RescueCaseRequest updateReq = RescueCaseRequest.builder()
                .status("InTreatment")
                .build();

        mockMvc.perform(put("/api/rescue/cases/" + newCase.getCaseId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .with(authentication(auth(rescue))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("InTreatment"));
    }

    @Test
    @DisplayName("24. Invalid rescue transition (Intake -> Adopted) rejected -> 400 Bad Request")
    void testInvalidRescueTransitionRejected() throws Exception {
        RescueCase newCase = rescueCaseRepository.save(RescueCase.builder()
                .caseId("CAS-INVALID-01")
                .temporaryName("Tiny")
                .species("Cat")
                .breed("Domestic")
                .status("Intake")
                .intakeDate(LocalDate.now())
                .rescueLocation("Test Street")
                .build());

        RescueCaseRequest updateReq = RescueCaseRequest.builder()
                .status("Adopted")
                .build();

        mockMvc.perform(put("/api/rescue/cases/" + newCase.getCaseId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .with(authentication(auth(rescue))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("25. Owner cannot create rescue case -> 403 Forbidden")
    void testOwnerCannotCreateRescueCase() throws Exception {
        RescueCaseRequest req = RescueCaseRequest.builder()
                .temporaryName("Illegal Pup")
                .species("Dog")
                .build();

        mockMvc.perform(post("/api/rescue/cases").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 6. CARE PROVIDER SECURITY (Tests 26-29)
    // =============================================================

    @Test
    @DisplayName("26. Provider can create service log -> 201 Created")
    void testProviderCanCreateServiceLog() throws Exception {
        CareServiceLogCreateRequest req = new CareServiceLogCreateRequest();
        req.setPetId(petA.getPetId());
        req.setPetName(petA.getName());
        req.setServiceType("Medicated Bath");
        req.setProviderId(provider.getUserId());
        req.setProviderName(provider.getFullName());
        req.setStatus(ServiceStatus.SCHEDULED);

        mockMvc.perform(post("/api/care-services/logs").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(provider))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("27. Provider can progress service status -> 200 OK")
    void testProviderCanProgressStatus() throws Exception {
        CareServiceLogCreateRequest req = new CareServiceLogCreateRequest();
        req.setPetId(petA.getPetId());
        req.setPetName(petA.getName());
        req.setServiceType("Nail Trim");
        req.setProviderId(provider.getUserId());
        req.setProviderName(provider.getFullName());
        req.setStatus(ServiceStatus.CHECKED_IN);

        MvcResult res = mockMvc.perform(post("/api/care-services/logs").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(provider))))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(res.getResponse().getContentAsString());
        String logId = json.get("serviceLogId").asText();

        ServiceLogStatusUpdateRequest updateReq = new ServiceLogStatusUpdateRequest();
        updateReq.setStatus(ServiceStatus.IN_PROGRESS);
        updateReq.setNotes("Commenced grooming");

        mockMvc.perform(put("/api/care-services/logs/" + logId + "/status").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .with(authentication(auth(provider))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("InProgress"));
    }

    @Test
    @DisplayName("28. Provider cannot create prescription -> 403 Forbidden")
    void testProviderCannotCreatePrescription() throws Exception {
        mockMvc.perform(post("/api/prescriptions").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .with(authentication(auth(provider))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("29. Provider cannot modify inventory -> 403 Forbidden")
    void testProviderCannotModifyInventory() throws Exception {
        String validItemJson = "{" +
                "\"name\":\"Dog Shampoo\"," +
                "\"category\":\"Grooming\"," +
                "\"sku\":\"GRM-SHM-001\"," +
                "\"currentStock\":20," +
                "\"minStockThreshold\":5," +
                "\"unit\":\"Bottles\"," +
                "\"unitPrice\":8.00," +
                "\"sellingPrice\":15.00" +
                "}";
        mockMvc.perform(post("/api/inventory").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validItemJson)
                        .with(authentication(auth(provider))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 7. PET OWNER ISOLATION & PRIVILEGES (Tests 30-40)
    // =============================================================

    @Test
    @DisplayName("30. Owner can create own pet -> 201 Created")
    void testOwnerCanCreateOwnPet() throws Exception {
        PetRequest req = PetRequest.builder()
                .name("Charlie New")
                .species("Dog")
                .breed("Beagle")
                .build();

        mockMvc.perform(post("/api/pets").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ownerId").value(ownerA.getUserId()));
    }

    @Test
    @DisplayName("31. Owner can update own pet -> 200 OK")
    void testOwnerCanUpdateOwnPet() throws Exception {
        PetRequest req = PetRequest.builder()
                .name("Barnaby Updated")
                .species("Dog")
                .breed("Golden Retriever")
                .build();

        mockMvc.perform(put("/api/pets/" + petA.getPetId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Barnaby Updated"));
    }

    @Test
    @DisplayName("32. Owner cannot update another owner's pet -> 403 Forbidden")
    void testOwnerCannotUpdateAnotherOwnersPet() throws Exception {
        PetRequest req = PetRequest.builder()
                .name("Hacked Whiskers")
                .species("Cat")
                .breed("Siamese")
                .build();

        mockMvc.perform(put("/api/pets/" + petB.getPetId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("33. Owner can book appointment -> 201 Created")
    void testOwnerCanBookAppointment() throws Exception {
        String reqJson = String.format("{\"petId\":\"%s\",\"ownerId\":\"%s\",\"ownerName\":\"%s\",\"vetId\":\"%s\",\"vetName\":\"%s\",\"serviceType\":\"Vaccination\",\"appointmentDate\":\"%s\",\"timeSlot\":\"02:00 PM\",\"reason\":\"Annual Checkup\"}",
                petA.getPetId(), ownerA.getUserId(), ownerA.getFullName(), vet.getUserId(), vet.getFullName(), LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/appointments").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reqJson)
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("34. Owner cannot modify another owner's appointment -> 403 Forbidden")
    void testOwnerCannotModifyAnotherOwnersAppointment() throws Exception {
        CancelRequest cancelReq = new CancelRequest("Unauthorized cancellation");

        mockMvc.perform(put("/api/appointments/" + apptB.getAppointmentId() + "/cancel").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("35. Owner can submit adoption application -> 201 Created")
    void testOwnerCanSubmitAdoptionApplication() throws Exception {
        CreateApplicationRequest req = new CreateApplicationRequest(
                rescueCase.getCaseId(),
                ownerA.getUserId(),
                rescueCase.getTemporaryName(),
                ownerA.getFullName(),
                "+94 77 111 2222"
        );

        mockMvc.perform(post("/api/adoptions/applications").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicantId").value(ownerA.getUserId()));
    }

    @Test
    @DisplayName("36. Owner cannot approve adoption -> 403 Forbidden")
    void testOwnerCannotApproveAdoption() throws Exception {
        ReviewApplicationRequest reviewReq = new ReviewApplicationRequest("Approved", "Self-approved", ownerA.getUserId());

        mockMvc.perform(post("/api/adoptions/applications/APP-0001/review").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("37. Owner can submit feedback -> 201 Created")
    void testOwnerCanSubmitFeedback() throws Exception {
        FeedbackRequest req = FeedbackRequest.builder()
                .userId(ownerA.getUserId())
                .userName(ownerA.getFullName())
                .serviceCategory("Veterinary Consultation")
                .rating(5)
                .title("Great Care")
                .comments("Very happy with Barnaby's visit.")
                .build();

        mockMvc.perform(post("/api/feedback").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("38. Owner can read own notifications -> 200 OK")
    void testOwnerCanReadOwnNotifications() throws Exception {
        mockMvc.perform(get("/api/notifications?userId=" + ownerA.getUserId()).servletPath("/api")
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("39. Owner cannot read another user's notifications -> 403 Forbidden")
    void testOwnerCannotReadAnotherUsersNotifications() throws Exception {
        mockMvc.perform(get("/api/notifications?userId=" + ownerB.getUserId()).servletPath("/api")
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("40. Owner cannot access approval history -> 403 Forbidden")
    void testOwnerCannotAccessApprovalHistory() throws Exception {
        mockMvc.perform(get("/api/admin/approval-history").servletPath("/api")
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 8. IMPERSONATION & X-USER-ID PROTECTION (Tests 41-45)
    // =============================================================

    @Test
    @DisplayName("41. JWT Owner A + X-User-Id Owner B cannot access Owner B data -> 403 Forbidden")
    void testImpersonationViaHeaderBlocked() throws Exception {
        mockMvc.perform(get("/api/pets/" + petB.getPetId()).servletPath("/api")
                        .header("X-User-Id", ownerB.getUserId())
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("42. Owner A cannot modify Owner B pet with X-User-Id -> 403 Forbidden")
    void testOwnerACannotModifyOwnerBPetWithHeader() throws Exception {
        PetRequest req = PetRequest.builder()
                .name("Spoofed Name")
                .species("Cat")
                .breed("Siamese")
                .build();

        mockMvc.perform(put("/api/pets/" + petB.getPetId()).servletPath("/api")
                        .header("X-User-Id", ownerB.getUserId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("43. Owner A cannot access Owner B medical history with X-User-Id -> 403 Forbidden")
    void testOwnerACannotAccessOwnerBMedicalHistoryWithHeader() throws Exception {
        mockMvc.perform(get("/api/pets/" + petB.getPetId() + "/medical-history").servletPath("/api")
                        .header("X-User-Id", ownerB.getUserId())
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("44. Owner A cannot modify Owner B appointment with X-User-Id -> 403 Forbidden")
    void testOwnerACannotModifyOwnerBAppointmentWithHeader() throws Exception {
        CancelRequest cancelReq = new CancelRequest("Spoofed Cancel");

        mockMvc.perform(put("/api/appointments/" + apptB.getAppointmentId() + "/cancel").servletPath("/api")
                        .header("X-User-Id", ownerB.getUserId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("45. Owner A cannot read Owner B notifications with X-User-Id -> 403 Forbidden")
    void testOwnerACannotReadOwnerBNotificationsWithHeader() throws Exception {
        mockMvc.perform(get("/api/notifications?userId=" + ownerB.getUserId()).servletPath("/api")
                        .header("X-User-Id", ownerB.getUserId())
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    // =============================================================
    // 9. USER STATUS ENFORCEMENT VIA JWT FILTER (Tests 46-49)
    // =============================================================

    @Test
    @DisplayName("46. Suspended user blocked by JWT filter -> 401 Unauthorized")
    void testSuspendedUserBlockedByJwt() throws Exception {
        String token = jwtService.generateToken(suspendedUser);
        mockMvc.perform(get("/api/auth/me").servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("47. Rejected user blocked by JWT filter -> 401 Unauthorized")
    void testRejectedUserBlockedByJwt() throws Exception {
        String token = jwtService.generateToken(rejectedUser);
        mockMvc.perform(get("/api/auth/me").servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("48. Pending approval user blocked by JWT filter -> 401 Unauthorized")
    void testPendingApprovalUserBlockedByJwt() throws Exception {
        String token = jwtService.generateToken(pendingApprovalUser);
        mockMvc.perform(get("/api/auth/me").servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("49. Pending verification user blocked by JWT filter -> 401 Unauthorized")
    void testPendingVerificationUserBlockedByJwt() throws Exception {
        String token = jwtService.generateToken(pendingEmailUser);
        mockMvc.perform(get("/api/auth/me").servletPath("/api")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    // =============================================================
    // 10. PUBLIC ENDPOINTS ACCESSIBLE WITHOUT JWT (Tests 50-54)
    // =============================================================

    @Test
    @DisplayName("50. Login endpoint is public -> 200 OK")
    void testLoginIsPublic() throws Exception {
        LoginRequest req = new LoginRequest(ownerA.getEmail(), "Password123!");
        mockMvc.perform(post("/api/auth/login").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("51. Register endpoint is public -> 201 Created")
    void testRegisterIsPublic() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .email("public.reg." + UUID.randomUUID() + "@petnexus.com")
                .password("SecurePass123!")
                .fullName("Public Registration")
                .role(UserRole.PetOwner)
                .build();

        mockMvc.perform(post("/api/auth/register").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("52. Removed verify-email endpoint is no longer public -> 401 Unauthorized")
    void testVerifyEmailIsNoLongerPublic() throws Exception {
        // The email verification step was removed, so the endpoint and its
        // permitAll() entry are gone and an anonymous call is now rejected.
        mockMvc.perform(get("/api/auth/verify-email?token=invalid-token").servletPath("/api"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("53. Forgot password endpoint is public -> 200 OK")
    void testForgotPasswordIsPublic() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest(ownerA.getEmail());
        mockMvc.perform(post("/api/auth/forgot-password").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("54. Reset password endpoint is public -> 400 on invalid token, not 401")
    void testResetPasswordIsPublic() throws Exception {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setToken("bad-token");
        req.setNewPassword("NewPassword123!");
        mockMvc.perform(post("/api/auth/reset-password").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // =============================================================
    // 11. PROFILE SECURITY & MASS-ASSIGNMENT (Tests 55-58)
    // =============================================================

    @Test
    @DisplayName("55. Owner cannot modify another user's profile -> 403 Forbidden")
    void testOwnerCannotModifyAnotherUsersProfile() throws Exception {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("Malicious Rename");

        mockMvc.perform(put("/api/users/" + ownerB.getUserId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("56. Owner cannot change their role via profile update -> Role remains PetOwner")
    void testOwnerCannotChangeRoleViaProfileUpdate() throws Exception {
        // Sending raw JSON containing "role": "Admin"
        String rawJson = "{\"fullName\":\"Owner Alice\",\"role\":\"Admin\"}";

        mockMvc.perform(put("/api/users/" + ownerA.getUserId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson)
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PetOwner"));

        User refreshed = userRepository.findByUserId(ownerA.getUserId()).orElseThrow();
        assertEquals(UserRole.PetOwner, refreshed.getRole());
    }

    @Test
    @DisplayName("57. Owner cannot change their status via profile update -> Status remains Active")
    void testOwnerCannotChangeStatusViaProfileUpdate() throws Exception {
        String rawJson = "{\"fullName\":\"Owner Alice\",\"status\":\"Suspended\"}";

        mockMvc.perform(put("/api/users/" + ownerA.getUserId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson)
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Active"));

        User refreshed = userRepository.findByUserId(ownerA.getUserId()).orElseThrow();
        assertEquals(UserStatus.Active, refreshed.getStatus());
    }

    @Test
    @DisplayName("58. Clinic Manager cannot elevate to Admin -> Role remains ClinicManager")
    void testManagerCannotElevateToAdmin() throws Exception {
        String rawJson = "{\"fullName\":\"Himashi Manager\",\"role\":\"Admin\"}";

        mockMvc.perform(put("/api/users/" + manager.getUserId()).servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJson)
                        .with(authentication(auth(manager))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ClinicManager"));

        User refreshed = userRepository.findByUserId(manager.getUserId()).orElseThrow();
        assertEquals(UserRole.ClinicManager, refreshed.getRole());
    }

    // =============================================================
    // 12. PASSWORD SECURITY (Tests 59-61)
    // =============================================================

    @Test
    @DisplayName("59. Password hash never appears in login response")
    void testPasswordHashNeverAppearsInResponses() throws Exception {
        LoginRequest req = new LoginRequest(ownerA.getEmail(), "Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertFalse(body.contains("passwordHash"));
        assertFalse(body.contains("$2a$"));
    }

    @Test
    @DisplayName("60. Password change only affects authenticated user's own password")
    void testPasswordChangeOnlyAffectsOwnPassword() throws Exception {
        ChangePasswordRequest changeReq = new ChangePasswordRequest();
        changeReq.setCurrentPassword("Password123!");
        changeReq.setNewPassword("NewSecretPass456!");

        // Owner A attempting to change Owner B's password
        mockMvc.perform(post("/api/users/" + ownerB.getUserId() + "/change-password").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq))
                        .with(authentication(auth(ownerA))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("61. Reset password request does not expose reset token")
    void testResetPasswordDoesNotExposeToken() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest(ownerA.getEmail());

        MvcResult result = mockMvc.perform(post("/api/auth/forgot-password").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertFalse(body.contains("token"));
        assertFalse(body.contains("resetToken"));
    }

    // =============================================================
    // 13. APPROVAL HISTORY INTEGRITY (Tests 62-66)
    // =============================================================

    @Test
    @DisplayName("62. Successful approval creates history record")
    void testSuccessfulApprovalCreatesHistory() throws Exception {
        long countBefore = approvalHistoryRepository.count();

        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/approve").servletPath("/api")
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk());

        long countAfter = approvalHistoryRepository.count();
        assertEquals(countBefore + 1, countAfter);
        List<ApprovalHistory> history = approvalHistoryRepository.findByUserIdOrderByTimestampDesc(pendingApprovalUser.getUserId());
        assertFalse(history.isEmpty());
        assertEquals("APPROVED", history.get(0).getAction());
    }

    @Test
    @DisplayName("63. Successful rejection creates history record")
    void testSuccessfulRejectionCreatesHistory() throws Exception {
        long countBefore = approvalHistoryRepository.count();

        RejectRequest req = new RejectRequest();
        req.setRejectionReason("Incomplete application");
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/reject").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk());

        long countAfter = approvalHistoryRepository.count();
        assertEquals(countBefore + 1, countAfter);
        List<ApprovalHistory> history = approvalHistoryRepository.findByUserIdOrderByTimestampDesc(pendingApprovalUser.getUserId());
        assertFalse(history.isEmpty());
        assertEquals("REJECTED", history.get(0).getAction());
        assertEquals("Incomplete application", history.get(0).getReason());
    }

    @Test
    @DisplayName("64. Successful suspension creates history record")
    void testSuccessfulSuspensionCreatesHistory() throws Exception {
        long countBefore = approvalHistoryRepository.count();

        SuspendRequest req = new SuspendRequest();
        req.setSuspensionReason("Fraudulent activity");
        mockMvc.perform(post("/api/users/" + ownerA.getUserId() + "/suspend").servletPath("/api")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req))
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk());

        long countAfter = approvalHistoryRepository.count();
        assertEquals(countBefore + 1, countAfter);
        List<ApprovalHistory> history = approvalHistoryRepository.findByUserIdOrderByTimestampDesc(ownerA.getUserId());
        assertFalse(history.isEmpty());
        assertEquals("SUSPENDED", history.get(0).getAction());
        assertEquals("Fraudulent activity", history.get(0).getReason());
    }

    @Test
    @DisplayName("65. Successful reactivation creates history record")
    void testSuccessfulReactivationCreatesHistory() throws Exception {
        long countBefore = approvalHistoryRepository.count();

        mockMvc.perform(post("/api/users/" + suspendedUser.getUserId() + "/reactivate").servletPath("/api")
                        .with(authentication(auth(admin))))
                .andExpect(status().isOk());

        long countAfter = approvalHistoryRepository.count();
        assertEquals(countBefore + 1, countAfter);
        List<ApprovalHistory> history = approvalHistoryRepository.findByUserIdOrderByTimestampDesc(suspendedUser.getUserId());
        assertFalse(history.isEmpty());
        assertEquals("REACTIVATED", history.get(0).getAction());
    }

    @Test
    @DisplayName("66. Failed operation (unauthorized) does not create history record")
    void testFailedOperationDoesNotCreateHistory() throws Exception {
        long countBefore = approvalHistoryRepository.count();

        // Manager attempting to approve -> 403 Forbidden
        mockMvc.perform(post("/api/users/" + pendingApprovalUser.getUserId() + "/approve").servletPath("/api")
                        .with(authentication(auth(manager))))
                .andExpect(status().isForbidden());

        long countAfter = approvalHistoryRepository.count();
        assertEquals(countBefore, countAfter);
    }
}
