package com.immigrationhelper.application.dto.document;

import com.immigrationhelper.domain.enums.DocumentType;

import java.time.Instant;
import java.util.UUID;

public record ApplicationDocumentDto(
    UUID id,
    DocumentType documentType,
    String originalFilename,
    String contentType,
    long fileSize,
    String uploadedByEmail,
    Instant uploadedAt
) {}
