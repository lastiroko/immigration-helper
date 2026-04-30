package com.immigrationhelper.application.dto.user;

import com.immigrationhelper.domain.enums.UserStatus;

import java.time.LocalDateTime;

public record AccountDeletionResponse(
    UserStatus status,
    LocalDateTime scheduledDeletionAt
) {}
