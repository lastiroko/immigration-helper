package com.immigrationhelper.application.dto.task;

import java.util.List;

public record TaskListResponse(
    List<TaskDto> items,
    int page,
    int size,
    long total
) {}
