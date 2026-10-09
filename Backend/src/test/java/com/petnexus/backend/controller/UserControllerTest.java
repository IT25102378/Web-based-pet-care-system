package com.petnexus.backend.controller;

import com.petnexus.backend.dto.UserResponse;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.service.ApprovalHistoryService;
import com.petnexus.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private ApprovalHistoryService approvalHistoryService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    public void setup() {
        // Use standalone setup to isolate the controller without loading Spring Security filters
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    public void testGetUsers_ReturnsUserList() throws Exception {
        // Arrange
        UserResponse mockResponse = new UserResponse();
        mockResponse.setUserId("USR-001");
        mockResponse.setEmail("test@petnexus.com");
        mockResponse.setRole(UserRole.PetOwner);
        mockResponse.setStatus(UserStatus.Active);
        
        List<UserResponse> userList = Collections.singletonList(mockResponse);
        when(userService.getAllUsers()).thenReturn(userList);

        // Act & Assert
        mockMvc.perform(get("/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value("USR-001"))
                .andExpect(jsonPath("$[0].email").value("test@petnexus.com"));
    }

    @Test
    public void testGetUserById_ReturnsSingleUser() throws Exception {
        // Arrange
        UserResponse mockResponse = new UserResponse();
        mockResponse.setUserId("USR-002");
        mockResponse.setEmail("admin@petnexus.com");
        
        when(userService.getUserById(anyString())).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/users/USR-002")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("USR-002"))
                .andExpect(jsonPath("$.email").value("admin@petnexus.com"));
    }
}
