package com.petnexus.backend.enums;

/**
 * Account lifecycle statuses matching the frontend's UserStatus constants exactly.
 *
 * Registration / Approval Workflow:
 *   1. register()       → PendingApproval
 *   2. approveUser()    → Active              (System Administrator action only)
 *   3. rejectUser()     → Rejected            (System Administrator action only)
 *   4. suspendUser()    → Suspended           (System Administrator action — Admin role blocked)
 *   5. reactivateUser() → Active
 *
 * IMPORTANT: Transitioning to Active via approveUser() NEVER changes UserRole.
 * Approval only grants access — it does not escalate privileges.
 */
public enum UserStatus {
    /**
     * No longer assigned to new accounts. Retained only so that rows saved before
     * registration became immediate can still be read back without error.
     * Such an account is treated exactly like PendingApproval.
     */
    PendingEmailVerification,
    PendingApproval,
    Active,
    Rejected,
    Suspended
}
