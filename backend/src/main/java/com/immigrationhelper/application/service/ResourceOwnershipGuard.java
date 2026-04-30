package com.immigrationhelper.application.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Generic ownership check for any user-scoped resource (Task, Document, UserJourney, …).
 * Cross-user reads/writes throw AccessDeniedException unconditionally — there is no
 * admin role in the Helfa MVP.
 */
@Component
public class ResourceOwnershipGuard {

    public void verifyOwnership(UUID resourceUserId, UUID authenticatedUserId) {
        if (!resourceUserId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: resource belongs to another user");
        }
    }
}
