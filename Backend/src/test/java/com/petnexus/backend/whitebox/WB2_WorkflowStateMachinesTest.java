package com.petnexus.backend.whitebox;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.*;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.*;
import com.petnexus.backend.service.NotificationService;
import com.petnexus.backend.service.PurchaseOrderService;
import com.petnexus.backend.service.RescueCaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * WHITE-BOX: the two explicit state machines in the codebase, tested exhaustively
 * (every from-state x every to-state) so each edge of the transition graph is covered.
 */
class WB2_WorkflowStateMachinesTest {

    // =========================================================================== rescue case workflow

    private static final List<String> RESCUE_STATES =
            List.of("Reported", "Intake", "InTreatment", "ReadyForFoster", "InFoster", "ReadyForAdoption", "Adopted", "Closed");

    /** Expected graph (from the rescue workflow spec). */
    private static final Map<String, Set<String>> RESCUE_GRAPH = Map.of(
            "Reported", Set.of("Intake", "InTreatment", "ReadyForFoster", "Closed"),
            "Intake", Set.of("InTreatment", "ReadyForFoster", "InFoster", "ReadyForAdoption", "Closed"),
            "InTreatment", Set.of("ReadyForFoster", "InFoster", "ReadyForAdoption", "Closed"),
            "ReadyForFoster", Set.of("InFoster", "ReadyForAdoption", "InTreatment", "Closed"),
            "InFoster", Set.of("ReadyForAdoption", "ReadyForFoster", "InTreatment", "Closed"),
            "ReadyForAdoption", Set.of("Adopted", "InFoster", "ReadyForFoster", "Closed"),
            "Adopted", Set.of("Closed"),
            "Closed", Set.of());

    private RescueCaseRepository cases;
    private AdoptionListingRepository listings;
    private FosterRecordRepository fosters;
    private RescueCaseService rescue;

    @BeforeEach
    void setUp() {
        cases = mock(RescueCaseRepository.class);
        listings = mock(AdoptionListingRepository.class);
        fosters = mock(FosterRecordRepository.class);
        when(cases.save(any(RescueCase.class))).thenAnswer(i -> i.getArgument(0));
        rescue = new RescueCaseService(cases, mock(RescueProgressLogRepository.class), mock(RescuePhotoRepository.class),
                listings, mock(AdoptionApplicationRepository.class), mock(UserRepository.class), mock(NotificationService.class), fosters);
    }

    private RescueCase caseIn(String status) {
        RescueCase c = RescueCase.builder().caseId("RSC-1").temporaryName("Rex").species("Dog").status(status)
                .isPublishedForAdoption(false).build();
        when(cases.findByCaseId("RSC-1")).thenReturn(Optional.of(c));
        return c;
    }

    @Test
    @DisplayName("rescue graph: all 64 (from,to) pairs behave exactly as the specification graph says")
    void rescueTransitionsExhaustive() {
        int allowed = 0;
        int rejected = 0;
        for (String from : RESCUE_STATES) {
            for (String to : RESCUE_STATES) {
                caseIn(from);
                RescueCaseRequest req = new RescueCaseRequest();
                req.setStatus(to);
                if (from.equals(to) || RESCUE_GRAPH.get(from).contains(to)) {
                    assertDoesNotThrow(() -> rescue.updateRescueCase("RSC-1", req), from + " -> " + to);
                    allowed++;
                } else {
                    BadRequestException ex = assertThrows(BadRequestException.class,
                            () -> rescue.updateRescueCase("RSC-1", req), from + " -> " + to);
                    assertTrue(ex.getMessage().contains("Invalid status transition"));
                    rejected++;
                }
            }
        }
        assertEquals(64, allowed + rejected);
        assertTrue(rejected > 0 && allowed > 0);
    }

    @Test
    @DisplayName("rescue: unknown target status is rejected; unknown current status allows nothing")
    void rescueUnknownStates() {
        caseIn("Intake");
        RescueCaseRequest req = new RescueCaseRequest();
        req.setStatus("Teleported");
        assertThrows(BadRequestException.class, () -> rescue.updateRescueCase("RSC-1", req));

        caseIn("LegacyStatus");
        req.setStatus("Closed");
        assertThrows(BadRequestException.class, () -> rescue.updateRescueCase("RSC-1", req));
    }

    @Test
    @DisplayName("rescue publish rule: only a ReadyForAdoption case (current or being moved to) can be published")
    void rescuePublishRule() {
        caseIn("InTreatment");
        RescueCaseRequest publish = new RescueCaseRequest();
        publish.setIsPublishedForAdoption(true);
        assertThrows(BadRequestException.class, () -> rescue.updateRescueCase("RSC-1", publish));

        // moving to ReadyForAdoption in the same request makes the publish legal -> listing is created
        caseIn("InFoster");
        RescueCaseRequest both = new RescueCaseRequest();
        both.setStatus("ReadyForAdoption");
        both.setIsPublishedForAdoption(true);
        assertDoesNotThrow(() -> rescue.updateRescueCase("RSC-1", both));
        verify(listings).save(any(AdoptionListing.class));

        // unpublish an existing listing
        caseIn("ReadyForAdoption");
        AdoptionListing existing = new AdoptionListing();
        existing.setPublishedForAdoption(true);
        when(listings.findByRescueCase_CaseId("RSC-1")).thenReturn(Optional.of(existing));
        RescueCaseRequest off = new RescueCaseRequest();
        off.setIsPublishedForAdoption(false);
        rescue.updateRescueCase("RSC-1", off);
        assertFalse(existing.isPublishedForAdoption());
    }

    @Test
    @DisplayName("rescue accept-report: only a 'Reported' case can be accepted")
    void acceptReportGuard() {
        caseIn("Intake");
        assertThrows(BadRequestException.class, () -> rescue.acceptRescueReport("RSC-1", null));
        RescueCase c = caseIn("Reported");
        rescue.acceptRescueReport("RSC-1", "notes");
        assertEquals("Intake", c.getStatus());
    }

    @Test
    @DisplayName("rescue create / report: required-field validation branches and severity normalisation")
    void rescueCreateValidation() {
        RescueCaseRequest empty = new RescueCaseRequest();
        BadRequestException ex = assertThrows(BadRequestException.class, () -> rescue.createRescueCase(empty));
        assertTrue(ex.getMessage().contains("temporaryName") && ex.getMessage().contains("species") && ex.getMessage().contains("rescueLocation"));

        assertThrows(BadRequestException.class, () -> rescue.reportAnimalForRescue(new RescueCaseRequest()));
        RescueCaseRequest noLocation = new RescueCaseRequest();
        noLocation.setSpecies("Cat");
        assertThrows(BadRequestException.class, () -> rescue.reportAnimalForRescue(noLocation));

        when(cases.existsByCaseId(anyString())).thenReturn(false);
        RescueCaseRequest ok = new RescueCaseRequest();
        ok.setSpecies("Cat");
        ok.setRescueLocation("Temple Rd");
        ok.setConditionSeverity("critical - bleeding");
        when(cases.findByCaseId(anyString())).thenAnswer(i -> Optional.of(RescueCase.builder().caseId(i.getArgument(0))
                .status("Reported").conditionSeverity("Critical").build()));
        RescueCaseResponse res = rescue.reportAnimalForRescue(ok);
        assertEquals("Reported", res.getStatus());
        assertEquals("Critical", res.getConditionSeverity());
    }

    @Test
    @DisplayName("rescue: unknown case id -> ResourceNotFound on get, add log, add photo")
    void rescueNotFound() {
        when(cases.findByCaseId("NOPE")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> rescue.getRescueCaseById("NOPE"));
        assertThrows(ResourceNotFoundException.class, () -> rescue.addProgressLog("NOPE", new RescueProgressLogRequest()));
        assertThrows(ResourceNotFoundException.class, () -> rescue.addPhoto("NOPE", new RescuePhotoRequest()));
    }

    @Test
    @DisplayName("rescue log / photo validation: title, loggedBy and photoUrl are mandatory")
    void rescueLogPhotoValidation() {
        caseIn("Intake");
        RescueProgressLogRequest noTitle = new RescueProgressLogRequest();
        noTitle.setLoggedBy("Vet");
        assertThrows(BadRequestException.class, () -> rescue.addProgressLog("RSC-1", noTitle));
        RescueProgressLogRequest noWho = new RescueProgressLogRequest();
        noWho.setTitle("T");
        assertThrows(BadRequestException.class, () -> rescue.addProgressLog("RSC-1", noWho));
        assertThrows(BadRequestException.class, () -> rescue.addPhoto("RSC-1", new RescuePhotoRequest()));
        FosterAssignRequest f = new FosterAssignRequest();
        assertThrows(BadRequestException.class, () -> rescue.assignFoster("RSC-1", f));
    }

    // =========================================================================== foster capacity + reporter privacy

    private FosterRecord family(int active, int max, String status) {
        FosterRecord f = FosterRecord.builder().fosterId("FST-1").fullName("Perera Family")
                .activePlacements(active).maxCapacity(max).status(status).build();
        when(fosters.findByFosterId("FST-1")).thenReturn(Optional.of(f));
        return f;
    }

    @Test
    @DisplayName("foster: placement uses one slot, a full or inactive family is refused, leaving foster frees the slot")
    void fosterCapacity() {
        FosterAssignRequest assign = new FosterAssignRequest();
        assign.setFosterId("FST-1");
        assign.setFosterName("Perera Family");

        RescueCase c = caseIn("ReadyForFoster");
        FosterRecord roomy = family(1, 2, "Active");
        rescue.assignFoster("RSC-1", assign);
        assertEquals(2, roomy.getActivePlacements());
        assertEquals("InFoster", c.getStatus());

        caseIn("ReadyForFoster");
        FosterRecord full = family(2, 2, "Active");
        BadRequestException ex = assertThrows(BadRequestException.class, () -> rescue.assignFoster("RSC-1", assign));
        assertTrue(ex.getMessage().contains("full capacity"));
        assertEquals(2, full.getActivePlacements());

        caseIn("ReadyForFoster");
        family(0, 2, "Inactive");
        assertThrows(BadRequestException.class, () -> rescue.assignFoster("RSC-1", assign));

        // leaving foster care releases the placement
        RescueCase inFoster = caseIn("InFoster");
        inFoster.setFosterParentId("FST-1");
        FosterRecord busy = family(2, 3, "Active");
        RescueCaseRequest back = new RescueCaseRequest();
        back.setStatus("ReadyForAdoption");
        rescue.updateRescueCase("RSC-1", back);
        assertEquals(1, busy.getActivePlacements());
    }

    @Test
    @DisplayName("privacy: reporter name and phone are hidden from anonymous visitors and other owners")
    void reporterPrivacy() {
        RescueCase c = RescueCase.builder().caseId("RSC-9").temporaryName("Rex").species("Dog").status("Intake")
                .reportedByUserId("USR-001").reportedByUserName("Kavindu").reportedByUserPhone("0771234567").build();
        when(cases.findAll()).thenReturn(java.util.List.of(c));
        org.springframework.security.core.context.SecurityContextHolder.clearContext();

        RescueCaseResponse anonymous = rescue.getAllRescueCases(null, null, null).get(0);
        assertNull(anonymous.getReportedByUserName());
        assertNull(anonymous.getReportedByUserPhone());

        authenticate(com.petnexus.backend.entity.User.builder().userId("USR-009").role(UserRole.PetOwner).build());
        assertNull(rescue.getAllRescueCases(null, null, null).get(0).getReportedByUserPhone());

        authenticate(com.petnexus.backend.entity.User.builder().userId("USR-001").role(UserRole.PetOwner).build());
        assertEquals("0771234567", rescue.getAllRescueCases(null, null, null).get(0).getReportedByUserPhone());

        authenticate(com.petnexus.backend.entity.User.builder().userId("USR-006").role(UserRole.RescueOfficer).build());
        assertEquals("Kavindu", rescue.getAllRescueCases(null, null, null).get(0).getReportedByUserName());
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("report: the reporter identity comes from the logged-in owner, not from the request body")
    void reporterFromToken() {
        authenticate(com.petnexus.backend.entity.User.builder().userId("USR-001").fullName("Kavindu Perera")
                .phone("0771234567").role(UserRole.PetOwner).build());
        when(cases.findByCaseId(anyString())).thenAnswer(i -> Optional.of(RescueCase.builder().caseId(i.getArgument(0)).status("Reported").build()));
        RescueCaseRequest req = new RescueCaseRequest();
        req.setSpecies("Cat");
        req.setRescueLocation("Temple Rd");
        req.setReportedByUserId("USR-HACKER");
        req.setReportedByUserName("Somebody Else");
        rescue.reportAnimalForRescue(req);
        var captor = org.mockito.ArgumentCaptor.forClass(RescueCase.class);
        verify(cases).save(captor.capture());
        assertEquals("USR-001", captor.getValue().getReportedByUserId());
        assertEquals("Kavindu Perera", captor.getValue().getReportedByUserName());
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    private void authenticate(com.petnexus.backend.entity.User u) {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(u, null, java.util.List.of()));
    }

    // =========================================================================== purchase order workflow

    private static final List<String> PO_STATES = List.of("Pending", "Approved", "Dispatched", "Shipped", "Delivered", "Cancelled");
    private static final Map<String, Set<String>> PO_GRAPH = Map.of(
            "Pending", Set.of("Approved", "Cancelled"),
            "Approved", Set.of("Dispatched", "Cancelled"),
            "Dispatched", Set.of("Shipped", "Cancelled"),
            "Shipped", Set.of("Delivered"),
            "Delivered", Set.of(),
            "Cancelled", Set.of());

    private PurchaseOrderRepository orders;
    private PurchaseOrderService poService;

    private void poSetUp() {
        orders = mock(PurchaseOrderRepository.class);
        when(orders.save(any(PurchaseOrder.class))).thenAnswer(i -> i.getArgument(0));
        poService = new PurchaseOrderService(orders, mock(SupplierRepository.class), mock(NotificationService.class));
    }

    private PurchaseOrder orderIn(String status) {
        PurchaseOrder po = PurchaseOrder.builder().orderId("PO-1").supplierName("Zoetis").totalAmount(new BigDecimal("1000")).status(status).build();
        when(orders.findByOrderId("PO-1")).thenReturn(Optional.of(po));
        return po;
    }

    @Test
    @DisplayName("purchase order graph: all 36 (from,to) pairs follow the specification; terminal states are immutable")
    void purchaseOrderTransitionsExhaustive() {
        poSetUp();
        for (String from : PO_STATES) {
            for (String to : PO_STATES) {
                orderIn(from);
                PurchaseOrderUpdateRequest req = PurchaseOrderUpdateRequest.builder().status(to).build();
                boolean legal = PO_GRAPH.get(from).contains(to);
                if (legal) {
                    assertEquals(to, poService.updatePurchaseOrder("PO-1", req).getStatus(), from + " -> " + to);
                } else {
                    assertThrows(BadRequestException.class, () -> poService.updatePurchaseOrder("PO-1", req), from + " -> " + to);
                }
            }
        }
    }

    @Test
    @DisplayName("purchase order: invalid status name, non-positive amount, notes/items update, unknown id")
    void purchaseOrderFieldRules() {
        poSetUp();
        orderIn("Pending");
        assertThrows(BadRequestException.class, () -> poService.updatePurchaseOrder("PO-1",
                PurchaseOrderUpdateRequest.builder().status("Bogus").build()));
        assertThrows(BadRequestException.class, () -> poService.updatePurchaseOrder("PO-1",
                PurchaseOrderUpdateRequest.builder().totalAmount(BigDecimal.ZERO).build()));
        PurchaseOrderDetailResponse res = poService.updatePurchaseOrder("PO-1",
                PurchaseOrderUpdateRequest.builder().itemsDescription("Vaccines").totalAmount(new BigDecimal("2500")).notes("Rush").build());
        assertEquals(new BigDecimal("2500"), res.getTotalAmount());

        when(orders.findByOrderId("PO-X")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> poService.getPurchaseOrder("PO-X"));
    }

    @Test
    @DisplayName("purchase order dispatch: idempotent when Dispatched; legal from Approved; illegal from Pending")
    void purchaseOrderDispatch() {
        poSetUp();
        orderIn("Dispatched");
        assertEquals("Dispatched", poService.dispatchOrder("PO-1").getStatus());
        verify(orders, never()).save(any());

        orderIn("Approved");
        assertEquals("Dispatched", poService.dispatchOrder("PO-1").getStatus());

        orderIn("Pending");
        assertThrows(BadRequestException.class, () -> poService.dispatchOrder("PO-1"));
    }

    @Test
    @DisplayName("purchase order cancel: allowed for non-terminal states, rejected for Delivered / Cancelled")
    void purchaseOrderCancel() {
        poSetUp();
        for (String s : List.of("Pending", "Approved", "Dispatched", "Shipped")) {
            PurchaseOrder po = orderIn(s);
            poService.cancelOrder("PO-1");
            assertEquals("Cancelled", po.getStatus(), s);
        }
        for (String s : List.of("Delivered", "Cancelled")) {
            orderIn(s);
            assertThrows(BadRequestException.class, () -> poService.cancelOrder("PO-1"), s);
        }
    }

    @Test
    @DisplayName("purchase order create: supplier name, amount and supplier existence checks")
    void purchaseOrderCreateRules() {
        poSetUp();
        SupplierRepository suppliers = mock(SupplierRepository.class);
        poService = new PurchaseOrderService(orders, suppliers, mock(NotificationService.class));

        assertThrows(BadRequestException.class, () -> poService.createPurchaseOrder(
                PurchaseOrderRequest.builder().supplierName(" ").totalAmount(BigDecimal.TEN).build()));
        assertThrows(BadRequestException.class, () -> poService.createPurchaseOrder(
                PurchaseOrderRequest.builder().supplierName("Z").totalAmount(BigDecimal.ZERO).build()));
        assertThrows(BadRequestException.class, () -> poService.createPurchaseOrder(
                PurchaseOrderRequest.builder().supplierName("Z").totalAmount(null).build()));

        when(suppliers.findBySupplierId("SUP-X")).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> poService.createPurchaseOrder(
                PurchaseOrderRequest.builder().supplierName("Z").supplierId("SUP-X").totalAmount(BigDecimal.TEN).build()));

        when(suppliers.findBySupplierId("SUP-OFF")).thenReturn(Optional.of(
                Supplier.builder().supplierId("SUP-OFF").companyName("Inactive Vendor").email("off@vendor.lk").active(false).build()));
        assertThrows(BadRequestException.class, () -> poService.createPurchaseOrder(
                PurchaseOrderRequest.builder().supplierName("Z").supplierId("SUP-OFF").totalAmount(BigDecimal.TEN).build()));

        when(suppliers.findBySupplierId("SUP-1")).thenReturn(Optional.of(
                Supplier.builder().supplierId("SUP-1").companyName("Zoetis Lanka").email("z@vendor.lk").active(true).build()));
        PurchaseOrderDetailResponse created = poService.createPurchaseOrder(
                PurchaseOrderRequest.builder().supplierName("Z").supplierId("SUP-1").totalAmount(BigDecimal.TEN).build());
        assertEquals("Zoetis Lanka", created.getSupplierName(), "the stored name comes from the supplier record");
    }
}
