package com.immigrationhelper.application.dto.application;

import com.immigrationhelper.application.dto.office.OfficeDto;
import com.immigrationhelper.application.dto.user.UserDto;
import com.immigrationhelper.domain.enums.ApplicationStatus;
import com.immigrationhelper.domain.enums.VisaType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ApplicationDto(
    UUID id,
    UserDto user,
    OfficeDto office,
    VisaType visaType,
    ApplicationStatus status,
    List<Map<String, Object>> documents,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
