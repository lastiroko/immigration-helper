package com.immigrationhelper.application.dto.application;

import com.immigrationhelper.domain.enums.VisaType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateApplicationRequest(
    @NotNull UUID userId,
    Long officeId,
    @NotNull VisaType visaType,
    String notes
) {}
