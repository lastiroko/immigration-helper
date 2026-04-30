package com.immigrationhelper.application.dto.privacy;

import com.immigrationhelper.domain.enums.PrivacyExportStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record PrivacyExportDto(
    UUID id,
    PrivacyExportStatus status,
    LocalDateTime requestedAt,
    LocalDateTime completedAt,
    String downloadPath
) {}
