package com.petnexus.backend.whitebox;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.*;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.patterns.observer.InventoryEventManager;
import com.petnexus.backend.patterns.observer.InventoryObserver;
import com.petnexus.backend.patterns.observer.LowStockAlertObserver;
import com.petnexus.backend.patterns.strategy.*;
import com.petnexus.backend.repository.*;
import com.petnexus.backend.service.InventoryService;
import com.petnexus.backend.service.NotificationService;
import com.petnexus.backend.service.PetService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * WHITE-BOX: InventoryService stock arithmetic, the Observer / Strategy / Factory classes,
 * and the PetService validation rules.
 */
class WB4_InventoryPatternsPetRulesTest {

    // =========================================================================== inventory service

    private InventoryItemRepository items;
    private SupplierRepository suppliers;
    private UserRepository users;
    private NotificationService notifications;
    private InventoryEventManager events;
    private InventoryService inventory;

    @BeforeEach
    void setUp() {
        items = mock(InventoryItemRepository.class);
        suppliers = mock(SupplierRepository.class);
        users = mock(UserRepository.class);
        notifications = mock(NotificationService.class);
        events = mock(InventoryEventManager.class);
        inventory = new InventoryService(items, suppliers, users, notifications, events);
        when(items.save(any(InventoryItem.class))).thenAnswer(i -> i.getArgument(0));
        when(items.count()).thenReturn(0L);
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private InventoryItem stock(int current, int min) {
        InventoryItem i = InventoryItem.builder().itemId("INV-1").name("Amoxicillin").sku("AMX").currentStock(current)
                .minStockThreshold(min).unit("Boxes").status(StockStatus.IN_STOCK).unitPrice(BigDecimal.TEN)
                .sellingPrice(BigDecimal.TEN).build();
        when(items.findByItemId("INV-1")).thenReturn(Optional.of(i));
        return i;
    }

    private InventoryItemRequest newItem(Integer stock, Integer min) {
        return InventoryItemRequest.builder().name(" Item ").category("Med").sku("SKU-1").unit("Boxes")
                .currentStock(stock).minStockThreshold(min).unitPrice(BigDecimal.TEN).sellingPrice(BigDecimal.TEN).build();
    }

    @Test
    @DisplayName("status boundaries: stock 0 -> OUT, <= threshold -> LOW, > threshold -> IN")
    void statusBoundaries() {
        assertEquals("OutOfStock", inventory.addInventoryItem(newItem(0, 5)).getStatus());
        assertEquals("LowStock", inventory.addInventoryItem(newItem(5, 5)).getStatus());
        assertEquals("LowStock", inventory.addInventoryItem(newItem(1, 5)).getStatus());
        assertEquals("InStock", inventory.addInventoryItem(newItem(6, 5)).getStatus());
    }

    @Test
    @DisplayName("add: defaults (stock 0, threshold 5), required fields, SKU uniqueness, expiry and supplier checks")
    void addValidation() {
        assertEquals(0, inventory.addInventoryItem(newItem(null, null)).getCurrentStock());
        assertEquals(5, inventory.addInventoryItem(newItem(null, null)).getMinStockThreshold());

        InventoryItemRequest noName = newItem(1, 1);
        noName.setName(" ");
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(noName));
        InventoryItemRequest noCat = newItem(1, 1);
        noCat.setCategory(null);
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(noCat));
        InventoryItemRequest noSku = newItem(1, 1);
        noSku.setSku("");
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(noSku));
        InventoryItemRequest noUnit = newItem(1, 1);
        noUnit.setUnit(null);
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(noUnit));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(newItem(-1, 1)));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(newItem(1, -1)));

        InventoryItemRequest negPrice = newItem(1, 1);
        negPrice.setUnitPrice(new BigDecimal("-1"));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(negPrice));
        InventoryItemRequest negSell = newItem(1, 1);
        negSell.setSellingPrice(new BigDecimal("-1"));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(negSell));
        InventoryItemRequest underCost = newItem(1, 1);
        underCost.setUnitPrice(new BigDecimal("20"));
        underCost.setSellingPrice(new BigDecimal("10"));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(underCost));

        InventoryItemRequest expired = newItem(1, 1);
        expired.setExpiryDate(LocalDate.now().minusDays(1));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(expired));

        when(items.existsBySku("SKU-1")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(newItem(1, 1)));
        when(items.existsBySku("SKU-1")).thenReturn(false);

        InventoryItemRequest withSupplier = newItem(1, 1);
        withSupplier.setSupplierId("SUP-1");
        when(suppliers.findBySupplierId("SUP-1")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> inventory.addInventoryItem(withSupplier));
        Supplier inactive = Supplier.builder().supplierId("SUP-1").companyName("Z").active(false).build();
        when(suppliers.findBySupplierId("SUP-1")).thenReturn(Optional.of(inactive));
        assertThrows(BadRequestException.class, () -> inventory.addInventoryItem(withSupplier));
        inactive.setActive(true);
        assertEquals("Z", inventory.addInventoryItem(withSupplier).getSupplierName());
    }

    @Test
    @DisplayName("id generation skips taken ids after deletions")
    void idGeneration() {
        when(items.count()).thenReturn(3L);
        when(items.existsByItemId("INV-104")).thenReturn(true);
        assertEquals("INV-105", inventory.addInventoryItem(newItem(1, 1)).getItemId());
    }

    @Test
    @DisplayName("updateStock: zero/null rejected, below zero rejected, add and remove notify observers with before/after")
    void updateStock() {
        assertThrows(BadRequestException.class, () -> inventory.updateStock("INV-1", null, "x"));
        assertThrows(BadRequestException.class, () -> inventory.updateStock("INV-1", 0, "x"));

        InventoryItem i = stock(10, 5);
        assertThrows(BadRequestException.class, () -> inventory.updateStock("INV-1", -11, "x"));
        assertEquals(10, i.getCurrentStock());

        InventoryItemResponse added = inventory.updateStock("INV-1", 5, "delivery");
        assertEquals(15, added.getCurrentStock());
        verify(events).notifyObservers(i, 10, 15);

        InventoryItemResponse removed = inventory.updateStock("INV-1", -15, "dispensed");
        assertEquals("OutOfStock", removed.getStatus());
        verify(events).notifyObservers(i, 15, 0);

        when(items.findByItemId("NOPE")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> inventory.updateStock("NOPE", 1, "x"));
    }

    @Test
    @DisplayName("update: observers fire only when stock really changed; negatives and SKU clash rejected")
    void updateItem() {
        InventoryItem i = stock(10, 5);
        InventoryItemRequest same = InventoryItemRequest.builder().currentStock(10).build();
        inventory.updateInventoryItem("INV-1", same);
        verify(events, never()).notifyObservers(any(), anyInt(), anyInt());

        inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().currentStock(3).minStockThreshold(4).build());
        verify(events).notifyObservers(i, 10, 3);
        assertEquals(StockStatus.LOW_STOCK, i.getStatus());

        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().currentStock(-1).build()));
        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().minStockThreshold(-1).build()));
        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().unitPrice(new BigDecimal("-1")).build()));
        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().sellingPrice(new BigDecimal("-1")).build()));
        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().sellingPrice(BigDecimal.ONE).build()));

        when(items.existsBySku("TAKEN")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().sku("TAKEN").build()));
    }

    @Test
    @DisplayName("update supplier link: set active supplier, reject inactive, blank id unlinks, name-only edit")
    void updateSupplierLink() {
        InventoryItem i = stock(10, 5);
        Supplier active = Supplier.builder().supplierId("SUP-1").companyName("Zoetis").active(true).build();
        when(suppliers.findBySupplierId("SUP-1")).thenReturn(Optional.of(active));
        inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().supplierId("SUP-1").build());
        assertEquals("Zoetis", i.getSupplierName());

        Supplier off = Supplier.builder().supplierId("SUP-2").companyName("Old").active(false).build();
        when(suppliers.findBySupplierId("SUP-2")).thenReturn(Optional.of(off));
        assertThrows(BadRequestException.class, () -> inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().supplierId("SUP-2").build()));

        inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().supplierId(" ").supplierName("Manual Vendor").build());
        assertNull(i.getSupplier());
        assertEquals("Manual Vendor", i.getSupplierName());

        inventory.updateInventoryItem("INV-1", InventoryItemRequest.builder().supplierName("Renamed").build());
        assertEquals("Renamed", i.getSupplierName());
    }

    @Test
    @DisplayName("refill alerts: no staff -> 0; one alert per staff; message differs for zero vs low; bulk summarises 5 + 'more'")
    void refillAlerts() {
        stock(0, 5);
        when(users.findByRole(UserRole.ClinicStaff)).thenReturn(List.of());
        assertEquals(0, inventory.sendRefillAlert("INV-1", null));

        User s1 = User.builder().userId("S1").build();
        User s2 = User.builder().userId("S2").build();
        when(users.findByRole(UserRole.ClinicStaff)).thenReturn(List.of(s1, s2));
        assertEquals(2, inventory.sendRefillAlert("INV-1", "  please hurry "));
        verify(notifications, times(2)).createNotification(anyString(), eq(NotificationType.Inventory), anyString(),
                org.mockito.ArgumentMatchers.contains("finished (0 remaining)"), anyString());

        when(items.findLowStockItems()).thenReturn(List.of());
        assertEquals(0, inventory.sendBulkLowStockAlerts());

        List<InventoryItem> many = new ArrayList<>();
        for (int n = 0; n < 7; n++) {
            many.add(InventoryItem.builder().itemId("I" + n).name("Item" + n).currentStock(1).minStockThreshold(5).unit("Box").build());
        }
        when(items.findLowStockItems()).thenReturn(many);
        assertEquals(7, inventory.sendBulkLowStockAlerts());
        verify(notifications, atLeastOnce()).createNotification(anyString(), any(), eq("Urgent: 7 Item(s) Require Refill"),
                org.mockito.ArgumentMatchers.contains("and 2 more items"), anyString());

        when(users.findByRole(UserRole.ClinicStaff)).thenReturn(List.of());
        assertEquals(0, inventory.sendBulkLowStockAlerts());
    }

    @Test
    @DisplayName("list filters: category and status (by enum name or json value)")
    void listFilters() {
        InventoryItem a = InventoryItem.builder().itemId("A").category("Meds").status(StockStatus.LOW_STOCK).build();
        InventoryItem b = InventoryItem.builder().itemId("B").category("Food").status(StockStatus.IN_STOCK).build();
        when(items.findAll()).thenReturn(List.of(a, b));
        assertEquals(2, inventory.listInventory(null, null).size());
        assertEquals(1, inventory.listInventory("meds", null).size());
        assertEquals(1, inventory.listInventory(null, "LOW_STOCK").size());
        assertEquals(1, inventory.listInventory(null, "LowStock").size());
        assertEquals(0, inventory.listInventory("Meds", "InStock").size());
    }

    // =========================================================================== observer

    @Test
    @DisplayName("observer manager: add ignores null and duplicates, remove works, one failing observer does not stop the rest")
    void eventManager() {
        InventoryObserver good = mock(InventoryObserver.class);
        InventoryObserver bad = mock(InventoryObserver.class);
        doThrow(new RuntimeException("boom")).when(bad).update(any(), anyInt(), anyInt());

        InventoryEventManager m = new InventoryEventManager(null);
        assertTrue(m.getRegisteredObservers().isEmpty());
        m.addObserver(null);
        m.addObserver(bad);
        m.addObserver(bad);
        m.addObserver(good);
        assertEquals(2, m.getRegisteredObservers().size());

        InventoryItem item = InventoryItem.builder().name("X").build();
        assertDoesNotThrow(() -> m.notifyObservers(item, 5, 1));
        verify(good).update(item, 5, 1);

        m.removeObserver(bad);
        assertEquals(1, m.getRegisteredObservers().size());
    }

    @Test
    @DisplayName("low-stock observer: alerts every manager only at/below threshold; repository failure is swallowed")
    void lowStockObserver() {
        NotificationRepository repo = mock(NotificationRepository.class);
        UserRepository ur = mock(UserRepository.class);
        LowStockAlertObserver o = new LowStockAlertObserver(new NotificationFactory(), repo, ur);
        when(ur.findByRole(UserRole.ClinicManager)).thenReturn(List.of(User.builder().userId("M1").build(), User.builder().userId("M2").build()));
        InventoryItem item = InventoryItem.builder().name("Sutures").sku("S").minStockThreshold(10).build();

        o.update(item, 20, 11);
        verifyNoInteractions(repo);                 // above threshold
        o.update(item, 20, 10);
        verify(repo, times(2)).save(any(Notification.class));   // at threshold -> both managers
        o.update(item, 20, 0);
        verify(repo, times(4)).save(any(Notification.class));

        when(repo.save(any())).thenThrow(new RuntimeException("db down"));
        assertDoesNotThrow(() -> o.update(item, 20, 1));
        when(ur.findByRole(UserRole.ClinicManager)).thenThrow(new RuntimeException("db down"));
        assertDoesNotThrow(() -> o.update(item, 20, 1));
    }

    // =========================================================================== strategy

    private FeeCalculationContext context() {
        StandardConsultationStrategy std = new StandardConsultationStrategy();
        return new FeeCalculationContext(List.of(std, new EmergencyTriageStrategy(), new SeniorPetDiscountStrategy(),
                new RescueAnimalWelfareStrategy()), std);
    }

    @Test
    @DisplayName("strategy resolution priority: rescue > emergency > senior(>=8) > standard; missing strategy falls back to default")
    void strategyResolution() {
        FeeCalculationContext c = context();
        assertEquals("RESCUE_WELFARE", c.resolveStrategy(12, true, true).getStrategyName());
        assertEquals("EMERGENCY_TRIAGE", c.resolveStrategy(12, true, false).getStrategyName());
        assertEquals("SENIOR_PET_DISCOUNT", c.resolveStrategy(8, false, false).getStrategyName());
        assertEquals("STANDARD", c.resolveStrategy(7, false, false).getStrategyName());
        assertEquals("STANDARD", c.resolveStrategy(0, false, false).getStrategyName());

        StandardConsultationStrategy std = new StandardConsultationStrategy();
        FeeCalculationContext onlyDefault = new FeeCalculationContext(List.of(std), std);
        assertEquals("STANDARD", onlyDefault.resolveStrategy(12, true, true).getStrategyName());
        assertEquals("STANDARD", onlyDefault.resolveStrategy(12, true, false).getStrategyName());
        assertEquals("STANDARD", onlyDefault.resolveStrategy(12, false, false).getStrategyName());
    }

    @Test
    @DisplayName("strategy maths: each formula, rounding to 2 dp, explicit name override, unknown name falls back")
    void strategyMaths() {
        FeeCalculationContext c = context();
        assertEquals(3500.00, c.computeFee(3500, 3, false, false), 0.0001);
        assertEquals(2975.00, c.computeFee(3500, 9, false, false), 0.0001);
        assertEquals(6750.00, c.computeFee(3500, 3, true, false), 0.0001);
        assertEquals(0.00, c.computeFee(3500, 3, false, true), 0.0001);
        assertEquals(33.33, c.computeFee(33.333, 3, false, false), 0.0001);
        assertEquals(0.00, c.computeFee(-5, 3, false, false), 0.0001);   // never negative
        assertEquals(0.00, c.computeFeeWithStrategy("RESCUE_WELFARE", 100, 3, false, false), 0.0001);
        assertEquals(100.00, c.computeFeeWithStrategy("NO_SUCH", 100, 3, false, false), 0.0001);
        assertEquals(4, c.getAllStrategies().size());
        for (var s : c.getAllStrategies().values()) {
            assertFalse(s.getDescription().isBlank());
        }
    }

    // =========================================================================== factory

    @Test
    @DisplayName("factory: every typed method sets type, link, unread flag and an NTF- id; generic create defaults")
    void factory() {
        NotificationFactory f = new NotificationFactory();
        User u = User.builder().userId("U").build();
        List<Notification> all = List.of(
                f.createAppointmentNotification(u, "APT-1", "Bella", "tomorrow", "Confirmed"),
                f.createInventoryLowStockNotification(u, "Item", "SKU", 1, 5),
                f.createVaccinationReminderNotification(u, "Bella", "Rabies", "2027-01-01"),
                f.createRescueIntakeNotification(u, "RC-1", "Galle", "high"),
                f.createAdoptionStatusNotification(u, "APP-1", "Milo", "Approved", "ok"));
        NotificationType[] expected = {NotificationType.Appointment, NotificationType.Inventory, NotificationType.Health,
                NotificationType.Rescue, NotificationType.Adoption};
        for (int i = 0; i < all.size(); i++) {
            Notification n = all.get(i);
            assertEquals(expected[i], n.getType());
            assertTrue(n.getNotificationId().startsWith("NTF-"));
            assertFalse(n.isRead());
            assertNotNull(n.getLink());
            assertNotNull(n.getCreatedAt());
        }
        assertTrue(all.get(3).getTitle().contains("HIGH"));

        Notification generic = f.create(u, null, null, null, "  ");
        assertEquals(NotificationType.System, generic.getType());
        assertEquals("System Notification", generic.getTitle());
        assertEquals("", generic.getMessage());
        assertEquals("", generic.getLink());
        assertNull(f.create(u, NotificationType.System, "t", "m", null).getLink());
    }

    // =========================================================================== pet rules

    private PetService petService(PetRepository pets, UserRepository ur) {
        return new PetService(pets, ur, mock(VaccinationRepository.class), mock(PetDocumentRepository.class),
                mock(AppointmentRepository.class), mock(ConsultationRepository.class), mock(PrescriptionRepository.class));
    }

    private void login(User u) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u, null, List.of()));
    }

    @Test
    @DisplayName("pet validation: weight, dob, age, months and age-vs-dob consistency (with 1 month leeway)")
    void petValidation() {
        PetRepository pets = mock(PetRepository.class);
        UserRepository ur = mock(UserRepository.class);
        User owner = User.builder().userId("USR-1").role(UserRole.PetOwner).build();
        when(ur.findByUserId("USR-1")).thenReturn(Optional.of(owner));
        when(pets.save(any(Pet.class))).thenAnswer(i -> i.getArgument(0));
        PetService svc = petService(pets, ur);
        login(owner);

        PetRequest base = PetRequest.builder().name("Rex").species("Dog").breed("Lab").build();
        assertDoesNotThrow(() -> svc.createPet(base));

        PetRequest zeroWeight = PetRequest.builder().name("Rex").weightKg(BigDecimal.ZERO).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(zeroWeight));
        PetRequest futureDob = PetRequest.builder().name("Rex").dateOfBirth(LocalDate.now().plusDays(1)).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(futureDob));
        PetRequest negAge = PetRequest.builder().name("Rex").ageYears(-1).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(negAge));
        PetRequest badMonths = PetRequest.builder().name("Rex").ageMonths(12).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(badMonths));
        PetRequest negMonths = PetRequest.builder().name("Rex").ageMonths(-1).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(negMonths));

        LocalDate dob = LocalDate.now().minusYears(5);
        PetRequest yearsMatch = PetRequest.builder().name("Rex").dateOfBirth(dob).ageYears(5).build();
        assertDoesNotThrow(() -> svc.createPet(yearsMatch));
        PetRequest yearsMismatch = PetRequest.builder().name("Rex").dateOfBirth(dob).ageYears(2).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(yearsMismatch));
        PetRequest monthsMatch = PetRequest.builder().name("Rex").dateOfBirth(dob).ageYears(5).ageMonths(1).build();
        assertDoesNotThrow(() -> svc.createPet(monthsMatch));          // within one month leeway
        PetRequest monthsMismatch = PetRequest.builder().name("Rex").dateOfBirth(dob).ageYears(5).ageMonths(6).build();
        assertThrows(BadRequestException.class, () -> svc.createPet(monthsMismatch));
        PetRequest dobOnly = PetRequest.builder().name("Rex").dateOfBirth(dob).build();
        assertDoesNotThrow(() -> svc.createPet(dobOnly));              // no age given -> nothing to compare
    }

    @Test
    @DisplayName("pet create/update: owner forced to caller; staff needs ownerId; ownership transfer needs privileged role")
    void petOwnershipRules() {
        PetRepository pets = mock(PetRepository.class);
        UserRepository ur = mock(UserRepository.class);
        User owner = User.builder().userId("USR-1").role(UserRole.PetOwner).build();
        User other = User.builder().userId("USR-2").role(UserRole.PetOwner).build();
        User staff = User.builder().userId("USR-3").role(UserRole.ClinicStaff).build();
        when(ur.findByUserId("USR-1")).thenReturn(Optional.of(owner));
        when(ur.findByUserId("USR-2")).thenReturn(Optional.of(other));
        when(pets.save(any(Pet.class))).thenAnswer(i -> i.getArgument(0));
        PetService svc = petService(pets, ur);

        login(owner);
        PetRequest r = PetRequest.builder().ownerId("USR-2").name("Rex").build();
        assertEquals("USR-1", svc.createPet(r).getOwnerId());

        login(staff);
        assertThrows(BadRequestException.class, () -> svc.createPet(PetRequest.builder().name("Rex").build()));
        assertEquals("USR-2", svc.createPet(PetRequest.builder().ownerId("USR-2").name("Rex").build()).getOwnerId());

        Pet pet = Pet.builder().petId("PET-1").name("Rex").owner(owner).build();
        when(pets.findByPetId("PET-1")).thenReturn(Optional.of(pet));
        login(owner);
        assertDoesNotThrow(() -> svc.updatePet("PET-1", PetRequest.builder().ownerId("USR-1").name("Rexy").build()));   // same owner id -> no transfer
        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> svc.updatePet("PET-1", PetRequest.builder().ownerId("USR-2").name("Rexy").build()));              // transfer by owner
        login(staff);
        svc.updatePet("PET-1", PetRequest.builder().ownerId("USR-2").name("Rexy").build());                             // transfer by staff
        assertEquals("USR-2", pet.getOwner().getUserId());
    }
}
