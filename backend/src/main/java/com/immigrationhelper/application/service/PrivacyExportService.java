package com.immigrationhelper.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.privacy.PrivacyExportDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.domain.entity.PrivacyExport;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.PrivacyExportStatus;
import com.immigrationhelper.infrastructure.persistence.DocumentRepository;
import com.immigrationhelper.infrastructure.persistence.NotificationSettingRepository;
import com.immigrationhelper.infrastructure.persistence.PrivacyExportRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.UserJourneyRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * GDPR Article 15 (right of access) and 20 (data portability) implementation.
 *
 * The user POSTs to /v1/privacy/export, which queues a PrivacyExport row in PENDING.
 * A scheduled worker (or an immediate run via {@link #runPending()}) assembles
 * the user's data into a JSON document, stores it via FileStorageService, and
 * marks the row READY. The user then GETs the row and is given a download path.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PrivacyExportService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final PrivacyExportRepository exportRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final NotificationSettingRepository settingRepository;
    private final UserJourneyRepository journeyRepository;
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final FileStorageService storageService;

    @Transactional
    public PrivacyExportDto request(UUID userId) {
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        PrivacyExport row = exportRepository.save(PrivacyExport.builder()
            .userId(userId)
            .status(PrivacyExportStatus.PENDING)
            .requestedAt(LocalDateTime.now())
            .build());
        return toDto(row);
    }

    @Transactional(readOnly = true)
    public PrivacyExportDto get(UUID userId, UUID exportId) {
        PrivacyExport row = exportRepository.findById(exportId)
            .orElseThrow(() -> new ResourceNotFoundException("Export not found: " + exportId));
        if (!row.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Export not found: " + exportId);
        }
        return toDto(row);
    }

    @Scheduled(fixedDelayString = "PT5M")
    @Transactional
    public int runPending() {
        List<PrivacyExport> pending = exportRepository.findByStatus(PrivacyExportStatus.PENDING);
        int processed = 0;
        for (PrivacyExport row : pending) {
            try {
                row.setStatus(PrivacyExportStatus.RUNNING);
                exportRepository.save(row);
                String storageKey = assembleAndStore(row.getUserId(), row.getId());
                row.setStorageRef(storageKey);
                row.setStatus(PrivacyExportStatus.READY);
                row.setCompletedAt(LocalDateTime.now());
                exportRepository.save(row);
                processed++;
            } catch (Exception e) {
                log.warn("Privacy export {} failed: {}", row.getId(), e.getMessage());
                row.setStatus(PrivacyExportStatus.FAILED);
                row.setError(e.getMessage());
                exportRepository.save(row);
            }
        }
        return processed;
    }

    private String assembleAndStore(UUID userId, UUID exportId) throws Exception {
        Map<String, Object> bundle = new HashMap<>();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User vanished: " + userId));
        bundle.put("user", Map.of(
            "id", user.getId().toString(),
            "email", user.getEmail(),
            "name", user.getName(),
            "subscriptionTier", user.getSubscriptionTier().name(),
            "createdAt", user.getCreatedAt().toString()
        ));
        profileRepository.findById(userId).ifPresent(p -> bundle.put("profile", p));
        settingRepository.findById(userId).ifPresent(s -> bundle.put("notificationSettings", s));
        bundle.put("journeys", journeyRepository.findByUserIdOrderByStartedAtDesc(userId));
        bundle.put("tasks", taskRepository.findAll().stream()
            .filter(t -> t.getUserId().equals(userId)).toList());
        bundle.put("documents", documentRepository
            .findByUserIdAndDeletedAtIsNullOrderByUploadedAtDesc(userId));

        byte[] payload = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsBytes(bundle);
        String storageKey = "privacy-exports/" + userId + "/" + exportId + ".json";
        try (var in = new ByteArrayInputStream(payload)) {
            storageService.store(in, storageKey, "application/json");
        }
        return storageKey;
    }

    private static PrivacyExportDto toDto(PrivacyExport row) {
        String download = row.getStatus() == PrivacyExportStatus.READY
            ? "/api/v1/privacy/export/" + row.getId() + "/download"
            : null;
        return new PrivacyExportDto(row.getId(), row.getStatus(),
            row.getRequestedAt(), row.getCompletedAt(), download);
    }
}
