package com.immigrationhelper.application.dto.profile;

import java.util.List;

public record OnboardingFinalizeResponse(
    UserProfileDto profile,
    List<Object> journeys,
    List<String> firstTasks
) {}
