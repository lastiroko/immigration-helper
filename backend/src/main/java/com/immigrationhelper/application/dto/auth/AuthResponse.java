package com.immigrationhelper.application.dto.auth;

import com.immigrationhelper.domain.enums.SubscriptionTier;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn,
    UUID userId,
    String email,
    String name,
    SubscriptionTier subscriptionTier
) {
    public static AuthResponse of(String accessToken, String refreshToken, long expiresIn,
                                   UUID userId, String email, String name, SubscriptionTier tier) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, userId, email, name, tier);
    }
}
