package com.immigrationhelper.application.dto.partner;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record PartnerWebhookRequest(
    @NotBlank String eventId,
    @NotBlank String partnerSlug,
    @NotBlank String clickId,
    BigDecimal commission,
    String rawPayload
) {}
