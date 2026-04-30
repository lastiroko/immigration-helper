package com.immigrationhelper.application.dto.journey;

import com.immigrationhelper.domain.enums.JourneyStatus;
import com.immigrationhelper.domain.enums.JourneyType;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserJourneyDto(
    UUID id,
    JourneyType type,
    JourneyStatus status,
    LocalDateTime startedAt,
    LocalDateTime expectedEndAt,
    LocalDateTime completedAt
) {}
