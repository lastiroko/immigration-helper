package com.immigrationhelper.application.dto.journey;

import com.immigrationhelper.domain.enums.JourneyStatus;

public record PatchJourneyRequest(JourneyStatus status) {}
