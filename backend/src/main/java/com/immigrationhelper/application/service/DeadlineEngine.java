package com.immigrationhelper.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.enums.NotificationKind;
import com.immigrationhelper.domain.enums.TaskStatus;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Walks tasks every 6 hours and applies the UPCOMING → DUE → OVERDUE state machine.
 *
 * - UPCOMING → DUE when dueAt is within {@link #DUE_WINDOW_DAYS} of now.
 * - DUE → OVERDUE when dueAt is in the past.
 *
 * Each transition writes a NotificationOutbox row; the outbox worker delivers it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeadlineEngine {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    public static final long DUE_WINDOW_DAYS = 7;

    private final TaskRepository taskRepository;
    private final NotificationOutboxRepository outboxRepository;

    /** Runs every 6 hours in production; tests call {@link #sweep()} directly. */
    @Scheduled(fixedDelayString = "PT6H")
    public void scheduledSweep() {
        sweep();
    }

    @Transactional
    public int sweep() {
        LocalDateTime now = LocalDateTime.now();
        int transitions = 0;

        // Pull only the rows that could possibly transition.
        List<Task> candidates = taskRepository.findByStatusIn(
            List.of(TaskStatus.UPCOMING, TaskStatus.DUE));

        for (Task task : candidates) {
            if (task.getDueAt() == null) continue;
            TaskStatus newStatus = computeStatus(task.getStatus(), task.getDueAt(), now);
            if (newStatus != task.getStatus()) {
                task.setStatus(newStatus);
                taskRepository.save(task);
                emitOutbox(task, newStatus == TaskStatus.OVERDUE
                    ? NotificationKind.TASK_OVERDUE
                    : NotificationKind.TASK_DUE);
                transitions++;
            }
        }
        if (transitions > 0) log.info("Deadline engine: {} task transitions", transitions);
        return transitions;
    }

    public static TaskStatus computeStatus(TaskStatus current, LocalDateTime dueAt, LocalDateTime now) {
        if (dueAt.isBefore(now)) return TaskStatus.OVERDUE;
        if (current == TaskStatus.UPCOMING && !dueAt.isAfter(now.plusDays(DUE_WINDOW_DAYS))) {
            return TaskStatus.DUE;
        }
        return current;
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
}
