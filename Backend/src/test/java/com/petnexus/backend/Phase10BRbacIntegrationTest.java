package com.petnexus.backend;

import com.petnexus.backend.dto.PetRequest;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Phase 10B — Role-Based Access Control (RBAC).
 */
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class Phase10BRbacIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    private User targetUser;
    private Pet ownerPet;
    private Pet otherPet;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();



        // Create a target user for approval tests
        targetUser = User.builder()
                .userId("U-TARGET-123")
                .email("target@example.com")
                .fullName("Target Vet")
                .passwordHash("hashedpassword")
                .role(UserRole.Veterinarian)
                .status(UserStatus.PendingApproval)
                .build();
        userRepository.save(targetUser);

        // Create a test owner
        User owner = User.builder()
                .userId("owner1")
                .email("owner1@example.com")
                .fullName("Owner One")
                .passwordHash("hash")
                .role(UserRole.PetOwner)
                .status(UserStatus.Active)
                .build();
        userRepository.save(owner);

        // Create another owner
        User owner2 = User.builder()
                .userId("owner2")
                .email("owner2@example.com")
                .fullName("Owner Two")
                .passwordHash("hash")
                .role(UserRole.PetOwner)
                .status(UserStatus.Active)
                .build();
        userRepository.save(owner2);

        ownerPet = Pet.builder()
                .petId("PET-OWNER-1")
                .owner(owner)
                .name("Buddy")
                .species("Dog")
                .breed("Golden Retriever")
                .build();
        petRepository.save(ownerPet);

        otherPet = Pet.builder()
                .petId("PET-OTHER-1")
                .owner(owner2)
                .name("Max")
                .species("Cat")
                .breed("Persian")
                .build();
        petRepository.save(otherPet);
    }

    private org.springframework.security.core.Authentication getAuth(User user) {
        org.springframework.security.core.authority.SimpleGrantedAuthority authority =
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        return new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(user, null, java.util.List.of(authority));
    }

    @Test
    @DisplayName("1. Admin can approve user -> 200 OK")
    void testAdminCanApproveUser() throws Exception {
        User admin = User.builder().userId("admin1").role(UserRole.Admin).email("a@a.com").build();
        mockMvc.perform(post("/users/" + targetUser.getUserId() + "/approve")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(getAuth(admin))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("2. Clinic Manager can access inventory -> 200 OK")
    void testClinicManagerCanAccessInventory() throws Exception {
        User manager = User.builder().userId("manager1").role(UserRole.ClinicManager).email("m@m.com").build();
        mockMvc.perform(get("/inventory")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(getAuth(manager))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("3. Pet Owner cannot access inventory -> 403 Forbidden")
    void testPetOwnerCannotAccessInventory() throws Exception {
        mockMvc.perform(get("/inventory")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(getAuth(ownerPet.getOwner()))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Pet Owner can only access own pets (update own pet) -> 200 OK")
    void testPetOwnerCanOnlyAccessOwnPets_UpdateOwn_Success() throws Exception {
        PetRequest request = PetRequest.builder()
                .name("Buddy Updated")
                .species("Dog")
                .breed("Golden Retriever")
                .build();
        
        mockMvc.perform(put("/pets/" + ownerPet.getPetId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(getAuth(ownerPet.getOwner()))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("4b. Pet Owner cannot access other's pets (update other pet) -> 403 Forbidden")
    void testPetOwnerCannotAccessOtherPets() throws Exception {
        PetRequest request = PetRequest.builder()
                .name("Max Updated")
                .species("Cat")
                .breed("Persian")
                .build();

        mockMvc.perform(put("/pets/" + otherPet.getPetId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(getAuth(ownerPet.getOwner()))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Veterinarian cannot approve user -> 403 Forbidden")
    void testVeterinarianCannotApproveUser() throws Exception {
        User vet = User.builder().userId("vet1").role(UserRole.Veterinarian).email("v@v.com").build();
        mockMvc.perform(post("/users/" + targetUser.getUserId() + "/approve")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(getAuth(vet))))
                .andExpect(status().isForbidden());
    }
}
