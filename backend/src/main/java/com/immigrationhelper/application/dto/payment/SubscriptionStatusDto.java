package com.immigrationhelper.application.dto.payment;

import com.immigrationhelper.domain.enums.SubscriptionTier;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubscriptionStatusDto(
    UUID userId,
    SubscriptionTier tier,
    String stripeCustomerId,
    String stripeSubscriptionId,
    String status,
    LocalDateTime currentPeriodEnd
) {}
