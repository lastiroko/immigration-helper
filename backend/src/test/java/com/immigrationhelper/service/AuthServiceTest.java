package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.auth.LoginRequest;
import com.immigrationhelper.application.dto.auth.RegisterRequest;
import com.immigrationhelper.application.dto.auth.AuthResponse;
import com.immigrationhelper.application.service.AuthService;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.security.JwtTokenProvider;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;

    @InjectMocks AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(UUID.randomUUID())
            .email("test@example.com")
            .passwordHash("$2a$12$hashedPassword")
            .name("Test User")
            .subscriptionTier(SubscriptionTier.FREE)
            .build();
    }

    @Test
    void register_withNewEmail_returnsAuthResponse() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any())).thenReturn(testUser);
        when(jwtTokenProvider.generateToken("test@example.com")).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken("test@example.com")).thenReturn("refresh-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.register(
            new RegisterRequest("test@example.com", "password123", "Test User")
        );

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.email()).isEqualTo("test@example.com");
        assertThat(response.subscriptionTier()).isEqualTo(SubscriptionTier.FREE);
    }

    @Test
    void register_withExistingEmail_throwsIllegalArgumentException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() ->
            authService.register(new RegisterRequest("test@example.com", "password123", "Test User"))
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageContaining("already registered");
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken("test@example.com")).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken("test@example.com")).thenReturn("refresh-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.login(
            new LoginRequest("test@example.com", "password123")
        );

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
    }

    @Test
    void login_withWrongPassword_throwsBadCredentialsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() ->
            authService.login(new LoginRequest("test@example.com", "wrongpassword"))
        ).isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_withUnknownEmail_throwsBadCredentialsException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            authService.login(new LoginRequest("unknown@example.com", "password123"))
        ).isInstanceOf(BadCredentialsException.class);
    }
}
