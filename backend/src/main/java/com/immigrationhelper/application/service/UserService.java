package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.user.UpdateUserRequest;
import com.immigrationhelper.application.dto.user.UserDto;
import com.immigrationhelper.application.mapper.UserMapper;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDto getById(UUID id) {
        return userRepository.findById(id)
            .map(userMapper::toDto)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public UserDto getByEmail(String email) {
        return userRepository.findByEmail(email)
            .map(userMapper::toDto)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
    }

    @Transactional
    public UserDto update(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new BadCredentialsException("Current password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        user = userRepository.save(user);
        log.info("Updated user: {}", user.getEmail());
        return userMapper.toDto(user);
    }
}
