package com.immigrationhelper.application.dto.application;

import com.immigrationhelper.domain.enums.VisaType;
import jakarta.validation.constraints.NotNull;

public record CreateApplicationRequest(
    Long officeId,
    @NotNull VisaType visaType,
    String notes
) {}
