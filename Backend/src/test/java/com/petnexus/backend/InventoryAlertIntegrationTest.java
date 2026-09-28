package com.petnexus.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petnexus.backend.entity.InventoryItem;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.NotificationType;
import com.petnexus.backend.enums.StockStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.InventoryItemRepository;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
public class InventoryAlertIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User clinicStaff;
    private User clinicManager;
    private User petOwner;
    private InventoryItem lowStockItem;

    private Authentication auth(User u) {
        return new UsernamePasswordAuthenticationToken(
                u,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
        );
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        clinicStaff = userRepository.findByEmail("staff_test@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("STF-TEST-01")
                        .email("staff_test@petnexus.com")
                        .passwordHash("hashed123")
                        .fullName("Staff Test User")
                        .role(UserRole.ClinicStaff)
                        .status(UserStatus.Active)
                        .build()));

        clinicManager = userRepository.findByEmail("manager_test@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("MGR-TEST-01")
                        .email("manager_test@petnexus.com")
                        .passwordHash("hashed123")
                        .fullName("Manager Test User")
                        .role(UserRole.ClinicManager)
                        .status(UserStatus.Active)
                        .build()));

        petOwner = userRepository.findByEmail("owner_test@petnexus.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .userId("OWN-TEST-01")
                        .email("owner_test@petnexus.com")
                        .passwordHash("hashed123")
                        .fullName("Owner Test User")
                        .role(UserRole.PetOwner)
                        .status(UserStatus.Active)
                        .build()));

        lowStockItem = inventoryItemRepository.findBySku("TEST-LOW-SKU-01")
                .orElseGet(() -> inventoryItemRepository.save(InventoryItem.builder()
                        .itemId("INV-TEST-LOW")
                        .name("Critical Antibiotic Syringe")
                        .category("Pharmaceuticals")
                        .sku("TEST-LOW-SKU-01")
                        .batchNumber("BT-TEST-01")
                        .currentStock(2)
                        .minStockThreshold(10)
                        .unit("Vials")
                        .unitPrice(new BigDecimal("500.00"))
                        .sellingPrice(new BigDecimal("800.00"))
                        .status(StockStatus.LOW_STOCK)
                        .build()));
    }

    @Test
    @DisplayName("Clinic Staff can add new inventory item -> 201 Created")
    void testClinicStaffCanAddInventoryItem() throws Exception {
        String itemJson = "{" +
                "\"name\":\"Bandage Roll 10cm\"," +
                "\"category\":\"Surgical\"," +
                "\"sku\":\"SKU-STF-BANDAGE-01\"," +
                "\"batchNumber\":\"BND-001\"," +
                "\"currentStock\":50," +
                "\"minStockThreshold\":10," +
                "\"unit\":\"Rolls\"," +
                "\"unitPrice\":150.00," +
                "\"sellingPrice\":300.00" +
                "}";

        mockMvc.perform(post("/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(itemJson)
                        .with(authentication(auth(clinicStaff))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Bandage Roll 10cm"))
                .andExpect(jsonPath("$.sku").value("SKU-STF-BANDAGE-01"));
    }

    @Test
    @DisplayName("Clinic Staff can update stock (restock) -> 200 OK")
    void testClinicStaffCanRestockItem() throws Exception {
        mockMvc.perform(post("/inventory/" + lowStockItem.getItemId() + "/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantityToAdd\":20,\"reason\":\"Routine clinic staff restocking\"}")
                        .with(authentication(auth(clinicStaff))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(22))
                .andExpect(jsonPath("$.status").value("InStock"));
    }

    @Test
    @DisplayName("Clinic Staff can edit inventory item and changes are saved to database -> 200 OK")
    void testClinicStaffCanEditItemAndEditsArePersistedInDatabase() throws Exception {
        String updateJson = "{" +
                "\"name\":\"Critical Antibiotic Syringe (Updated Formula)\"," +
                "\"category\":\"Pharmaceuticals\"," +
                "\"sku\":\"TEST-LOW-SKU-01\"," +
                "\"batchNumber\":\"BT-UPDATED-99\"," +
                "\"currentStock\":45," +
                "\"minStockThreshold\":15," +
                "\"unit\":\"Vials\"," +
                "\"unitPrice\":620.00," +
                "\"sellingPrice\":950.00," +
                "\"supplierId\":null," +
                "\"supplierName\":\"Direct Certified Pharma\"" +
                "}";

        mockMvc.perform(put("/inventory/" + lowStockItem.getItemId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson)
                        .with(authentication(auth(clinicStaff))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Critical Antibiotic Syringe (Updated Formula)"))
                .andExpect(jsonPath("$.currentStock").value(45))
                .andExpect(jsonPath("$.minStockThreshold").value(15))
                .andExpect(jsonPath("$.batchNumber").value("BT-UPDATED-99"))
                .andExpect(jsonPath("$.unitPrice").value(620.0))
                .andExpect(jsonPath("$.sellingPrice").value(950.0));

        // Directly query database to verify persistent storage in SQL Server table
        InventoryItem dbItem = inventoryItemRepository.findByItemId(lowStockItem.getItemId())
                .orElseThrow(() -> new AssertionError("Item should exist in database"));

        assertEquals("Critical Antibiotic Syringe (Updated Formula)", dbItem.getName());
        assertEquals(Integer.valueOf(45), dbItem.getCurrentStock());
        assertEquals(Integer.valueOf(15), dbItem.getMinStockThreshold());
        assertEquals("BT-UPDATED-99", dbItem.getBatchNumber());
        assertEquals(new BigDecimal("620.00"), dbItem.getUnitPrice());
        assertEquals(new BigDecimal("950.00"), dbItem.getSellingPrice());
        assertEquals(StockStatus.IN_STOCK, dbItem.getStatus());
        assertEquals("Direct Certified Pharma", dbItem.getSupplierName());
    }

    @Test
    @DisplayName("Clinic Manager can oversee and send refill alert to Clinic Staff -> 200 OK")
    void testClinicManagerCanSendRefillAlertToStaff() throws Exception {
        mockMvc.perform(post("/inventory/" + lowStockItem.getItemId() + "/send-refill-alert")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("note", "Immediate morning delivery needed")))
                        .with(authentication(auth(clinicManager))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.staffNotified").isNumber());

        // Verify notification is created for clinic staff
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(clinicStaff);
        assertFalse(notifications.isEmpty(), "Clinic staff should have received a notification");

        Notification alert = notifications.get(0);
        assertEquals(NotificationType.Inventory, alert.getType());
        assertTrue(alert.getTitle().contains("Stocks Nearly Over") || alert.getTitle().contains("Finished"));
        assertTrue(alert.getMessage().contains("Critical Antibiotic Syringe"));
        assertTrue(alert.getMessage().contains("Immediate morning delivery needed"));
    }

    @Test
    @DisplayName("Clinic Manager can send bulk refill alert -> 200 OK")
    void testClinicManagerCanSendBulkRefillAlerts() throws Exception {
        mockMvc.perform(post("/inventory/send-bulk-refill-alerts")
                        .with(authentication(auth(clinicManager))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Pet Owner cannot send refill alerts -> 403 Forbidden")
    void testPetOwnerCannotSendRefillAlert() throws Exception {
        mockMvc.perform(post("/inventory/" + lowStockItem.getItemId() + "/send-refill-alert")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .with(authentication(auth(petOwner))))
                .andExpect(status().isForbidden());
    }
}
