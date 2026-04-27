package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.application.mapper.VisaApplicationMapper;
import com.immigrationhelper.application.service.VisaApplicationService;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.ApplicationStatus;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.domain.enums.VisaType;
import com.immigrationhelper.infrastructure.persistence.ImmigrationOfficeRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.persistence.VisaApplicationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisaApplicationServiceTest {

    @Mock VisaApplicationRepository applicationRepository;
    @Mock UserRepository userRepository;
    @Mock ImmigrationOfficeRepository officeRepository;
    @Mock VisaApplicationMapper applicationMapper;

    @InjectMocks VisaApplicationService applicationService;

    private User testUser;
    private UUID userId;
    private VisaApplication testApplication;
    private UUID applicationId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        applicationId = UUID.randomUUID();
        testUser = User.builder()
            .id(userId).email("test@example.com").name("Test User")
            .passwordHash("hash").subscriptionTier(SubscriptionTier.FREE).build();
        testApplication = VisaApplication.builder()
            .id(applicationId).user(testUser)
            .visaType(VisaType.STUDENT).status(ApplicationStatus.DRAFT).build();
    }

    @Test
    void create_withValidRequest_returnsApplicationDto() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(applicationRepository.save(any())).thenReturn(testApplication);
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.DRAFT));

        ApplicationDto result = applicationService.create(
            new CreateApplicationRequest(userId, null, VisaType.STUDENT, null)
        );

        assertThat(result.id()).isEqualTo(applicationId);
        assertThat(result.status()).isEqualTo(ApplicationStatus.DRAFT);
    }

    @Test
    void create_withUnknownUser_throwsEntityNotFoundException() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            applicationService.create(new CreateApplicationRequest(userId, null, VisaType.STUDENT, null))
        ).isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getByUserId_returnsUserApplications() {
        when(userRepository.existsById(userId)).thenReturn(true);
        when(applicationRepository.findByUserId(userId)).thenReturn(List.of(testApplication));
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.DRAFT));

        List<ApplicationDto> results = applicationService.getByUserId(userId);

        assertThat(results).hasSize(1);
    }

    @Test
    void updateStatus_changesApplicationStatus() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any())).thenReturn(testApplication);
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.SUBMITTED));

        ApplicationDto result = applicationService.updateStatus(
            applicationId, new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null)
        );

        assertThat(result.status()).isEqualTo(ApplicationStatus.SUBMITTED);
    }

    private ApplicationDto mockDto(UUID id, ApplicationStatus status) {
        return new ApplicationDto(id, null, null, VisaType.STUDENT, status, null, null, null, null);
    }
}
