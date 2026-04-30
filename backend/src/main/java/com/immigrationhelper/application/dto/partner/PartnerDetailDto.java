package com.immigrationhelper.application.dto.partner;

import com.immigrationhelper.domain.enums.PartnerCategory;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PartnerDetailDto(
    UUID id,
    String slug,
    String name,
    PartnerCategory category,
    String logoUrl,
    String websiteUrl,
    String commissionDisclosure,
    BigDecimal rating,
    List<String> supportedNationalities
) {}
