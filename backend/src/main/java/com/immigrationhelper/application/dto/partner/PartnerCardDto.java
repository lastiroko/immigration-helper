package com.immigrationhelper.application.dto.partner;

import com.immigrationhelper.domain.enums.PartnerCategory;

import java.math.BigDecimal;
import java.util.UUID;

public record PartnerCardDto(
    UUID id,
    String slug,
    String name,
    PartnerCategory category,
    String logoUrl,
    String commissionDisclosure,
    BigDecimal rating
) {}
