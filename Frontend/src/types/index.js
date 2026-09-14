// ==========================================================================
// Pet Nexus - Enums & System Constants
// ==========================================================================

export const UserRole = {
  PET_OWNER: 'PetOwner',
  VETERINARIAN: 'Veterinarian',
  CLINIC_STAFF: 'ClinicStaff',
  PET_CARE_PROVIDER: 'PetCareProvider',
  CLINIC_MANAGER: 'ClinicManager',
  RESCUE_OFFICER: 'RescueOfficer',
  ADMIN: 'Admin',
};

export const UserRoleLabels = {
  [UserRole.PET_OWNER]: 'Pet Owner',
  [UserRole.VETERINARIAN]: 'Veterinarian',
  [UserRole.CLINIC_STAFF]: 'Clinic Staff',
  [UserRole.PET_CARE_PROVIDER]: 'Pet Care Provider',
  [UserRole.CLINIC_MANAGER]: 'Clinic Manager',
  [UserRole.RESCUE_OFFICER]: 'Rescue Officer',
  [UserRole.ADMIN]: 'System Administrator',
};

export const UserStatus = {
  // No longer assigned to new accounts. Retained only so that accounts saved
  // before registration became immediate still display and guard correctly.
  PENDING_EMAIL: 'PendingEmailVerification',
  PENDING_APPROVAL: 'PendingApproval',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};

export const RescueCaseStatus = {
  INTAKE: 'Intake',
  IN_TREATMENT: 'InTreatment',
  READY_FOR_FOSTER: 'ReadyForFoster',
  IN_FOSTER: 'InFoster',
  READY_FOR_ADOPTION: 'ReadyForAdoption',
  ADOPTED: 'Adopted',
  CLOSED: 'Closed',
};

export const AdoptionApplicationStatus = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'UnderReview',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const AppointmentStatus = {
  SCHEDULED: 'Scheduled',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'CheckedIn',
  IN_ROOM: 'InRoom',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'NoShow',
};

export const ServiceStatus = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'CheckedIn',
  IN_PROGRESS: 'InProgress',
  READY_FOR_PICKUP: 'ReadyForPickup',
  COMPLETED: 'Completed',
};

export const StockStatus = {
  IN_STOCK: 'InStock',
  LOW_STOCK: 'LowStock',
  OUT_OF_STOCK: 'OutOfStock',
  EXPIRED: 'Expired',
};

export const NotificationType = {
  APPOINTMENT: 'Appointment',
  RESCUE: 'Rescue',
  ADOPTION: 'Adoption',
  APPROVAL: 'Approval',
  INVENTORY: 'Inventory',
  HEALTH: 'Health',
  SYSTEM: 'System',
};
