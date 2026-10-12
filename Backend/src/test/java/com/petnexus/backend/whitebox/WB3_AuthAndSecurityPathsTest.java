package com.petnexus.backend.whitebox;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.*;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.EmailAlreadyExistsException;
import com.petnexus.backend.exception.UserNotFoundException;
import com.petnexus.backend.repository.PetRepository;
import com.petnexus.backend.repository.UserRepository;
import com.petnexus.backend.security.JwtAuthenticationFilter;
import com.petnexus.backend.security.JwtProperties;
import com.petnexus.backend.security.JwtService;
import com.petnexus.backend.security.SecurityUtils;
import com.petnexus.backend.service.ApprovalHistoryService;
import com.petnexus.backend.service.EmailService;
import com.petnexus.backend.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * WHITE-BOX: UserService (register / login / approval / password), JwtService,
 * JwtAuthenticationFilter and SecurityUtils - one test per decision branch.
 */
class WB3_AuthAndSecurityPathsTest {

    private UserRepository users;
    private PetRepository pets;
    private PasswordEncoder encoder;
    private JwtService jwt;
    private ApprovalHistoryService history;
    private EmailService email;
    private UserService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        pets = mock(PetRepository.class);
        encoder = new BCryptPasswordEncoder(4);
        jwt = new JwtService(new JwtProperties());
        history = mock(ApprovalHistoryService.class);
        email = mock(EmailService.class);
        service = new UserService(users, pets, encoder, jwt, history, email);
        when(users.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private User stored(UserStatus status) {
        User u = User.builder().userId("USR-1").email("a@b.com").fullName("A B").role(UserRole.PetOwner)
                .passwordHash(encoder.encode("Passw0rd1")).status(status).build();
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(u));
        when(users.findByUserId("USR-1")).thenReturn(Optional.of(u));
        return u;
    }

    private static ResetPasswordRequest resetReq(String token, String pw) {
        ResetPasswordRequest r = new ResetPasswordRequest();
        r.setToken(token);
        r.setNewPassword(pw);
        return r;
    }

    private static ChangePasswordRequest changeReq(String current, String pw) {
        ChangePasswordRequest r = new ChangePasswordRequest();
        r.setCurrentPassword(current);
        r.setNewPassword(pw);
        return r;
    }

    private LoginRequest login(String pw) {
        return new LoginRequest("a@b.com", pw);
    }

    private void authenticate(User u) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u, null, List.of()));
    }

    // ------------------------------------------------------------------ register

    private RegisterRequest reg(UserRole role) {
        return RegisterRequest.builder().email("New@Test.com ").password("Passw0rd1").fullName("New Person")
                .phone("0771234567").role(role).licenseNumber("L-1").specialization("Surgery").staffId("S-1")
                .managerCode("M-1").badgeNumber("B-1").serviceSpecialty("Grooming").build();
    }

    @Test
    @DisplayName("register: each role builds its own subclass with role-specific fields; e-mail normalised; password hashed")
    void registerBuildsSubclass() {
        when(users.count()).thenReturn(0L);
        for (UserRole role : UserRole.values()) {
            if (role == UserRole.Admin) continue;
            service.register(reg(role));
        }
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users, times(6)).save(captor.capture());
        List<User> saved = captor.getAllValues();
        assertTrue(saved.stream().anyMatch(u -> u instanceof Veterinarian v && "L-1".equals(v.getLicenseNumber())));
        assertTrue(saved.stream().anyMatch(u -> u instanceof ClinicStaff s && "S-1".equals(s.getStaffId())));
        assertTrue(saved.stream().anyMatch(u -> u instanceof ClinicManager m && "M-1".equals(m.getManagerCode())));
        assertTrue(saved.stream().anyMatch(u -> u instanceof RescueOfficer r && "B-1".equals(r.getBadgeNumber())));
        assertTrue(saved.stream().anyMatch(u -> u instanceof PetCareProvider p && "Grooming".equals(p.getServiceSpecialty())));
        assertTrue(saved.stream().anyMatch(u -> u instanceof PetOwner));
        for (User u : saved) {
            assertEquals("new@test.com", u.getEmail());
            assertNotEquals("Passw0rd1", u.getPasswordHash());
            assertTrue(encoder.matches("Passw0rd1", u.getPasswordHash()));
            assertEquals(UserStatus.PendingApproval, u.getStatus());
            assertNotNull(u.getApprovalToken());
        }
    }

    @Test
    @DisplayName("register: admin role blocked, duplicate e-mail blocked, avatar default vs supplied, id skips taken numbers")
    void registerGuards() {
        assertThrows(BadRequestException.class, () -> service.register(reg(UserRole.Admin)));

        when(users.existsByEmail(anyString())).thenReturn(true);
        assertThrows(EmailAlreadyExistsException.class, () -> service.register(reg(UserRole.PetOwner)));
        when(users.existsByEmail(anyString())).thenReturn(false);

        when(users.count()).thenReturn(4L);
        when(users.existsByUserId("USR-005")).thenReturn(true);
        UserService.RegisterResponse res = service.register(reg(UserRole.PetOwner));
        assertEquals("USR-006", res.userId());

        RegisterRequest withAvatar = reg(UserRole.PetOwner);
        withAvatar.setAvatarUrl("https://x/y.png");
        service.register(withAvatar);
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users, atLeastOnce()).save(captor.capture());
        assertEquals("https://x/y.png", captor.getValue().getAvatarUrl());
    }

    // ------------------------------------------------------------------ login

    @Test
    @DisplayName("login: unknown e-mail, null hash, wrong password all give the same generic error")
    void loginCredentialErrors() {
        when(users.findByEmail("a@b.com")).thenReturn(Optional.empty());
        assertEquals("Invalid email or password.", assertThrows(BadRequestException.class, () -> service.login(login("x"))).getMessage());

        User u = stored(UserStatus.Active);
        u.setPasswordHash(null);
        assertEquals("Invalid email or password.", assertThrows(BadRequestException.class, () -> service.login(login("x"))).getMessage());

        u.setPasswordHash(encoder.encode("Passw0rd1"));
        assertEquals("Invalid email or password.", assertThrows(BadRequestException.class, () -> service.login(login("wrong"))).getMessage());
    }

    @Test
    @DisplayName("login: every account status has its own outcome")
    void loginStatusMatrix() {
        User u = stored(null);
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("unassigned"));

        u.setStatus(UserStatus.PendingEmailVerification);
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("verify"));
        u.setStatus(UserStatus.PendingApproval);
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("awaiting"));

        u.setStatus(UserStatus.Rejected);
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("criteria were not met"));
        u.setRejectionReason("Bad docs");
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("Bad docs"));

        u.setStatus(UserStatus.Suspended);
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("Account suspended"));
        u.setSuspensionReason("Fraud");
        assertTrue(assertThrows(BadRequestException.class, () -> service.login(login("Passw0rd1"))).getMessage().contains("Fraud"));

        u.setStatus(UserStatus.Active);
        LoginResponse ok = service.login(login("Passw0rd1"));
        assertEquals("a@b.com", jwt.extractEmail(ok.getToken()));
    }

    // ------------------------------------------------------------------ admin workflow

    @Test
    @DisplayName("approve: only PendingApproval accounts; clears reasons and records history")
    void approve() {
        User u = stored(UserStatus.Active);
        assertThrows(BadRequestException.class, () -> service.approveUser("USR-1", "USR-7"));
        u.setStatus(UserStatus.PendingApproval);
        u.setRejectionReason("old");
        service.approveUser("USR-1", "USR-7");
        assertEquals(UserStatus.Active, u.getStatus());
        assertNull(u.getRejectionReason());
        verify(history).recordAction(u, "APPROVED", "USR-7", null);
        u.setStatus(UserStatus.PendingApproval);
        service.approveUser("USR-1");   // overload defaults the admin id to "System"
        when(users.findByUserId("NOPE")).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> service.approveUser("NOPE"));
    }

    @Test
    @DisplayName("reject / suspend / reactivate: default reasons, admin protected from suspension")
    void rejectSuspendReactivate() {
        User u = stored(UserStatus.PendingApproval);
        service.rejectUser("USR-1", null, "USR-7");
        assertEquals(UserStatus.Rejected, u.getStatus());
        assertTrue(u.getRejectionReason().contains("Documentation"));
        service.rejectUser("USR-1", "Custom reason");
        assertEquals("Custom reason", u.getRejectionReason());

        service.suspendUser("USR-1", null, "USR-7");
        assertTrue(u.getSuspensionReason().contains("suspended by System Administrator"));
        service.suspendUser("USR-1", "Custom");
        assertEquals("Custom", u.getSuspensionReason());

        service.reactivateUser("USR-1", "USR-7");
        assertEquals(UserStatus.Active, u.getStatus());
        assertNull(u.getSuspensionReason());
        service.reactivateUser("USR-1");

        u.setRole(UserRole.Admin);
        assertThrows(BadRequestException.class, () -> service.suspendUser("USR-1", "x", "USR-7"));
    }

    // ------------------------------------------------------------------ password flows

    @Test
    @DisplayName("forgot password: token + e-mail only for known address; message identical either way")
    void forgotPassword() {
        stored(UserStatus.Active);
        String known = service.forgotPassword(" A@B.com ");
        verify(email).sendPasswordResetEmail(eq("a@b.com"), anyString());
        when(users.findByEmail("ghost@x.com")).thenReturn(Optional.empty());
        String unknown = service.forgotPassword("ghost@x.com");
        assertEquals(known, unknown);
        verify(email, times(1)).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    @DisplayName("reset password: invalid token rejected; valid token changes hash and is cleared")
    void resetPassword() {
        when(users.findByPasswordResetToken("bad")).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> service.resetPassword(resetReq("bad", "NewPass123")));

        User u = stored(UserStatus.Active);
        u.setPasswordResetToken("good");
        when(users.findByPasswordResetToken("good")).thenReturn(Optional.of(u));
        service.resetPassword(resetReq("good", "NewPass123"));
        assertNull(u.getPasswordResetToken());
        assertTrue(encoder.matches("NewPass123", u.getPasswordHash()));
    }

    @Test
    @DisplayName("change password: ownership enforced when authenticated, wrong current rejected, success re-hashes")
    void changePassword() {
        User u = stored(UserStatus.Active);
        ChangePasswordRequest wrong = changeReq("nope", "NewPass123");
        assertThrows(BadRequestException.class, () -> service.changePassword("USR-1", wrong));

        authenticate(User.builder().userId("USR-OTHER").role(UserRole.PetOwner).build());
        assertThrows(AccessDeniedException.class, () -> service.changePassword("USR-1", changeReq("Passw0rd1", "NewPass123")));

        authenticate(u);
        service.changePassword("USR-1", changeReq("Passw0rd1", "NewPass123"));
        assertTrue(encoder.matches("NewPass123", u.getPasswordHash()));

        when(users.findByUserId("NOPE")).thenReturn(Optional.empty());
        authenticate(User.builder().userId("NOPE").role(UserRole.PetOwner).build());
        assertThrows(UserNotFoundException.class, () -> service.changePassword("NOPE", wrong));
    }

    // ------------------------------------------------------------------ profile & lookups

    @Test
    @DisplayName("profile update: professional fields only for the matching role or admin; role/status untouched")
    void profileUpdate() {
        Veterinarian vet = Veterinarian.builder().userId("USR-V").fullName("Vet").role(UserRole.Veterinarian).licenseNumber("OLD").build();
        when(users.findByUserId("USR-V")).thenReturn(Optional.of(vet));
        authenticate(vet);
        UpdateProfileRequest r = new UpdateProfileRequest();
        r.setFullName("New Vet");
        r.setLicenseNumber("NEW");
        r.setSpecialization("Cardio");
        r.setBadgeNumber("B-999");   // not a rescue officer: ignored
        service.updateUserProfile("USR-V", r);
        assertEquals("New Vet", vet.getFullName());
        assertEquals("NEW", vet.getLicenseNumber());
        assertEquals("Cardio", vet.getSpecialization());
        assertEquals(UserRole.Veterinarian, vet.getRole());

        PetOwner owner = PetOwner.builder().userId("USR-O").fullName("Own").role(UserRole.PetOwner).build();
        when(users.findByUserId("USR-O")).thenReturn(Optional.of(owner));
        authenticate(owner);
        UpdateProfileRequest o = new UpdateProfileRequest();
        o.setLicenseNumber("HACK");
        o.setPhone("0771234567");
        service.updateUserProfile("USR-O", o);
        assertEquals("0771234567", owner.getPhone());

        authenticate(vet);
        assertThrows(AccessDeniedException.class, () -> service.updateUserProfile("USR-O", o));

        User admin = User.builder().userId("USR-A").role(UserRole.Admin).build();
        authenticate(admin);
        UpdateProfileRequest asAdmin = new UpdateProfileRequest();
        asAdmin.setLicenseNumber("ADMIN-SET");
        service.updateUserProfile("USR-V", asAdmin);
        assertEquals("ADMIN-SET", vet.getLicenseNumber());
    }

    @Test
    @DisplayName("lookups: role filter (blank / invalid / valid), pending list, by id, approval token paths")
    void lookups() {
        User active = User.builder().userId("U1").role(UserRole.Veterinarian).status(UserStatus.Active).build();
        User pending = User.builder().userId("U2").role(UserRole.Veterinarian).status(UserStatus.PendingApproval).build();
        when(users.findAll()).thenReturn(List.of(active, pending));
        when(users.findByRole(UserRole.Veterinarian)).thenReturn(List.of(active, pending));
        assertEquals(2, service.getUsersByRole(" ").size());
        assertEquals(0, service.getUsersByRole("Wizard").size());
        assertEquals(1, service.getUsersByRole("Veterinarian").size());

        assertThrows(BadRequestException.class, () -> service.getApprovalStatus(" "));
        when(users.findByApprovalToken("t")).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> service.getApprovalStatus("t"));
        assertThrows(BadRequestException.class, () -> service.approvalLogin(null));
        assertThrows(BadRequestException.class, () -> service.approvalLogin("t"));

        User u = stored(UserStatus.PendingApproval);
        u.setApprovalToken("tok");
        when(users.findByApprovalToken("tok")).thenReturn(Optional.of(u));
        assertFalse(service.getApprovalStatus("tok").approved());
        assertThrows(BadRequestException.class, () -> service.approvalLogin("tok"));
        u.setStatus(UserStatus.Active);
        assertNotNull(service.approvalLogin("tok").getToken());
        assertNull(u.getApprovalToken());
    }

    // ------------------------------------------------------------------ JwtService

    @Test
    @DisplayName("jwt: round trip claims; e-mail mismatch invalid; expired and tampered tokens throw")
    void jwtService() {
        User u = User.builder().userId("USR-1").email("a@b.com").fullName("A B").role(UserRole.Veterinarian).build();
        String t = jwt.generateToken(u);
        assertEquals("a@b.com", jwt.extractEmail(t));
        assertEquals("USR-1", jwt.extractUserId(t));
        assertEquals("Veterinarian", jwt.extractRole(t));
        assertTrue(jwt.isTokenValid(t, u));
        assertFalse(jwt.isTokenValid(t, User.builder().email("other@b.com").build()));
        assertFalse(jwt.isTokenExpired(t));

        String expired = jwt.generateTokenWithExpiration(u, -5000);
        assertThrows(ExpiredJwtException.class, () -> jwt.isTokenExpired(expired));
        String tampered = t.substring(0, t.length() - 2) + (t.endsWith("AA") ? "BB" : "AA");
        assertThrows(JwtException.class, () -> jwt.extractEmail(tampered));
        assertThrows(JwtException.class, () -> jwt.extractEmail("garbage"));

        User noRole = User.builder().userId("USR-2").email("n@b.com").build();
        assertNull(jwt.extractRole(jwt.generateToken(noRole)));
    }

    @Test
    @DisplayName("jwt: short plaintext secret is padded to 32 bytes; plaintext (non-base64) secret accepted")
    void jwtSecretHandling() {
        JwtProperties p = new JwtProperties();
        p.setSecret("short");
        JwtService shortKey = new JwtService(p);
        User u = User.builder().userId("USR-1").email("a@b.com").role(UserRole.PetOwner).build();
        assertEquals("a@b.com", shortKey.extractEmail(shortKey.generateToken(u)));

        p.setSecret("this is a plain text secret that is definitely longer than 32 bytes!!");
        JwtService plain = new JwtService(p);
        assertEquals("a@b.com", plain.extractEmail(plain.generateToken(u)));
    }

    // ------------------------------------------------------------------ filter

    private MockHttpServletResponse run(String authHeader) throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwt, users);
        MockHttpServletRequest req = new MockHttpServletRequest();
        if (authHeader != null) req.addHeader("Authorization", authHeader);
        MockHttpServletResponse res = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);
        filter.doFilter(req, res, chain);
        verify(chain).doFilter(any(), any());   // the chain must ALWAYS continue
        return res;
    }

    @Test
    @DisplayName("filter: no header / wrong scheme / empty token / garbage leave the request anonymous")
    void filterAnonymousPaths() throws Exception {
        for (String h : new String[]{null, "Basic abc", "Bearer ", "Bearer    ", "Bearer not.a.jwt"}) {
            SecurityContextHolder.clearContext();
            run(h);
            assertNull(SecurityContextHolder.getContext().getAuthentication(), String.valueOf(h));
        }
    }

    @Test
    @DisplayName("filter: valid token for Active user authenticates with ROLE_ authority; inactive / unknown user does not")
    void filterAuthenticatedPaths() throws Exception {
        User u = User.builder().userId("USR-1").email("a@b.com").role(UserRole.ClinicManager).status(UserStatus.Active).build();
        when(users.findByEmail("a@b.com")).thenReturn(Optional.of(u));
        String token = jwt.generateToken(u);

        run("Bearer " + token);
        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(u, auth.getPrincipal());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ClinicManager")));

        SecurityContextHolder.clearContext();
        u.setStatus(UserStatus.Suspended);
        run("Bearer " + token);
        assertNull(SecurityContextHolder.getContext().getAuthentication());

        SecurityContextHolder.clearContext();
        u.setStatus(UserStatus.Active);
        when(users.findByEmail("a@b.com")).thenReturn(Optional.empty());
        run("Bearer " + token);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    // ------------------------------------------------------------------ SecurityUtils

    @Test
    @DisplayName("SecurityUtils.enforceOwnershipOrRole: all five decision outcomes")
    void ownershipUtil() {
        assertNull(SecurityUtils.getCurrentUser());
        assertThrows(AccessDeniedException.class, () -> SecurityUtils.enforceOwnershipOrRole("USR-1"));

        User vet = User.builder().userId("USR-V").role(UserRole.Veterinarian).build();
        authenticate(vet);
        assertDoesNotThrow(() -> SecurityUtils.enforceOwnershipOrRole("USR-1", UserRole.Admin, UserRole.Veterinarian));  // role bypass
        assertDoesNotThrow(() -> SecurityUtils.enforceOwnershipOrRole("USR-V"));                                            // owner
        assertThrows(AccessDeniedException.class, () -> SecurityUtils.enforceOwnershipOrRole("USR-1", UserRole.Admin));     // neither
        assertThrows(AccessDeniedException.class, () -> SecurityUtils.enforceOwnershipOrRole(null));                        // null resource owner
        assertThrows(AccessDeniedException.class, () -> SecurityUtils.enforceOwnershipOrRole("USR-1", (UserRole[]) null));  // null roles

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("anon-string", null, List.of()));
        assertNull(SecurityUtils.getCurrentUser());   // principal that is not a User
    }
}
