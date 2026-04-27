package com.immigrationhelper.application.dto.application;

import com.immigrationhelper.domain.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
    @NotNull ApplicationStatus status,
    String notes
) {}
