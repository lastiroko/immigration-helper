package com.immigrationhelper.application.dto.profile;

import com.immigrationhelper.application.dto.journey.UserJourneyDto;
import com.immigrationhelper.application.dto.task.TaskDto;

import java.util.List;

public record OnboardingFinalizeResponse(
    UserProfileDto profile,
    List<UserJourneyDto> journeys,
    List<TaskDto> firstTasks
) {}
