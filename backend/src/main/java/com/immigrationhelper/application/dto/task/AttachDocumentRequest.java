package com.immigrationhelper.application.dto.task;

import com.immigrationhelper.domain.enums.TaskDocumentRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AttachDocumentRequest(@NotNull UUID documentId, TaskDocumentRole role) {}
