package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByUserId(UUID userId, Pageable pageable);
    Page<Task> findByUserIdAndStatus(UUID userId, TaskStatus status, Pageable pageable);
    Page<Task> findByUserIdAndJourneyId(UUID userId, UUID journeyId, Pageable pageable);
    Page<Task> findByUserIdAndJourneyIdAndStatus(UUID userId, UUID journeyId, TaskStatus status, Pageable pageable);
    List<Task> findByUserIdAndJourneyId(UUID userId, UUID journeyId);
    List<Task> findByJourneyIdAndStatus(UUID journeyId, TaskStatus status);
    List<Task> findByStatusInAndDueAtBefore(List<TaskStatus> statuses, LocalDateTime cutoff);
    List<Task> findByStatusIn(List<TaskStatus> statuses);
}
