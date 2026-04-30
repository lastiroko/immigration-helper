package com.immigrationhelper.application.dto.office;

import com.immigrationhelper.domain.enums.OfficeType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OfficeDto(
    UUID id,
    String citySlug,
    String cityName,
    OfficeType type,
    String name,
    String address,
    BigDecimal latitude,
    BigDecimal longitude,
    String bookingUrl,
    String phone,
    String email,
    List<String> languagesSupported,
    Double distanceKm
) {}
