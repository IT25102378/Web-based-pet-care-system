package com.petnexus.backend.whitebox;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.*;
import com.petnexus.backend.enums.ServiceStatus;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.patterns.observer.InventoryEventManager;
import com.petnexus.backend.repository.*;
import com.petnexus.backend.service.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * WHITE-BOX: the rules added when the documented limitations were fixed
 * (booking e-mail, reminders, package validation and expiry, care session workflow,
 * supply de-duplication, prescription matching, expired stock, manager notifications, document size).
 */
class WB5_HardenedRulesTest {

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    // ============================================================ notifications + e-mail

    @Test
    @DisplayName("e-mail: an appointment notification is also e-mailed to the owner; no e-mail when the owner has none")
    void appointmentEmail() {
        NotificationRepository repo = mock(NotificationRepository.class);
        EmailService mail = mock(EmailService.class);
        NotificationService ns = new NotificationService(repo, mock(UserRepository.class), new NotificationFactory(), mail);

        User owner = User.builder().userId("USR-1").email("owner@x.com").build();
        Appointment a = Appointment.builder().appointmentId("APT-1").petName("Bella").owner(owner)
                .appointmentDate(LocalDate.now().plusDays(1)).timeSlot("09:00 AM").build();
        ns.notifyAppointment(a, "Confirmed");

        verify(repo).save(any(Notification.class));
        verify(mail).sendNotificationEmail(eq("owner@x.com"), contains("Confirmed"), contains("Bella"));

        a.setOwner(null);               // walk-in without an account: nothing sent, nothing thrown
        assertDoesNotThrow(() -> ns.notifyAppointment(a, "Confirmed"));
        verify(mail, times(1)).sendNotificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("managers: every ACTIVE clinic manager is notified; inactive ones are skipped; failures never throw")
    void notifyAllManagers() {
        NotificationRepository repo = mock(NotificationRepository.class);
        UserRepository users = mock(UserRepository.class);
        NotificationService ns = new NotificationService(repo, users, new NotificationFactory(), mock(EmailService.class));
        User m1 = User.builder().userId("M1").status(UserStatus.Active).role(UserRole.ClinicManager).build();
        User m2 = User.builder().userId("M2").status(UserStatus.Suspended).role(UserRole.ClinicManager).build();
        User m3 = User.builder().userId("M3").status(UserStatus.Active).role(UserRole.ClinicManager).build();
        when(users.findByRole(UserRole.ClinicManager)).thenReturn(List.of(m1, m2, m3));

        int sent = ns.notifyClinicManagers(com.petnexus.backend.enums.NotificationType.Inventory, "T", "M", "/x");
        assertEquals(2, sent);
        verify(repo, times(2)).save(any(Notification.class));

        when(users.findByRole(UserRole.ClinicManager)).thenThrow(new RuntimeException("db"));
        assertEquals(0, ns.notifyClinicManagers(com.petnexus.backend.enums.NotificationType.System, "T", "M", "/x"));
    }

    // ============================================================ reminders

    @Test
    @DisplayName("reminders: vaccination due within 7 days and tomorrow's appointments are notified once per day")
    void reminders() {
        VaccinationRepository vaccinations = mock(VaccinationRepository.class);
        AppointmentRepository appointments = mock(AppointmentRepository.class);
        NotificationRepository notifications = mock(NotificationRepository.class);
        EmailService mail = mock(EmailService.class);
        Clock clock = Clock.fixed(LocalDate.of(2026, 10, 12).atTime(8, 0).atZone(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault());
        ReminderService reminders = new ReminderService(vaccinations, appointments, notifications, new NotificationFactory(), mail, clock);

        User owner = User.builder().userId("USR-1").email("o@x.com").build();
        Pet pet = Pet.builder().petId("PET-1").name("Bella").owner(owner).build();
        Vaccination v = Vaccination.builder().pet(pet).petName("Bella").vaccineName("Rabies").nextDueDate(LocalDate.of(2026, 10, 15)).build();
        Vaccination orphan = Vaccination.builder().pet(Pet.builder().petId("PET-2").name("Rex").build()).vaccineName("DHPP")
                .nextDueDate(LocalDate.of(2026, 10, 14)).build();
        when(vaccinations.findByNextDueDateBetween(LocalDate.of(2026, 10, 12), LocalDate.of(2026, 10, 19)))
                .thenReturn(List.of(v, orphan));

        assertEquals(1, reminders.sendVaccinationReminders());     // the ownerless record is skipped
        verify(notifications, times(1)).save(any(Notification.class));

        // second run the same day: duplicate guard says "already sent"
        when(notifications.existsByUserAndTitleAndMessageAndCreatedAtAfter(any(), anyString(), anyString(), any())).thenReturn(true);
        assertEquals(0, reminders.sendVaccinationReminders());

        when(notifications.existsByUserAndTitleAndMessageAndCreatedAtAfter(any(), anyString(), anyString(), any())).thenReturn(false);
        Appointment a = Appointment.builder().appointmentId("APT-9").petName("Bella").owner(owner).timeSlot("10:00 AM").build();
        when(appointments.findByAppointmentDateAndStatusIn(eq(LocalDate.of(2026, 10, 13)), any())).thenReturn(List.of(a));
        assertEquals(1, reminders.sendAppointmentReminders());
        verify(mail).sendNotificationEmail(eq("o@x.com"), contains("Reminder"), contains("tomorrow at 10:00 AM"));
    }

    // ============================================================ package bookings

    private ServicePackageBookingService bookingService(ServicePackageBookingRepository repo, CareServiceRepository catalogue) {
        when(repo.save(any(ServicePackageBooking.class))).thenAnswer(i -> i.getArgument(0));
        return new ServicePackageBookingService(repo, catalogue);
    }

    private PackageBookingCreateRequest booking(String owner, String packageId, String name, int sessions) {
        PackageBookingCreateRequest r = new PackageBookingCreateRequest();
        r.setOwnerId(owner);
        r.setPackageId(packageId);
        r.setPackageName(name);
        r.setTotalSessions(sessions);
        return r;
    }

    @Test
    @DisplayName("packages: unknown or inactive catalogue package rejected; catalogue name is recorded; ids are sequential")
    void packageCatalogueRules() {
        ServicePackageBookingRepository repo = mock(ServicePackageBookingRepository.class);
        CareServiceRepository catalogue = mock(CareServiceRepository.class);
        ServicePackageBookingService svc = bookingService(repo, catalogue);

        when(catalogue.findByServiceId("CSR-404")).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> svc.createBooking(booking("USR-1", "CSR-404", "x", 3)));

        CareService off = CareService.builder().serviceId("CSR-1").name("Spa Bundle").active(false).build();
        when(catalogue.findByServiceId("CSR-1")).thenReturn(Optional.of(off));
        assertThrows(BadRequestException.class, () -> svc.createBooking(booking("USR-1", "CSR-1", "x", 3)));

        off.setActive(true);
        when(repo.count()).thenReturn(4L);
        when(repo.existsByBookingId("PKB-000005")).thenReturn(true);
        ServicePackageBookingResponseDto dto = svc.createBooking(booking("USR-1", "CSR-1", "typed by owner", 3));
        assertEquals("Spa Bundle", dto.getPackageName());
        assertEquals("PKB-000006", dto.getBookingId());
        assertEquals(3, dto.getRemainingSessions());
    }

    @Test
    @DisplayName("packages: legacy rows without the active flag follow the old status; expired bookings close and do not block a new purchase")
    void packageExpiry() {
        CareService legacyOn = CareService.builder().status(ServiceStatus.SCHEDULED).active(null).build();
        CareService legacyOff = CareService.builder().status(ServiceStatus.COMPLETED).active(null).build();
        assertTrue(legacyOn.isActive());
        assertFalse(legacyOff.isActive());

        ServicePackageBookingRepository repo = mock(ServicePackageBookingRepository.class);
        ServicePackageBookingService svc = bookingService(repo, mock(CareServiceRepository.class));
        ServicePackageBooking old = ServicePackageBooking.builder().bookingId("PKB-1").ownerId("USR-1").packageName("Spa")
                .status("Active").expiryDate(LocalDate.now().minusDays(1)).totalSessions(3).completedSessions(0).remainingSessions(3).build();
        when(repo.findByOwnerId("USR-1")).thenReturn(List.of(old));
        when(repo.findByBookingId("PKB-1")).thenReturn(Optional.of(old));

        assertEquals("Expired", svc.listBookings("USR-1").get(0).getStatus());
        old.setStatus("Active");
        assertThrows(BadRequestException.class, () -> svc.redeemSession("PKB-1"));
        assertEquals("Expired", old.getStatus());

        old.setStatus("Active");
        assertDoesNotThrow(() -> svc.createBooking(booking("USR-1", null, "Spa", 3)));   // expired one is closed first
        assertEquals("Expired", old.getStatus());
    }

    // ============================================================ care sessions

    private CareServiceLogService careService(CareServiceLogRepository logs, InventoryService inventory, InventoryItemRepository items,
                                              PetRepository pets) {
        when(logs.save(any(CareServiceLog.class))).thenAnswer(i -> i.getArgument(0));
        return new CareServiceLogService(logs, mock(CareProviderRepository.class), pets, mock(RescueCaseRepository.class), inventory, items);
    }

    private CareServiceLog session(ServiceStatus status) {
        return CareServiceLog.builder().serviceLogId("CSL-1").serviceType("Deluxe Spa").petName("Bella").status(status).build();
    }

    @Test
    @DisplayName("care workflow: forward only (skipping allowed), backwards rejected, Completed final, same status is a no-op")
    void careWorkflow() {
        CareServiceLogRepository logs = mock(CareServiceLogRepository.class);
        CareServiceLogService svc = careService(logs, mock(InventoryService.class), mock(InventoryItemRepository.class), mock(PetRepository.class));
        List<ServiceStatus> flow = List.of(ServiceStatus.SCHEDULED, ServiceStatus.CHECKED_IN, ServiceStatus.IN_PROGRESS,
                ServiceStatus.READY_FOR_PICKUP, ServiceStatus.COMPLETED);

        for (int i = 0; i < flow.size(); i++) {
            for (int j = 0; j < flow.size(); j++) {
                CareServiceLog log = session(flow.get(i));
                log.setSuppliesDeducted(true);   // keep inventory out of this test
                when(logs.findByServiceLogId("CSL-1")).thenReturn(Optional.of(log));
                ServiceStatus to = flow.get(j);
                boolean legal = i == j || (i != 4 && j > i);
                if (legal) {
                    assertEquals(to.getJsonValue(), svc.updateStatus("CSL-1", to, null).getStatus(), flow.get(i) + " -> " + to);
                } else {
                    assertThrows(BadRequestException.class, () -> svc.updateStatus("CSL-1", to, null), flow.get(i) + " -> " + to);
                }
            }
        }
    }

    @Test
    @DisplayName("supplies: deducted exactly once per session, even when the status changes twice")
    void suppliesDeductedOnce() {
        CareServiceLogRepository logs = mock(CareServiceLogRepository.class);
        InventoryService inventory = mock(InventoryService.class);
        InventoryItemRepository items = mock(InventoryItemRepository.class);
        InventoryItem oatmeal = InventoryItem.builder().itemId("INV-1").name("Oatmeal Shampoo").sku("OAT").build();
        InventoryItem pawBalm = InventoryItem.builder().itemId("INV-2").name("Paw Pad Balm").sku("PAW").build();
        InventoryItem earFlush = InventoryItem.builder().itemId("INV-3").name("Ear Flush Solution").sku("EAR").build();
        when(items.findAll()).thenReturn(List.of(oatmeal, pawBalm, earFlush));
        CareServiceLogService svc = careService(logs, inventory, items, mock(PetRepository.class));

        CareServiceLog log = session(ServiceStatus.CHECKED_IN);
        when(logs.findByServiceLogId("CSL-1")).thenReturn(Optional.of(log));

        svc.updateStatus("CSL-1", ServiceStatus.IN_PROGRESS, null);
        verify(inventory, times(3)).updateStock(anyString(), eq(-1), anyString());
        assertTrue(Boolean.TRUE.equals(log.getSuppliesDeducted()));

        svc.updateStatus("CSL-1", ServiceStatus.COMPLETED, null);
        verify(inventory, times(3)).updateStock(anyString(), eq(-1), anyString());   // still 3, not 6
    }

    // ============================================================ prescription matching

    private InventoryItem item(String name, String sku) {
        return InventoryItem.builder().name(name).sku(sku).build();
    }

    @Test
    @DisplayName("matching: exact name > exact SKU > prefix > contains > same drug; unrelated items score 0")
    void medicationMatchScores() {
        assertEquals(100, PrescriptionService.matchScore("amoxicillin 250mg", item("Amoxicillin 250mg", "AMX")));
        assertEquals(90, PrescriptionService.matchScore("amx-250", item("Antibiotic", "AMX-250")));
        assertEquals(80, PrescriptionService.matchScore("amoxicillin", item("Amoxicillin 250mg", "AMX")));
        assertEquals(60, PrescriptionService.matchScore("250mg", item("Amoxicillin 250mg", "AMX")));
        assertEquals(50, PrescriptionService.matchScore("amoxicillin 500mg tabs", item("Amoxicillin 250mg", "AMX")));
        assertEquals(0, PrescriptionService.matchScore("amoxicillin", item("Surgical Sutures", "SUT")));
        assertEquals(0, PrescriptionService.matchScore("", item("Anything", "X")));
        assertEquals(0, PrescriptionService.matchScore("abc", item(null, null)));
        // the better of two candidates must win
        assertTrue(PrescriptionService.matchScore("apoquel 16mg", item("Apoquel 16mg", "APQ"))
                > PrescriptionService.matchScore("apoquel 16mg", item("Apoquel 5mg", "APQ5")));
    }

    // ============================================================ inventory: expired status

    @Test
    @DisplayName("expiry: past expiry date reports Expired in responses and on every stock change")
    void expiredStock() {
        InventoryItemRepository items = mock(InventoryItemRepository.class);
        InventoryService inv = new InventoryService(items, mock(SupplierRepository.class), mock(UserRepository.class),
                mock(NotificationService.class), mock(InventoryEventManager.class));
        when(items.save(any(InventoryItem.class))).thenAnswer(i -> i.getArgument(0));
        InventoryItem expired = InventoryItem.builder().itemId("INV-1").name("Old Vaccine").sku("V").currentStock(10)
                .minStockThreshold(2).unit("Vials").status(StockStatus.IN_STOCK).unitPrice(BigDecimal.TEN).sellingPrice(BigDecimal.TEN)
                .expiryDate(LocalDate.now().minusDays(1)).build();
        when(items.findByItemId("INV-1")).thenReturn(Optional.of(expired));

        assertEquals("Expired", inv.getItem("INV-1").getStatus());           // stored IN_STOCK, shown Expired
        assertEquals("Expired", inv.updateStock("INV-1", -1, "dispensed").getStatus());
        assertEquals(StockStatus.EXPIRED, expired.getStatus());

        expired.setExpiryDate(LocalDate.now().plusDays(30));
        assertEquals("InStock", inv.updateStock("INV-1", 1, "restock").getStatus());
    }

    // ============================================================ document size

    @Test
    @DisplayName("documents: a file larger than 10 MB (as base64) is rejected, a normal one is accepted")
    void documentSizeLimit() {
        PetRepository pets = mock(PetRepository.class);
        PetDocumentRepository docs = mock(PetDocumentRepository.class);
        PetService svc = new PetService(pets, mock(UserRepository.class), mock(VaccinationRepository.class), docs,
                mock(AppointmentRepository.class), mock(ConsultationRepository.class), mock(PrescriptionRepository.class));
        User owner = User.builder().userId("USR-1").role(UserRole.PetOwner).build();
        Pet pet = Pet.builder().petId("PET-1").name("Bella").owner(owner).build();
        when(pets.findByPetId("PET-1")).thenReturn(Optional.of(pet));
        when(docs.save(any(PetDocument.class))).thenAnswer(i -> i.getArgument(0));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(owner, null, List.of()));

        PetDocumentRequest req = new PetDocumentRequest();
        req.setPetId("PET-1");
        req.setDocumentType("Medical Report");
        req.setFileName("big.pdf");
        req.setFileUrl("x".repeat(14_000_001));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> svc.uploadPetDocument(req));
        assertTrue(ex.getMessage().contains("10 MB"));

        req.setFileUrl("x".repeat(1000));
        assertDoesNotThrow(() -> svc.uploadPetDocument(req));
    }
}
