package com.immigrationhelper.application.dto.office;

import java.time.LocalDateTime;

public record OfficeDto(
    Long id,
    String name,
    String address,
    String city,
    String postalCode,
    Double latitude,
    Double longitude,
    String phone,
    String email,
    String appointmentUrl,
    LocalDateTime createdAt,
    Double distanceKm
) {}
