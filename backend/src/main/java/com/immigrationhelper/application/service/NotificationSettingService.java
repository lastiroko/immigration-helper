package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.profile.NotificationSettingDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.domain.entity.NotificationSetting;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.infrastructure.persistence.NotificationSettingRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationSettingService {

    private final NotificationSettingRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public NotificationSettingDto getOrInit(UUID userId) {
        NotificationSetting setting = repository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            return repository.save(NotificationSetting.builder().user(user).build());
        });
        return toDto(setting);
    }

    @Transactional
    public NotificationSettingDto replace(UUID userId, NotificationSettingDto dto) {
        NotificationSetting setting = repository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            return NotificationSetting.builder().user(user).build();
        });
        setting.setPushEnabled(dto.pushEnabled());
        setting.setEmailEnabled(dto.emailEnabled());
        setting.setDigestMode(dto.digestMode());
        setting.setDigestDay(dto.digestDay());
        setting.setDigestTime(dto.digestTime());
        setting.setQuietHoursStart(dto.quietHoursStart());
        setting.setQuietHoursEnd(dto.quietHoursEnd());
        return toDto(repository.save(setting));
    }

    private NotificationSettingDto toDto(NotificationSetting s) {
        return new NotificationSettingDto(
            s.isPushEnabled(),
            s.isEmailEnabled(),
            s.getDigestMode(),
            s.getDigestDay(),
            s.getDigestTime(),
            s.getQuietHoursStart(),
            s.getQuietHoursEnd()
        );
    }
}
