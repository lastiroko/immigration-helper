package com.immigrationhelper.application.service;

import com.immigrationhelper.domain.entity.VisaApplication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collection;

/**
 * Centralized authorization checks for visa-application-scoped operations.
 * Extracted so document and other downstream services can reuse the same logic
 * the Phase 1 audit established for the visa application endpoints.
 */
@Component
public class ApplicationAccessGuard {

    /** Strict ownership check — admins are NOT bypassed. */
    public void verifyOwnership(VisaApplication application, String authenticatedEmail) {
        if (!application.getUser().getEmail().equals(authenticatedEmail)) {
            throw new AccessDeniedException("Access denied: application belongs to another user");
        }
    }

    /** Owner OR admin — used by endpoints where staff need read/maintenance access. */
    public void verifyOwnerOrAdmin(VisaApplication application, Authentication authentication) {
        if (isAdmin(authentication.getAuthorities())) return;
        verifyOwnership(application, authentication.getName());
    }

    public boolean isAdmin(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
