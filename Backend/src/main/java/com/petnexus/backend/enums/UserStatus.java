package com.petnexus.backend.enums;

/**
 * Account lifecycle statuses matching the frontend's UserStatus constants exactly.
 *
 * Registration / Approval Workflow:
 *   1. register()       → PendingEmailVerification
 *   2. verifyEmail()    → PendingApproval
 *   3. approveUser()    → Active              (System Administrator action only)
 *   4. rejectUser()     → Rejected            (System Administrator action only)
 *   5. suspendUser()    → Suspended           (System Administrator action — Admin role blocked)
 *   6. reactivateUser() → Active
 *
 * IMPORTANT: Transitioning to Active via approveUser() NEVER changes UserRole.
 * Approval only grants access — it does not escalate privileges.
 */
public enum UserStatus {
    PendingEmailVerification,
    PendingApproval,
    Active,
    Rejected,
    Suspended
}
