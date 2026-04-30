package com.immigrationhelper.application.dto.profile;

import com.immigrationhelper.domain.enums.DigestMode;

import java.time.LocalTime;

public record NotificationSettingDto(
    boolean pushEnabled,
    boolean emailEnabled,
    DigestMode digestMode,
    String digestDay,
    LocalTime digestTime,
    LocalTime quietHoursStart,
    LocalTime quietHoursEnd
) {}
