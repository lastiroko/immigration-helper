package com.immigrationhelper.application.dto.task;

import com.immigrationhelper.application.dto.journey.UserJourneyDto;

import java.util.List;

public record TaskDetailResponse(
    TaskDto task,
    UserJourneyDto journey,
    List<DocumentSlot> requiredDocuments
) {
    public record DocumentSlot(String type, boolean satisfied) {}
}
