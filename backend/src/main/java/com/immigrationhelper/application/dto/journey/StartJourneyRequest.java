package com.immigrationhelper.application.dto.journey;

import com.immigrationhelper.domain.enums.JourneyType;
import jakarta.validation.constraints.NotNull;

public record StartJourneyRequest(@NotNull JourneyType type) {}
