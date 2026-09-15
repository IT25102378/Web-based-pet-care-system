package com.petnexus.backend.config;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.enums.UserStatus;
import com.petnexus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the seven demo accounts: System Administrator, Pet Owner, Veterinarian, Clinic
 * Staff, Rescue Officer, Pet Care Provider and Clinic Manager. Runs first, because every
 * other seeder attaches its rows to one of these users.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void seed() {
        // Ensure the default System Administrator exists. If the account is already
        // there it is left exactly as it is: an administrator who was deliberately
        // suspended must stay suspended instead of being reset on every restart.
        userRepository.findByEmail("admin@petnexus.com")
                .ifPresentOrElse(
                        existingAdmin -> log.info("Administrator account already present ({}), left unchanged",
                                existingAdmin.getUserId()),
                        () -> {
                            String adminUserId = userRepository.existsByUserId("USR-003") ? "USR-007" : "USR-003";
                            User newAdmin = User.builder()
                                    .userId(adminUserId)
                                    .email("admin@petnexus.com")
                                    .passwordHash(passwordEncoder.encode("password123"))
                                    .fullName("PetNexus System Administrator")
                                    .phone("+94 11 234 5678")
                                    .address("Pet Nexus Clinic, Colombo 05")
                                    .role(UserRole.Admin)
                                    .status(UserStatus.Active)
                                    .avatarUrl("/avatars/avatar-admin.jpg")
                                    .seedData(true)
                                    .build();
                            userRepository.save(newAdmin);
                            log.info("Seeded default System Administrator account ({} - admin@petnexus.com)", adminUserId);
                        }
                );

        // Ensure default owner exists
        User owner = userRepository.findByEmail("owner@petnexus.com")
                .orElseGet(() -> {
                    User newOwner = User.builder()
                            .userId("USR-002")
                            .email("owner@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Kavindu Perera")
                            .phone("+94 77 123 4567")
                            .address("45/3 Galle Road, Colombo 06")
                            .emergencyContact("Thilini Perera (Spouse) - +94 77 234 9988")
                            .role(UserRole.PetOwner)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-pet-owner.jpg")
                            .seedData(true)
                            .build();
                    return userRepository.save(newOwner);
                });

        // Ensure a Veterinarian account exists.
        // Seeded before the appointment and consultation blocks below, which look this
        // account up by email to fill in their veterinarian reference.
        userRepository.findByEmail("vet@petnexus.com")
                .orElseGet(() -> {
                    User newVet = User.builder()
                            .userId(availableUserId("USR-006"))
                            .email("vet@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Dr. Sachini Wijesinghe, BVSc")
                            .phone("+94 71 234 5678")
                            .address("12 Wijerama Mawatha, Colombo 07")
                            .role(UserRole.Veterinarian)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-veterinarian.jpg")
                            .seedData(true)
                            .licenseNumber("SLVC-VET-2019-0842")
                            .specialization("Small Animal Surgery & Internal Medicine")
                            .build();
                    return userRepository.save(newVet);
                });

        // Ensure a Clinic Staff account exists
        userRepository.findByEmail("staff@petnexus.com")
                .orElseGet(() -> {
                    User newStaff = User.builder()
                            .userId(availableUserId("USR-007"))
                            .email("staff@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Nethmi Fernando")
                            .phone("+94 76 345 6789")
                            .address("22 Nawala Road, Rajagiriya")
                            .role(UserRole.ClinicStaff)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-clinic-staff.jpg")
                            .seedData(true)
                            .staffId("STF-104")
                            .build();
                    return userRepository.save(newStaff);
                });

        // Ensure a Rescue Officer account exists
        userRepository.findByEmail("rescue@petnexus.com")
                .orElseGet(() -> {
                    User newRescueOfficer = User.builder()
                            .userId(availableUserId("USR-008"))
                            .email("rescue@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Shehan Rajapaksha")
                            .phone("+94 71 678 9012")
                            .address("33 Baseline Road, Nugegoda")
                            .role(UserRole.RescueOfficer)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-rescue-officer.jpg")
                            .seedData(true)
                            .badgeNumber("RSC-882")
                            .build();
                    return userRepository.save(newRescueOfficer);
                });

        // Pet Care Provider — the care service seeder attaches its rows to this account.
        User providerUser = userRepository.findByEmail("provider@petnexus.com")
                .orElseGet(() -> {
                    User newProvider = User.builder()
                            .userId("USR-004")
                            .email("provider@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Dilshan Bandara")
                            .phone("+94 77 987 6543")
                            .address("12 Station Road, Bambalapitiya, Colombo 04")
                            .role(UserRole.PetCareProvider)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-rejected-applicant.jpg")
                            .seedData(true)
                            .build();
                    return userRepository.save(newProvider);
                });

        // Clinic Manager — the feedback seeder attaches its notifications to this account.
        User manager = userRepository.findByEmail("manager@petnexus.com")
                .orElseGet(() -> {
                    User newManager = User.builder()
                            .userId("USR-005")
                            .email("manager@petnexus.com")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .fullName("Himashi Gunawardena")
                            .phone("+94 77 567 8901")
                            .address("5/1 Gregory's Road, Colombo 07")
                            .role(UserRole.ClinicManager)
                            .status(UserStatus.Active)
                            .avatarUrl("/avatars/avatar-clinic-manager.jpg")
                            .seedData(true)
                            .build();
                    return userRepository.save(newManager);
                });
    }

    /**
     * Returns the preferred user ID when it is free, otherwise the next unused
     * ID in the USR-nnn series. Keeps seeding safe on a database that already
     * holds registered accounts.
     */
    private String availableUserId(String preferredUserId) {
        if (!userRepository.existsByUserId(preferredUserId)) {
            return preferredUserId;
        }
        for (int number = 100; number < 1000; number++) {
            String candidate = String.format("USR-%03d", number);
            if (!userRepository.existsByUserId(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("No free user ID available for seeding.");
    }
}
