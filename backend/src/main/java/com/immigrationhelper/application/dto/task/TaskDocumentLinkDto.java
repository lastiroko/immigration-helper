package com.immigrationhelper.application.dto.task;

import com.immigrationhelper.domain.enums.TaskDocumentRole;

import java.util.UUID;

public record TaskDocumentLinkDto(
    UUID taskId,
    UUID documentId,
    TaskDocumentRole role,
    boolean satisfied
) {}
