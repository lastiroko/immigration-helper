package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.user.UpdateUserRequest;
import com.immigrationhelper.application.dto.user.UserDto;
import com.immigrationhelper.application.mapper.UserMapper;
import com.immigrationhelper.application.service.UserService;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock UserMapper userMapper;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserService userService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder()
            .id(userId)
            .email("test@example.com")
            .passwordHash("$2a$12$oldHashedPassword")
            .name("Original Name")
            .subscriptionTier(SubscriptionTier.FREE)
            .build();
    }

    @Test
    void getById_withValidId_returnsUserDto() {
        UserDto expected = new UserDto(userId, "test@example.com", "Original Name",
            SubscriptionTier.FREE, null, null, null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser)).thenReturn(expected);

        UserDto result = userService.getById(userId);

        assertThat(result.email()).isEqualTo("test@example.com");
    }

    @Test
    void getById_withUnknownId_throwsEntityNotFoundException() {
        UUID unknown = UUID.randomUUID();
        when(userRepository.findById(unknown)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(unknown))
            .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void update_nameOnly_updatesNameWithoutPasswordChange() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);
        when(userMapper.toDto(testUser)).thenReturn(
            new UserDto(userId, "test@example.com", "New Name", SubscriptionTier.FREE, null, null, null)
        );

        UserDto result = userService.update(userId, new UpdateUserRequest("New Name", null, null));

        assertThat(result.name()).isEqualTo("New Name");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void update_withPasswordChange_requiresCorrectCurrentPassword() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongCurrent", testUser.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() ->
            userService.update(userId, new UpdateUserRequest(null, "wrongCurrent", "newPassword123"))
        ).isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void update_withCorrectPasswordChange_updatesPasswordHash() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("correctCurrent", testUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("$2a$12$newHashedPassword");
        when(userRepository.save(any())).thenReturn(testUser);
        when(userMapper.toDto(testUser)).thenReturn(
            new UserDto(userId, "test@example.com", "Original Name", SubscriptionTier.FREE, null, null, null)
        );

        userService.update(userId, new UpdateUserRequest(null, "correctCurrent", "newPassword123"));

        verify(passwordEncoder).encode("newPassword123");
    }
}
