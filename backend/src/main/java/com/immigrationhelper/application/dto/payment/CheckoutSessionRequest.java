package com.immigrationhelper.application.dto.payment;

import com.immigrationhelper.domain.enums.SubscriptionTier;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CheckoutSessionRequest(
    @NotNull UUID userId,
    @NotNull SubscriptionTier tier,
    String successUrl,
    String cancelUrl
) {}
