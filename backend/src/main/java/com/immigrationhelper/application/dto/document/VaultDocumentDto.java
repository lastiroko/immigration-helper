package com.immigrationhelper.application.dto.document;

import com.immigrationhelper.domain.enums.ApostilleStatus;
import com.immigrationhelper.domain.enums.TranslationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record VaultDocumentDto(
    UUID id,
    String type,
    String title,
    long sizeBytes,
    String mimeType,
    ApostilleStatus apostilleStatus,
    TranslationStatus translationStatus,
    LocalDate expiryDate,
    boolean isOriginal,
    LocalDateTime uploadedAt
) {}
