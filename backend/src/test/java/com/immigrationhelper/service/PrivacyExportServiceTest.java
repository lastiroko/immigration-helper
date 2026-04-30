package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.privacy.PrivacyExportDto;
import com.immigrationhelper.application.service.PrivacyExportService;
import com.immigrationhelper.domain.entity.PrivacyExport;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.PrivacyExportStatus;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.persistence.DocumentRepository;
import com.immigrationhelper.infrastructure.persistence.NotificationSettingRepository;
import com.immigrationhelper.infrastructure.persistence.PrivacyExportRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.UserJourneyRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrivacyExportServiceTest {

    @Mock PrivacyExportRepository exportRepository;
    @Mock UserRepository userRepository;
    @Mock UserProfileRepository profileRepository;
    @Mock NotificationSettingRepository settingRepository;
    @Mock UserJourneyRepository journeyRepository;
    @Mock TaskRepository taskRepository;
    @Mock DocumentRepository documentRepository;
    @Mock FileStorageService storageService;

    @InjectMocks PrivacyExportService service;

    @Test
    void request_createsPendingExport() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
            .id(userId).email("e@test.com").name("E").passwordHash("x")
            .subscriptionTier(SubscriptionTier.FREE).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(exportRepository.save(any(PrivacyExport.class))).thenAnswer(inv -> {
            PrivacyExport p = inv.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PrivacyExportDto dto = service.request(userId);
        assertThat(dto.status()).isEqualTo(PrivacyExportStatus.PENDING);
        assertThat(dto.downloadPath()).isNull();
    }

    @Test
    void runPending_assemblesBundleAndMarksReady() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID exportId = UUID.randomUUID();
        User user = User.builder()
            .id(userId).email("e@test.com").name("E").passwordHash("x")
            .subscriptionTier(SubscriptionTier.FREE)
            .createdAt(LocalDateTime.now().minusDays(1)).build();

        PrivacyExport pending = PrivacyExport.builder()
            .userId(userId)
            .status(PrivacyExportStatus.PENDING)
            .requestedAt(LocalDateTime.now()).build();
        pending.setId(exportId);

        when(exportRepository.findByStatus(PrivacyExportStatus.PENDING))
            .thenReturn(List.of(pending));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findById(userId)).thenReturn(Optional.empty());
        when(settingRepository.findById(userId)).thenReturn(Optional.empty());
        when(journeyRepository.findByUserIdOrderByStartedAtDesc(userId)).thenReturn(List.of());
        when(taskRepository.findAll()).thenReturn(List.of());
        when(documentRepository.findByUserIdAndDeletedAtIsNullOrderByUploadedAtDesc(userId))
            .thenReturn(List.of());

        int processed = service.runPending();
        assertThat(processed).isEqualTo(1);
        assertThat(pending.getStatus()).isEqualTo(PrivacyExportStatus.READY);
        assertThat(pending.getStorageRef()).isEqualTo("privacy-exports/" + userId + "/" + exportId + ".json");

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        verify(storageService).store(any(), keyCaptor.capture(), eq("application/json"));
        assertThat(keyCaptor.getValue()).contains(userId.toString());
    }
}
