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
    PendingApproval,
    Active,
    Rejected,
    Suspended
}
