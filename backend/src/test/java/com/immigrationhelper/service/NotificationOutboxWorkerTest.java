package com.immigrationhelper.service;

import com.immigrationhelper.application.service.NotificationOutboxWorker;
import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.enums.NotificationKind;
import com.immigrationhelper.domain.enums.OutboxStatus;
import com.immigrationhelper.infrastructure.notification.PushNotificationService;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationOutboxWorkerTest {

    @Mock NotificationOutboxRepository repository;
    @Mock PushNotificationService pushService;
    @InjectMocks NotificationOutboxWorker worker;

    @Test
    void drain_marksPendingRowsSent() {
        NotificationOutbox row = newRow();
        when(repository.findByStatusAndScheduledAtBefore(eq(OutboxStatus.PENDING), any(LocalDateTime.class)))
            .thenReturn(List.of(row));
        when(pushService.deliver(row)).thenReturn(true);

        int sent = worker.drain();
        assertThat(sent).isEqualTo(1);

        ArgumentCaptor<NotificationOutbox> captor = ArgumentCaptor.forClass(NotificationOutbox.class);
        verify(repository).save(captor.capture());
        NotificationOutbox saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(OutboxStatus.SENT);
        assertThat(saved.getSentAt()).isNotNull();
        assertThat(saved.getAttempts()).isEqualTo(1);
    }

    @Test
    void drain_emptyQueue_returnsZero() {
        when(repository.findByStatusAndScheduledAtBefore(eq(OutboxStatus.PENDING), any(LocalDateTime.class)))
            .thenReturn(List.of());
        assertThat(worker.drain()).isZero();
    }

    @Test
    void drain_deliveryThrows_attemptsBumpedAndStaysPending() {
        NotificationOutbox row = newRow();
        when(repository.findByStatusAndScheduledAtBefore(eq(OutboxStatus.PENDING), any(LocalDateTime.class)))
            .thenReturn(List.of(row));
        when(pushService.deliver(row)).thenThrow(new RuntimeException("FCM down"));

        worker.drain();
        assertThat(row.getStatus()).isEqualTo(OutboxStatus.PENDING);
        assertThat(row.getAttempts()).isEqualTo(1);
        assertThat(row.getLastError()).isEqualTo("FCM down");
    }

    @Test
    void drain_afterMaxAttempts_marksFailed() {
        NotificationOutbox row = newRow();
        row.setAttempts(4); // one more failure pushes to 5 = MAX
        when(repository.findByStatusAndScheduledAtBefore(eq(OutboxStatus.PENDING), any(LocalDateTime.class)))
            .thenReturn(List.of(row));
        when(pushService.deliver(row)).thenThrow(new RuntimeException("perma-fail"));

        worker.drain();
        assertThat(row.getStatus()).isEqualTo(OutboxStatus.FAILED);
        assertThat(row.getAttempts()).isEqualTo(5);
    }

    private static NotificationOutbox newRow() {
        NotificationOutbox row = NotificationOutbox.builder()
            .userId(UUID.randomUUID())
            .taskId(UUID.randomUUID())
            .kind(NotificationKind.TASK_DUE)
            .payload("{\"title\":\"X\"}")
            .build();
        row.setId(UUID.randomUUID());
        return row;
    }
}
