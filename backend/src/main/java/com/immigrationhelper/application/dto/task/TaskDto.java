package com.immigrationhelper.application.dto.task;

import com.immigrationhelper.domain.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskDto(
    UUID id,
    UUID journeyId,
    String templateCode,
    String title,
    String description,
    LocalDateTime dueAt,
    TaskStatus status,
    int priority,
    LocalDateTime completedAt,
    LocalDate postponedUntil,
    LocalDateTime createdAt
) {}
