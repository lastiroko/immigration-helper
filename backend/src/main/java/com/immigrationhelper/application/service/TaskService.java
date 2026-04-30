package com.immigrationhelper.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.task.PatchTaskRequest;
import com.immigrationhelper.application.dto.task.TaskDetailResponse;
import com.immigrationhelper.application.dto.task.TaskDetailResponse.DocumentSlot;
import com.immigrationhelper.application.dto.task.TaskDto;
import com.immigrationhelper.application.dto.task.TaskListResponse;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.entity.TaskDocumentLink;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.UserJourney;
import com.immigrationhelper.domain.enums.NotificationKind;
import com.immigrationhelper.domain.enums.TaskStatus;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import com.immigrationhelper.infrastructure.persistence.TaskDocumentLinkRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import com.immigrationhelper.infrastructure.persistence.UserJourneyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final int MAX_POSTPONE_DAYS = 30;

    private final TaskRepository taskRepository;
    private final TaskTemplateRepository templateRepository;
    private final UserJourneyRepository journeyRepository;
    private final TaskDocumentLinkRepository linkRepository;
    private final NotificationOutboxRepository outboxRepository;
    private final ResourceOwnershipGuard ownershipGuard;

    @Transactional(readOnly = true)
    public TaskListResponse list(UUID userId, TaskStatus status, UUID journeyId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("dueAt").ascending().and(Sort.by("priority").ascending()));
        Page<Task> result;
        if (journeyId != null && status != null) {
            result = taskRepository.findByUserIdAndJourneyIdAndStatus(userId, journeyId, status, pageable);
        } else if (journeyId != null) {
            result = taskRepository.findByUserIdAndJourneyId(userId, journeyId, pageable);
        } else if (status != null) {
            result = taskRepository.findByUserIdAndStatus(userId, status, pageable);
        } else {
            result = taskRepository.findByUserId(userId, pageable);
        }
        return new TaskListResponse(
            result.getContent().stream().map(TaskService::toDto).toList(),
            result.getNumber(),
            result.getSize(),
            result.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public TaskDetailResponse detail(UUID userId, UUID taskId) {
        Task task = require(taskId);
        ownershipGuard.verifyOwnership(task.getUserId(), userId);
        UserJourney journey = journeyRepository.findById(task.getJourneyId())
            .orElseThrow(() -> new ResourceNotFoundException("Journey not found: " + task.getJourneyId()));
        TaskTemplate template = templateRepository.findById(task.getTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + task.getTemplateId()));
        Map<String, Boolean> linkSatisfaction = linkRepository.findByTaskId(taskId).stream()
            .collect(Collectors.toMap(l -> l.getDocumentId().toString(), TaskDocumentLink::isSatisfied, (a, b) -> a || b));
        List<DocumentSlot> slots = template.getAssociatedDocumentTypes().stream()
            .map(type -> new DocumentSlot(type,
                linkRepository.findByTaskId(taskId).stream().anyMatch(TaskDocumentLink::isSatisfied)))
            .toList();
        return new TaskDetailResponse(toDto(task), UserJourneyService.toDto(journey), slots);
    }

    @Transactional
    public TaskDto patch(UUID userId, UUID taskId, PatchTaskRequest req) {
        Task task = require(taskId);
        ownershipGuard.verifyOwnership(task.getUserId(), userId);
        if (task.getStatus() == TaskStatus.COMPLETE || task.getStatus() == TaskStatus.SKIPPED) {
            throw new ValidationException("Task is already in terminal state: " + task.getStatus());
        }
        if (req.postponedUntil() != null) {
            if (req.postponedUntil().isAfter(LocalDate.now().plusDays(MAX_POSTPONE_DAYS))) {
                throw new ValidationException("Cannot postpone more than " + MAX_POSTPONE_DAYS + " days ahead");
            }
            task.setPostponedUntil(req.postponedUntil());
            taskRepository.save(task);
            return toDto(task);
        }
        if (req.status() == TaskStatus.COMPLETE) {
            return complete(task);
        }
        throw new ValidationException("PATCH must include postponedUntil or status=COMPLETE");
    }

    @Transactional
    public TaskDto skip(UUID userId, UUID taskId) {
        Task task = require(taskId);
        ownershipGuard.verifyOwnership(task.getUserId(), userId);
        if (task.getStatus() == TaskStatus.COMPLETE || task.getStatus() == TaskStatus.SKIPPED) {
            throw new ValidationException("Task is already in terminal state: " + task.getStatus());
        }
        task.setStatus(TaskStatus.SKIPPED);
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);
        scheduleDownstream(task);
        return toDto(task);
    }

    private TaskDto complete(Task task) {
        task.setStatus(TaskStatus.COMPLETE);
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);
        scheduleDownstream(task);
        return toDto(task);
    }

    /**
     * After {@code parent} reaches a terminal state (complete/skipped), find sibling tasks
     * whose template depends on the parent's template code AND whose other dependencies are
     * satisfied. Set their dueAt = now + defaultLeadDays and emit a TASK_RELEASED notification.
     */
    private void scheduleDownstream(Task parent) {
        List<Task> siblings = taskRepository.findByUserIdAndJourneyId(parent.getUserId(), parent.getJourneyId());
        Set<String> completedCodes = siblings.stream()
            .filter(t -> t.getStatus() == TaskStatus.COMPLETE || t.getStatus() == TaskStatus.SKIPPED)
            .map(Task::getTemplateCode)
            .collect(Collectors.toSet());

        for (Task sibling : siblings) {
            if (sibling.getStatus() != TaskStatus.UPCOMING) continue;
            if (sibling.getDueAt() != null) continue;
            TaskTemplate template = templateRepository.findById(sibling.getTemplateId()).orElse(null);
            if (template == null) continue;
            if (!template.getDependsOn().contains(parent.getTemplateCode())) continue;
            if (!completedCodes.containsAll(template.getDependsOn())) continue;

            int leadDays = template.getDefaultLeadDays() == null ? 14 : template.getDefaultLeadDays();
            sibling.setDueAt(LocalDateTime.now().plusDays(leadDays));
            taskRepository.save(sibling);
            emitOutbox(sibling, NotificationKind.TASK_RELEASED);
        }
    }

    private void emitOutbox(Task task, NotificationKind kind) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("taskId", task.getId().toString());
            payload.put("title", task.getTitle());
            payload.put("dueAt", task.getDueAt() == null ? null : task.getDueAt().toString());
            outboxRepository.save(NotificationOutbox.builder()
                .userId(task.getUserId())
                .taskId(task.getId())
                .kind(kind)
                .payload(MAPPER.writeValueAsString(payload))
                .build());
        } catch (Exception e) {
            log.warn("Failed to emit outbox event for task {}: {}", task.getId(), e.getMessage());
        }
    }

    private Task require(UUID id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
    }

    static TaskDto toDto(Task t) {
        return new TaskDto(t.getId(), t.getJourneyId(), t.getTemplateCode(), t.getTitle(),
            t.getDescription(), t.getDueAt(), t.getStatus(), t.getPriority(),
            t.getCompletedAt(), t.getPostponedUntil(), t.getCreatedAt());
    }
}
