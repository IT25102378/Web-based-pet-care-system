package com.petnexus.backend.security;

import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.UserRole;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;

public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    /**
     * Enforces ownership of a resource.
     * If the current user has one of the allowed roles, access is granted.
     * Otherwise, the current user MUST be the owner of the resource.
     * @param resourceOwnerId The userId of the resource owner
     * @param allowedRoles Roles that bypass ownership checks
     */
    public static void enforceOwnershipOrRole(String resourceOwnerId, UserRole... allowedRoles) {
        User current = getCurrentUser();
        if (current == null) {
            throw new AccessDeniedException("Authentication required.");
        }

        if (allowedRoles != null) {
            for (UserRole role : allowedRoles) {
                if (current.getRole() == role) {
                    return; // Bypass ownership check
                }
            }
        }

        // Enforce ownership
        if (resourceOwnerId == null || !current.getUserId().equals(resourceOwnerId)) {
            throw new AccessDeniedException("Access denied: You do not own this resource.");
        }
    }
}
