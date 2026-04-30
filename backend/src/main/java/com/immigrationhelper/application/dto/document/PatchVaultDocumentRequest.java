package com.immigrationhelper.application.dto.document;

import com.immigrationhelper.domain.enums.ApostilleStatus;
import com.immigrationhelper.domain.enums.TranslationStatus;

import java.time.LocalDate;

public record PatchVaultDocumentRequest(
    String title,
    String type,
    ApostilleStatus apostilleStatus,
    TranslationStatus translationStatus,
    LocalDate expiryDate,
    Boolean isOriginal
) {}
