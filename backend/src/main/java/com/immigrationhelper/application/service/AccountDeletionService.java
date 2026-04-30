package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.user.AccountDeletionResponse;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.UserStatus;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * GDPR Article 17 (right to erasure).
 *
 * DELETE /v1/users/me sets status=DELETED and scheduled_deletion_at = now+30d.
 * The user can no longer authenticate (JwtAuthenticationFilter checks status).
 * A scheduled worker scans daily for past-due rows and removes them — JPA's
 * ON DELETE CASCADE on user_id columns drops the rest of the user's footprint.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountDeletionService {

    public static final int GRACE_DAYS = 30;

    private final UserRepository userRepository;

    @Transactional
    public AccountDeletionResponse requestDeletion(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(UserStatus.DELETED);
        user.setScheduledDeletionAt(LocalDateTime.now().plusDays(GRACE_DAYS));
        userRepository.save(user);
        log.info("User {} marked for deletion at {}", user.getEmail(), user.getScheduledDeletionAt());
        return new AccountDeletionResponse(user.getStatus(), user.getScheduledDeletionAt());
    }

    @Transactional
    public AccountDeletionResponse cancelDeletion(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(UserStatus.ACTIVE);
        user.setScheduledDeletionAt(null);
        userRepository.save(user);
        return new AccountDeletionResponse(user.getStatus(), null);
    }

    /** Daily sweep that hard-deletes any row whose grace period has expired. */
    @Scheduled(cron = "${notifications.deletion.cron:0 0 3 * * *}")
    @Transactional
    public int hardDeleteSweep() {
        List<User> due = userRepository.findByStatusAndScheduledDeletionAtBefore(
            UserStatus.DELETED, LocalDateTime.now());
        for (User user : due) {
            log.info("Hard-deleting user {} (grace expired {})", user.getEmail(), user.getScheduledDeletionAt());
            userRepository.delete(user);
        }
        return due.size();
    }
}
