package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.user.AccountDeletionResponse;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.service.AccountDeletionService;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.domain.enums.UserStatus;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountDeletionServiceTest {

    @Mock UserRepository userRepository;

    @InjectMocks AccountDeletionService service;

    @Test
    void requestDeletion_marksUserAndSchedules30Days() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
            .id(userId).email("e@test.com").name("E")
            .passwordHash("x").subscriptionTier(SubscriptionTier.FREE)
            .status(UserStatus.ACTIVE).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AccountDeletionResponse response = service.requestDeletion(userId);
        assertThat(response.status()).isEqualTo(UserStatus.DELETED);
        assertThat(response.scheduledDeletionAt()).isAfter(LocalDateTime.now().plusDays(29));
        assertThat(response.scheduledDeletionAt()).isBefore(LocalDateTime.now().plusDays(31));
    }

    @Test
    void requestDeletion_unknownUser_throws() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.requestDeletion(userId))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cancelDeletion_clearsScheduleAndReactivates() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
            .id(userId).email("e@test.com").name("E")
            .passwordHash("x").subscriptionTier(SubscriptionTier.FREE)
            .status(UserStatus.DELETED)
            .scheduledDeletionAt(LocalDateTime.now().plusDays(15)).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AccountDeletionResponse response = service.cancelDeletion(userId);
        assertThat(response.status()).isEqualTo(UserStatus.ACTIVE);
        assertThat(response.scheduledDeletionAt()).isNull();
    }

    @Test
    void hardDeleteSweep_removesPastDueRowsOnly() {
        User dueA = User.builder().email("a@test.com").name("A").passwordHash("x")
            .status(UserStatus.DELETED)
            .scheduledDeletionAt(LocalDateTime.now().minusDays(1))
            .subscriptionTier(SubscriptionTier.FREE).build();
        User dueB = User.builder().email("b@test.com").name("B").passwordHash("x")
            .status(UserStatus.DELETED)
            .scheduledDeletionAt(LocalDateTime.now().minusHours(1))
            .subscriptionTier(SubscriptionTier.FREE).build();

        when(userRepository.findByStatusAndScheduledDeletionAtBefore(
                eq(UserStatus.DELETED), any(LocalDateTime.class)))
            .thenReturn(List.of(dueA, dueB));

        int deleted = service.hardDeleteSweep();
        assertThat(deleted).isEqualTo(2);
        verify(userRepository, times(2)).delete(any(User.class));
    }

    private static <T> T eq(T value) {
        return org.mockito.ArgumentMatchers.eq(value);
    }
}
