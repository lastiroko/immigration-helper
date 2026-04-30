package com.immigrationhelper.service;

import com.immigrationhelper.application.service.NotificationOutboxWorker;
import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.enums.NotificationKind;
import com.immigrationhelper.domain.enums.OutboxStatus;
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
    @InjectMocks NotificationOutboxWorker worker;

    @Test
    void drain_marksPendingRowsSent() {
        NotificationOutbox row = NotificationOutbox.builder()
            .userId(UUID.randomUUID())
            .taskId(UUID.randomUUID())
            .kind(NotificationKind.TASK_DUE)
            .payload("{\"title\":\"X\"}")
            .build();
        row.setId(UUID.randomUUID());
        when(repository.findByStatusAndScheduledAtBefore(eq(OutboxStatus.PENDING), any(LocalDateTime.class)))
            .thenReturn(List.of(row));

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
}
