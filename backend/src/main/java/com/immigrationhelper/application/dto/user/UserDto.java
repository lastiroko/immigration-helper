package com.immigrationhelper.application.dto.user;

import com.immigrationhelper.domain.enums.SubscriptionTier;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String name,
    SubscriptionTier subscriptionTier,
    String stripeCustomerId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
