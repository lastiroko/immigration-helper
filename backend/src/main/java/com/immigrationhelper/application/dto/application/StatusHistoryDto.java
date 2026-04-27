package com.immigrationhelper.application.dto.application;

import com.immigrationhelper.domain.enums.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record StatusHistoryDto(
    UUID id,
    ApplicationStatus fromStatus,
    ApplicationStatus toStatus,
    String changedByEmail,
    Instant changedAt,
    String note
) {}
