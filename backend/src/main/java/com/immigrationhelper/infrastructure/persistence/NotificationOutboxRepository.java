package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.NotificationOutbox;
import com.immigrationhelper.domain.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, UUID> {
    List<NotificationOutbox> findByStatusAndScheduledAtBefore(OutboxStatus status, LocalDateTime cutoff);
    long countByUserIdAndStatus(UUID userId, OutboxStatus status);
}
