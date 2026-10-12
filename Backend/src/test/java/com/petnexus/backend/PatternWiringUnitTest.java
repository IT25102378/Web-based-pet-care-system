package com.petnexus.backend;

import com.petnexus.backend.dto.AppointmentRequest;
import com.petnexus.backend.dto.AppointmentResponse;
import com.petnexus.backend.entity.AdoptionApplication;
import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.patterns.strategy.EmergencyTriageStrategy;
import com.petnexus.backend.patterns.strategy.FeeCalculationContext;
import com.petnexus.backend.patterns.strategy.RescueAnimalWelfareStrategy;
import com.petnexus.backend.patterns.strategy.SeniorPetDiscountStrategy;
import com.petnexus.backend.patterns.strategy.StandardConsultationStrategy;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.service.AppointmentService;
import com.petnexus.backend.service.NotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Database-free tests proving the Strategy and Factory patterns are wired into real
 * business flows (appointment booking, notification dispatch), not just the demo endpoint.
 */
class PatternWiringUnitTest {

    private AppointmentRepository appointmentRepository;
    private PetRepository petRepository;
    private UserRepository userRepository;
    private NotificationRepository notificationRepository;

    private NotificationFactory notificationFactory;
    private NotificationService notificationService;
    private AppointmentService appointmentService;

    private User owner;

    @BeforeEach
    void setUp() {
        appointmentRepository = mock(AppointmentRepository.class);
        petRepository = mock(PetRepository.class);
        userRepository = mock(UserRepository.class);
        notificationRepository = mock(NotificationRepository.class);

        notificationFactory = new NotificationFactory();
        notificationService = new NotificationService(notificationRepository, userRepository, notificationFactory);

        StandardConsultationStrategy standard = new StandardConsultationStrategy();
        FeeCalculationContext context = new FeeCalculationContext(
                List.of(standard, new EmergencyTriageStrategy(), new SeniorPetDiscountStrategy(),
                        new RescueAnimalWelfareStrategy()),
                standard);

        appointmentService = new AppointmentService(
                appointmentRepository, petRepository, userRepository, context, notificationService);

        owner = User.builder().userId("USR-OWN").email("owner@test.com").fullName("Jane Owner")
                .role(UserRole.PetOwner).build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                owner, null, List.of(new SimpleGrantedAuthority("ROLE_PetOwner"))));

        when(userRepository.findByUserId("USR-OWN")).thenReturn(Optional.of(owner));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private Pet pet(int ageYears) {
        Pet pet = Pet.builder().petId("PET-1").name("Bella").species("Dog").owner(owner).ageYears(ageYears).build();
        when(petRepository.findByPetId("PET-1")).thenReturn(Optional.of(pet));
        return pet;
    }

    private AppointmentRequest request(String serviceType) {
        return AppointmentRequest.builder()
                .petId("PET-1").ownerId("USR-OWN").vetName("Dr. Chen")
                .serviceType(serviceType)
                .appointmentDate(LocalDate.now().plusDays(2)).timeSlot("09:00 AM")
                .reason("Routine check").build();
    }

    // ------------------------------------------------------------------ Strategy

    @Test
    @DisplayName("Strategy: adult pet booking is priced by StandardConsultationStrategy")
    void standardFeeIsStoredOnAppointment() {
        pet(3);
        AppointmentResponse res = appointmentService.bookAppointment(request("Checkup"));

        assertEquals("STANDARD", res.getFeeStrategy());
        assertEquals(new BigDecimal("3500.00"), res.getConsultationFee());
    }

    @Test
    @DisplayName("Strategy: senior pet (8+) booking gets the 15% discount")
    void seniorFeeIsStoredOnAppointment() {
        pet(10);
        AppointmentResponse res = appointmentService.bookAppointment(request("Checkup"));

        assertEquals("SENIOR_PET_DISCOUNT", res.getFeeStrategy());
        assertEquals(new BigDecimal("2975.00"), res.getConsultationFee());
    }

    @Test
    @DisplayName("Strategy: emergency service uses 1.5x + Rs. 1,500 triage surcharge")
    void emergencyFeeIsStoredOnAppointment() {
        pet(3);
        AppointmentResponse res = appointmentService.bookAppointment(request("Emergency Care"));

        assertEquals("EMERGENCY_TRIAGE", res.getFeeStrategy());
        assertEquals(new BigDecimal("9000.00"), res.getConsultationFee()); // 5000 * 1.5 + 1500
    }

    // ------------------------------------------------------------------- Factory

    @Test
    @DisplayName("Factory: booking an appointment notifies the owner through NotificationFactory")
    void bookingDispatchesFactoryBuiltNotification() {
        pet(3);
        appointmentService.bookAppointment(request("Checkup"));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification n = captor.getValue();

        assertEquals(NotificationType.Appointment, n.getType());
        assertEquals("USR-OWN", n.getUserId());
        assertTrue(n.getNotificationId().startsWith("NTF-"));
        assertTrue(n.getTitle().contains("Scheduled"));
        assertTrue(n.getMessage().contains("Bella"));
        assertFalse(n.isRead());
    }

    @Test
    @DisplayName("Factory: NotificationService.createNotification builds through the factory")
    void createNotificationUsesFactoryIdAndLink() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        notificationService.createNotification("USR-OWN", NotificationType.Rescue, " Title ", " Body ", "/rescue/cases");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification n = captor.getValue();

        assertTrue(n.getNotificationId().startsWith("NTF-"));
        assertEquals("Title", n.getTitle());
        assertEquals("/rescue/cases", n.getLink());
        assertEquals(NotificationType.Rescue, n.getType());
    }

    @Test
    @DisplayName("Factory: adoption review notifies the applicant")
    void adoptionStatusNotificationIsBuiltByFactory() {
        AdoptionApplication app = new AdoptionApplication();
        app.setApplicationId("APP-0001");
        app.setPetName("Milo");
        app.setApplicant(owner);
        app.setReviewNotes("Home visit passed");

        notificationService.notifyAdoptionStatus(app, "Approved");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification n = captor.getValue();

        assertEquals(NotificationType.Adoption, n.getType());
        assertTrue(n.getTitle().contains("Approved"));
        assertTrue(n.getMessage().contains("Home visit passed"));
    }
}
