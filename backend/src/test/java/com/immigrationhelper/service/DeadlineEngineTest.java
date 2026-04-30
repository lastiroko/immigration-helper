package com.immigrationhelper.service;

import com.immigrationhelper.application.service.DeadlineEngine;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.enums.TaskStatus;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeadlineEngineTest {

    @Mock TaskRepository taskRepository;
    @Mock NotificationOutboxRepository outboxRepository;

    @InjectMocks DeadlineEngine engine;

    @Test
    void computeStatus_dueAtInPast_isOverdue() {
        LocalDateTime now = LocalDateTime.now();
        assertThat(DeadlineEngine.computeStatus(TaskStatus.UPCOMING, now.minusDays(1), now))
            .isEqualTo(TaskStatus.OVERDUE);
        assertThat(DeadlineEngine.computeStatus(TaskStatus.DUE, now.minusHours(1), now))
            .isEqualTo(TaskStatus.OVERDUE);
    }

    @Test
    void computeStatus_dueAtWithinDueWindow_transitionsToDue() {
        LocalDateTime now = LocalDateTime.now();
        assertThat(DeadlineEngine.computeStatus(TaskStatus.UPCOMING, now.plusDays(3), now))
            .isEqualTo(TaskStatus.DUE);
        assertThat(DeadlineEngine.computeStatus(TaskStatus.UPCOMING, now.plusDays(7), now))
            .isEqualTo(TaskStatus.DUE);
    }

    @Test
    void computeStatus_dueAtFarFuture_staysUpcoming() {
        LocalDateTime now = LocalDateTime.now();
        assertThat(DeadlineEngine.computeStatus(TaskStatus.UPCOMING, now.plusDays(30), now))
            .isEqualTo(TaskStatus.UPCOMING);
    }

    @Test
    void computeStatus_alreadyDue_doesNotRegress() {
        LocalDateTime now = LocalDateTime.now();
        assertThat(DeadlineEngine.computeStatus(TaskStatus.DUE, now.plusDays(2), now))
            .isEqualTo(TaskStatus.DUE);
    }

    @Test
    void sweep_writesOutboxEntryPerTransition() {
        Task overdue = Task.builder()
            .userId(java.util.UUID.randomUUID())
            .status(TaskStatus.UPCOMING)
            .dueAt(LocalDateTime.now().minusDays(1))
            .title("X")
            .templateCode("X")
            .build();
        overdue.setId(java.util.UUID.randomUUID());

        Task soon = Task.builder()
            .userId(java.util.UUID.randomUUID())
            .status(TaskStatus.UPCOMING)
            .dueAt(LocalDateTime.now().plusDays(2))
            .title("Y")
            .templateCode("Y")
            .build();
        soon.setId(java.util.UUID.randomUUID());

        Task far = Task.builder()
            .userId(java.util.UUID.randomUUID())
            .status(TaskStatus.UPCOMING)
            .dueAt(LocalDateTime.now().plusDays(30))
            .title("Z")
            .templateCode("Z")
            .build();
        far.setId(java.util.UUID.randomUUID());

        when(taskRepository.findByStatusIn(anyList())).thenReturn(List.of(overdue, soon, far));

        int transitions = engine.sweep();
        assertThat(transitions).isEqualTo(2);
        verify(taskRepository, times(2)).save(any(Task.class));
        verify(outboxRepository, times(2)).save(any());
        assertThat(overdue.getStatus()).isEqualTo(TaskStatus.OVERDUE);
        assertThat(soon.getStatus()).isEqualTo(TaskStatus.DUE);
        assertThat(far.getStatus()).isEqualTo(TaskStatus.UPCOMING);
    }
}
