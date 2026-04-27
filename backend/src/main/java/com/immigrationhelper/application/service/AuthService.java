package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.auth.*;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.security.JwtTokenProvider;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        User user = User.builder()
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .name(request.name())
            .subscriptionTier(SubscriptionTier.FREE)
            .build();

        user = userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.of(accessToken, refreshToken,
            jwtTokenProvider.getExpirationMs(),
            user.getId(), user.getEmail(), user.getName(), user.getSubscriptionTier());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.of(accessToken, refreshToken,
            jwtTokenProvider.getExpirationMs(),
            user.getId(), user.getEmail(), user.getName(), user.getSubscriptionTier());
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.refreshToken())) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(request.refreshToken());
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtTokenProvider.generateToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        return AuthResponse.of(newAccessToken, newRefreshToken,
            jwtTokenProvider.getExpirationMs(),
            user.getId(), user.getEmail(), user.getName(), user.getSubscriptionTier());
    }
}
