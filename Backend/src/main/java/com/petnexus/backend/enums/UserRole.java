package com.petnexus.backend.enums;

/**
 * User roles in the Pet Nexus system.
 *
 * Operational roles (can self-register, go through approval workflow):
 *   PetOwner, Veterinarian, ClinicStaff, PetCareProvider, ClinicManager, RescueOfficer
 *
 * Administrative role (separate workspace, cannot be self-assigned via registration):
 *   Admin (System Administrator)
 *
 * IMPORTANT: ClinicManager is an OPERATIONAL role. It does NOT grant System Administrator
 * privileges. The approval workflow transitions UserStatus only — never UserRole.
 */
public enum UserRole {
    PetOwner,
    Veterinarian,
    ClinicStaff,
    PetCareProvider,
    ClinicManager,
    RescueOfficer,
    Admin
}
