package com.petnexus.backend.acceptance;

import com.petnexus.backend.dto.UserResponse;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.service.UserService;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class UserApprovalSteps {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private String targetUserId;

    @Given("a pending user exists with email {string}")
    public void a_pending_user_exists_with_email(String email) {
        // Find existing user or ensure one exists in test DB
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setUserId("USR-TEST");
            user.setEmail(email);
            user.setFullName("Test User");
            user.setPasswordHash("hashed_password");
            user.setPhone("1234567890");
            user.setAddress("123 Test St");
            user.setRole(com.petnexus.backend.enums.UserRole.Veterinarian);
            user.setStatus(UserStatus.PendingApproval);
            user = userRepository.save(user);
        } else {
            user.setStatus(UserStatus.PendingApproval);
            user = userRepository.save(user);
        }
        targetUserId = user.getUserId();
    }

    @When("the admin approves the user")
    public void the_admin_approves_the_user() {
        userService.approveUser(targetUserId, "SystemAdmin");
    }

    @Then("the user status should become {string}")
    public void the_user_status_should_become(String expectedStatus) {
        UserResponse response = userService.getUserById(targetUserId);
        assertNotNull(response);
        assertEquals(expectedStatus, response.getStatus().name());
    }
}
