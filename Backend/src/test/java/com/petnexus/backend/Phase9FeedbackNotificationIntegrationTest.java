package com.petnexus.backend;

import com.petnexus.backend.controller.FeedbackController;
import com.petnexus.backend.controller.NotificationController;
import com.petnexus.backend.controller.SupplierController;
import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.Feedback;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.Supplier;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.FeedbackRepository;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.SupplierRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.service.FeedbackService;
import com.petnexus.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@Transactional
public class Phase9FeedbackNotificationIntegrationTest {

    @Autowired
    private FeedbackController feedbackController;

    @Autowired
    private NotificationController notificationController;

    @Autowired
    private SupplierController supplierController;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testOwner;
    private User testManager;

    private void mockAuth(User user) {
        org.springframework.security.core.authority.SimpleGrantedAuthority authority =
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken authToken =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(user, null, java.util.List.of(authority));
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    @BeforeEach
    void setUp() {
        testOwner = userRepository.findByEmail("test.owner@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-TEST-OWNER")
                        .email("test.owner@petnexus.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .fullName("Test Owner Kavindu")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        testManager = userRepository.findByEmail("manager@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-005")
                        .email("manager@petnexus.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .fullName("Himashi Gunawardena")
                        .role(UserRole.ClinicManager)
                        .status(UserStatus.Active)
                        .build()));

        mockAuth(testOwner);
    }

    // -------------------------------------------------------------
    // 1. Submit Feedback - Success
    // -------------------------------------------------------------
    @Test
    @DisplayName("1. Submit Feedback - Success")
    void testSubmitFeedbackSuccess() {
        FeedbackRequest request = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .userName(testOwner.getFullName())
                .serviceCategory("Veterinary Consultation")
                .rating(5)
                .title("Excellent dental checkup for Barnaby")
                .comments("Dr. Wijesinghe was very thorough and gentle during Barnaby's scaling procedure.")
                .staffMentioned("Dr. Sachini Wijesinghe")
                .build();

        ResponseEntity<FeedbackResponse> response = feedbackController.submitFeedback(request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        FeedbackResponse f = response.getBody();
        assertNotNull(f.getFeedbackId());
        assertTrue(f.getFeedbackId().startsWith("FDB-"));
        assertEquals("Excellent dental checkup for Barnaby", f.getTitle());
        assertEquals(5, f.getRating());
        assertEquals("Veterinary Consultation", f.getServiceCategory());
        assertEquals(testOwner.getUserId(), f.getUserId());
        assertNull(f.getManagerResponse());

        // Also verify Clinic Manager received notification
        // Switch auth to manager before fetching manager's notifications
        mockAuth(testManager);
        List<NotificationResponse> mgrNotifs = notificationController.getNotifications(testManager.getUserId()).getBody();
        assertNotNull(mgrNotifs);
        assertTrue(mgrNotifs.stream().anyMatch(n -> n.getTitle().equals("New Client Feedback Submitted")));
        mockAuth(testOwner); // restore
    }

    // -------------------------------------------------------------
    // 2. Retrieve Feedback by ID - Success
    // -------------------------------------------------------------
    @Test
    @DisplayName("2. Retrieve Feedback by ID - Success")
    void testGetFeedbackById() {
        FeedbackRequest request = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Grooming & Spa")
                .rating(4)
                .title("Hydrotherapy Bath Review")
                .comments("Great experience, fur smells wonderful.")
                .build();

        FeedbackResponse created = feedbackController.submitFeedback(request).getBody();
        assertNotNull(created);

        ResponseEntity<FeedbackResponse> getRes = feedbackController.getFeedbackById(created.getFeedbackId());
        assertEquals(HttpStatus.OK, getRes.getStatusCode());
        assertNotNull(getRes.getBody());
        assertEquals(created.getFeedbackId(), getRes.getBody().getFeedbackId());
        assertEquals("Hydrotherapy Bath Review", getRes.getBody().getTitle());
    }

    // -------------------------------------------------------------
    // 3. List Feedback & Filter by Category and User
    // -------------------------------------------------------------
    @Test
    @DisplayName("3. List Feedback & Filter by Category and User")
    void testListAndFilterFeedback() {
        FeedbackRequest f1 = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Boarding & Daycare")
                .rating(5)
                .title("Weekend Boarding")
                .comments("Safe and caring environment.")
                .build();

        FeedbackRequest f2 = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Rescue & Adoption Process")
                .rating(5)
                .title("Adoption Triage")
                .comments("Very clear process.")
                .build();

        feedbackController.submitFeedback(f1);
        feedbackController.submitFeedback(f2);

        // Filter by user
        ResponseEntity<List<FeedbackResponse>> userFeedbacks = feedbackController.getFeedbacks(testOwner.getUserId(), null, null);
        assertTrue(userFeedbacks.getBody().size() >= 2);

        // Filter by category
        ResponseEntity<List<FeedbackResponse>> boardingFeedbacks = feedbackController.getFeedbacks(null, "Boarding & Daycare", null);
        assertTrue(boardingFeedbacks.getBody().stream().anyMatch(f -> f.getServiceCategory().equals("Boarding & Daycare")));
    }

    // -------------------------------------------------------------
    // 4. Feedback Validation - Missing Title or Comments
    // -------------------------------------------------------------
    @Test
    @DisplayName("4. Feedback Validation - Missing Title or Comments")
    void testFeedbackMissingFields() {
        FeedbackRequest emptyReq = FeedbackRequest.builder().build();
        assertThrows(BadRequestException.class, () -> feedbackController.submitFeedback(emptyReq));

        FeedbackRequest noTitle = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Grooming")
                .rating(5)
                .comments("Great")
                .build();
        assertThrows(BadRequestException.class, () -> feedbackController.submitFeedback(noTitle));

        FeedbackRequest noComments = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Grooming")
                .rating(5)
                .title("Great")
                .build();
        assertThrows(BadRequestException.class, () -> feedbackController.submitFeedback(noComments));
    }

    // -------------------------------------------------------------
    // 5. Invalid Rating - Rejection (<1 or >5)
    // -------------------------------------------------------------
    @Test
    @DisplayName("5. Invalid Rating Rejection")
    void testInvalidRatingRejection() {
        FeedbackRequest zeroRating = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Pharma")
                .rating(0)
                .title("Zero star")
                .comments("Bad")
                .build();
        assertThrows(BadRequestException.class, () -> feedbackController.submitFeedback(zeroRating));

        FeedbackRequest sixRating = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Pharma")
                .rating(6)
                .title("Six stars")
                .comments("Too much")
                .build();
        assertThrows(BadRequestException.class, () -> feedbackController.submitFeedback(sixRating));
    }

    // -------------------------------------------------------------
    // 6. Invalid User Reference
    // -------------------------------------------------------------
    @Test
    @DisplayName("6. Invalid User Reference Rejection")
    void testInvalidUserReference() {
        FeedbackRequest ghostUser = FeedbackRequest.builder()
                .userId("USR-NON-EXISTENT")
                .serviceCategory("Pharma")
                .rating(5)
                .title("Ghost")
                .comments("Ghost comments")
                .build();
        assertThrows(ResourceNotFoundException.class, () -> feedbackController.submitFeedback(ghostUser));
    }

    // -------------------------------------------------------------
    // 7. Manager Respond to Feedback - Success & Author Notification
    // -------------------------------------------------------------
    @Test
    @DisplayName("7. Manager Respond to Feedback - Success & Author Notification")
    void testManagerRespondToFeedback() {
        mockAuth(testOwner);
        FeedbackRequest req = FeedbackRequest.builder()
                .userId(testOwner.getUserId())
                .serviceCategory("Veterinary Consultation")
                .rating(5)
                .title("Barnaby's ear infection solved")
                .comments("Rapid recovery after drops.")
                .build();

        FeedbackResponse created = feedbackController.submitFeedback(req).getBody();
        assertNotNull(created);

        mockAuth(testManager);
        FeedbackRespondRequest reply = FeedbackRespondRequest.builder()
                .responseText("We are delighted Barnaby is feeling better!")
                .build();

        ResponseEntity<FeedbackResponse> replyRes = feedbackController.respondToFeedback(created.getFeedbackId(), reply);
        assertEquals(HttpStatus.OK, replyRes.getStatusCode());
        assertEquals("We are delighted Barnaby is feeling better!", replyRes.getBody().getManagerResponse());
        assertNotNull(replyRes.getBody().getManagerRespondedAt());

        // Verify notification delivered to feedback author
        // Switch auth to owner before fetching owner's notifications
        mockAuth(testOwner);
        List<NotificationResponse> ownerNotifs = notificationController.getNotifications(testOwner.getUserId()).getBody();
        assertNotNull(ownerNotifs);
        assertTrue(ownerNotifs.stream().anyMatch(n -> n.getTitle().equals("Clinic Manager Responded to Your Review")));
    }

    // -------------------------------------------------------------
    // 8. Manager Respond Validation - Missing Text or Invalid ID
    // -------------------------------------------------------------
    @Test
    @DisplayName("8. Manager Respond Validation")
    void testManagerRespondValidation() {
        mockAuth(testManager);
        FeedbackRespondRequest emptyReply = FeedbackRespondRequest.builder().responseText("").build();
        assertThrows(BadRequestException.class, () -> feedbackController.respondToFeedback("FDB-001", emptyReply));

        FeedbackRespondRequest validReply = FeedbackRespondRequest.builder().responseText("Official clinic reply").build();
        assertThrows(ResourceNotFoundException.class, () -> feedbackController.respondToFeedback("FDB-NON-EXISTENT", validReply));
    }

    // -------------------------------------------------------------
    // 9. Dispatch & Retrieve Notification
    // -------------------------------------------------------------
    @Test
    @DisplayName("9. Dispatch & Retrieve Notification")
    void testDispatchAndRetrieveNotification() {
        NotificationResponse n = notificationService.createNotification(
                testOwner.getUserId(),
                NotificationType.Appointment,
                "Vaccine Due Soon",
                "Barnaby's rabies booster is scheduled for next Tuesday.",
                "/owner/appointments"
        );

        assertNotNull(n);
        assertEquals("Vaccine Due Soon", n.getTitle());
        assertEquals("Appointment", n.getType());
        assertFalse(n.isRead());

        ResponseEntity<List<NotificationResponse>> listRes = notificationController.getNotifications(testOwner.getUserId());
        assertEquals(HttpStatus.OK, listRes.getStatusCode());
        assertTrue(listRes.getBody().stream().anyMatch(item -> item.getNotificationId().equals(n.getNotificationId())));
    }

    // -------------------------------------------------------------
    // 10. Mark Single Notification as Read
    // -------------------------------------------------------------
    @Test
    @DisplayName("10. Mark Single Notification as Read")
    void testMarkSingleNotificationRead() {
        NotificationResponse n = notificationService.createNotification(
                testOwner.getUserId(),
                NotificationType.Health,
                "Lab Test Results Ready",
                "Blood chemistry results are available.",
                "/owner/records"
        );

        assertFalse(n.isRead());

        ResponseEntity<NotificationResponse> readRes = notificationController.markAsRead(n.getNotificationId());
        assertEquals(HttpStatus.OK, readRes.getStatusCode());
        assertTrue(readRes.getBody().isRead());

        // Verify in database
        Notification dbNotif = notificationRepository.findByNotificationId(n.getNotificationId()).orElseThrow();
        assertTrue(dbNotif.isRead());
    }

    // -------------------------------------------------------------
    // 11. Mark All Notifications as Read
    // -------------------------------------------------------------
    @Test
    @DisplayName("11. Mark All Notifications as Read for User")
    void testMarkAllAsRead() {
        notificationService.createNotification(testOwner.getUserId(), NotificationType.System, "Notice 1", "M1", "/link");
        notificationService.createNotification(testOwner.getUserId(), NotificationType.System, "Notice 2", "M2", "/link");

        long unreadBefore = notificationService.getUnreadCount(testOwner.getUserId());
        assertTrue(unreadBefore >= 2);

        ResponseEntity<Boolean> result = notificationController.markAllAsRead(testOwner.getUserId());
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertTrue(result.getBody());

        long unreadAfter = notificationService.getUnreadCount(testOwner.getUserId());
        assertEquals(0, unreadAfter);
    }

    // -------------------------------------------------------------
    // 12. Invalid Notification ID Handling
    // -------------------------------------------------------------
    @Test
    @DisplayName("12. Invalid Notification ID Returns 404")
    void testInvalidNotificationId() {
        assertThrows(ResourceNotFoundException.class, () -> notificationController.markAsRead("NTF-NON-EXISTENT"));
    }

    // -------------------------------------------------------------
    // 13. Automatic Notification on Purchase Order Dispatch
    // -------------------------------------------------------------
    @Test
    @DisplayName("13. Automatic Notification on Purchase Order Dispatch")
    void testPurchaseOrderNotification() {
        mockAuth(testManager);
        Supplier sup = supplierRepository.findBySupplierId("SUP-PO-TEST")
                .orElseGet(() -> supplierRepository.save(Supplier.builder()
                        .supplierId("SUP-PO-TEST")
                        .companyName("Pharma Logistics Direct")
                        .email("orders@pharmadirect.lk")
                        .active(true)
                        .build()));

        PurchaseOrderRequest poReq = PurchaseOrderRequest.builder()
                .supplierId(sup.getSupplierId())
                .supplierName(sup.getCompanyName())
                .itemsDescription("100x Suture packs")
                .totalAmount(new BigDecimal("75000.00"))
                .build();

        supplierController.createPurchaseOrder(poReq);

        // Verify Clinic Manager received an Inventory notification
        mockAuth(testManager);
        List<NotificationResponse> mgrNotifs = notificationController.getNotifications(testManager.getUserId()).getBody();
        assertNotNull(mgrNotifs);
        assertTrue(mgrNotifs.stream().anyMatch(n -> n.getType().equals("Inventory") && n.getTitle().equals("Purchase Order Dispatched")));
    }

    // -------------------------------------------------------------
    // 14. Notifications Isolation between Users
    // -------------------------------------------------------------
    @Test
    @DisplayName("14. Notifications Isolation between Users")
    void testNotificationsIsolation() {
        User otherUser = userRepository.findByEmail("other.client@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("USR-OTHER-CLIENT")
                        .email("other.client@petnexus.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .fullName("Other Client")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        notificationService.createNotification(testOwner.getUserId(), NotificationType.Appointment, "Owner Only Notice", "Private", null);
        notificationService.createNotification(otherUser.getUserId(), NotificationType.Adoption, "Other Only Notice", "Private", null);

        // Fetch each user's notifications as themselves
        mockAuth(testOwner);
        List<NotificationResponse> ownerList = notificationController.getNotifications(testOwner.getUserId()).getBody();
        mockAuth(otherUser);
        List<NotificationResponse> otherList = notificationController.getNotifications(otherUser.getUserId()).getBody();

        assertTrue(ownerList.stream().anyMatch(n -> n.getTitle().equals("Owner Only Notice")));
        assertFalse(ownerList.stream().anyMatch(n -> n.getTitle().equals("Other Only Notice")));

        assertTrue(otherList.stream().anyMatch(n -> n.getTitle().equals("Other Only Notice")));
        assertFalse(otherList.stream().anyMatch(n -> n.getTitle().equals("Owner Only Notice")));
    }
}
