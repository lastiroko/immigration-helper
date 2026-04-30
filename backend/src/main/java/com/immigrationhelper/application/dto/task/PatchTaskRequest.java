package com.immigrationhelper.application.dto.task;

import com.immigrationhelper.domain.enums.TaskStatus;

import java.time.LocalDate;

public record PatchTaskRequest(TaskStatus status, LocalDate postponedUntil) {}
