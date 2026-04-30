package com.immigrationhelper.application.service;

import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.enums.OutboxStatus;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Drains the notification_outbox: reads PENDING rows whose scheduled_at has passed,
 * "delivers" them (logging stub for MVP), and marks them SENT.
 *
 * FCM/APNS wiring lands in Phase 5. This worker exists now so the deadline engine
 * + downstream-task-release events have a durable destination from day one.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationOutboxWorker {

    private final NotificationOutboxRepository repository;

    /** Runs every 60s in production; tests call {@link #drain()} directly. */
    @Scheduled(fixedDelayString = "PT60S")
    public void scheduledDrain() {
        drain();
    }

    @Transactional
    public int drain() {
        List<NotificationOutbox> pending = repository
            .findByStatusAndScheduledAtBefore(OutboxStatus.PENDING, LocalDateTime.now());
        int sent = 0;
        for (NotificationOutbox row : pending) {
            try {
                log.info("Outbox deliver: kind={} userId={} taskId={} payload={}",
                    row.getKind(), row.getUserId(), row.getTaskId(), row.getPayload());
                row.setStatus(OutboxStatus.SENT);
                row.setSentAt(LocalDateTime.now());
                row.setAttempts(row.getAttempts() + 1);
                repository.save(row);
                sent++;
            } catch (Exception e) {
                row.setAttempts(row.getAttempts() + 1);
                row.setLastError(e.getMessage());
                if (row.getAttempts() >= 5) {
                    row.setStatus(OutboxStatus.FAILED);
                }
                repository.save(row);
            }
        }
        return sent;
    }
}
