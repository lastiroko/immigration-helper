package com.immigrationhelper.application.service;

import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.enums.OutboxStatus;
import com.immigrationhelper.infrastructure.notification.PushNotificationService;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Drains the notification_outbox: reads PENDING rows, delegates delivery to the
 * configured {@link PushNotificationService}, and marks the row SENT or FAILED.
 *
 * Retries: a row that throws (or returns false) increments attempts; after 5
 * failures it transitions to FAILED so it stops blocking the queue.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationOutboxWorker {

    private static final int MAX_ATTEMPTS = 5;

    private final NotificationOutboxRepository repository;
    private final PushNotificationService pushService;

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
                boolean delivered = pushService.deliver(row);
                row.setAttempts(row.getAttempts() + 1);
                if (delivered) {
                    row.setStatus(OutboxStatus.SENT);
                    row.setSentAt(LocalDateTime.now());
                    sent++;
                } else if (row.getAttempts() >= MAX_ATTEMPTS) {
                    row.setStatus(OutboxStatus.FAILED);
                }
                repository.save(row);
            } catch (Exception e) {
                row.setAttempts(row.getAttempts() + 1);
                row.setLastError(e.getMessage());
                if (row.getAttempts() >= MAX_ATTEMPTS) {
                    row.setStatus(OutboxStatus.FAILED);
                }
                repository.save(row);
            }
        }
        return sent;
    }
}
