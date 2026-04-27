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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

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

    private static Authentication authAs(String email, String role) {
        return new UsernamePasswordAuthenticationToken(
            email, null, List.of(new SimpleGrantedAuthority(role)));
    }

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

    // ── create ───────────────────────────────────────────────────────────────

    @Test
    void create_derivesUserFromAuthenticatedEmail() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(applicationRepository.save(any())).thenReturn(testApplication);
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.DRAFT));

        ApplicationDto result = applicationService.create(
            new CreateApplicationRequest(null, VisaType.STUDENT, null),
            "test@example.com"
        );

        assertThat(result.id()).isEqualTo(applicationId);
        assertThat(result.status()).isEqualTo(ApplicationStatus.DRAFT);
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void create_withUnknownEmail_throwsEntityNotFoundException() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            applicationService.create(new CreateApplicationRequest(null, VisaType.STUDENT, null), "ghost@example.com")
        ).isInstanceOf(EntityNotFoundException.class);
    }

    // ── getById ──────────────────────────────────────────────────────────────

    @Test
    void getById_byOwner_returnsDto() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.DRAFT));

        ApplicationDto result = applicationService.getById(applicationId, "test@example.com");

        assertThat(result.id()).isEqualTo(applicationId);
    }

    @Test
    void getById_byNonOwner_throwsAccessDeniedException() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

        assertThatThrownBy(() ->
            applicationService.getById(applicationId, "attacker@example.com")
        ).isInstanceOf(AccessDeniedException.class);
    }

    // ── getByAuthenticatedUser ────────────────────────────────────────────────

    @Test
    void getByAuthenticatedUser_returnsOwnApplications() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(userId)).thenReturn(List.of(testApplication));
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.DRAFT));

        List<ApplicationDto> results = applicationService.getByAuthenticatedUser("test@example.com");

        assertThat(results).hasSize(1);
        verify(applicationRepository).findByUserId(userId);
    }

    // ── updateStatus ─────────────────────────────────────────────────────────

    @Test
    void updateStatus_draftToSubmitted_byOwner_succeeds() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any())).thenReturn(testApplication);
        when(applicationMapper.toDto(testApplication)).thenReturn(mockDto(applicationId, ApplicationStatus.SUBMITTED));

        ApplicationDto result = applicationService.updateStatus(
            applicationId,
            new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null),
            authAs("test@example.com", "ROLE_FREE")
        );

        assertThat(result.status()).isEqualTo(ApplicationStatus.SUBMITTED);
    }

    @Test
    void updateStatus_byNonOwner_throwsAccessDeniedException() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

        assertThatThrownBy(() ->
            applicationService.updateStatus(
                applicationId,
                new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null),
                authAs("attacker@example.com", "ROLE_FREE")
            )
        ).isInstanceOf(AccessDeniedException.class)
         .hasMessageContaining("another user");
    }

    @Test
    void updateStatus_nonAdminApprove_throwsAccessDeniedException() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

        assertThatThrownBy(() ->
            applicationService.updateStatus(
                applicationId,
                new UpdateStatusRequest(ApplicationStatus.APPROVED, null),
                authAs("test@example.com", "ROLE_FREE")
            )
        ).isInstanceOf(AccessDeniedException.class)
         .hasMessageContaining("administrators");
    }

    @Test
    void updateStatus_nonAdminReject_throwsAccessDeniedException() {
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

        assertThatThrownBy(() ->
            applicationService.updateStatus(
                applicationId,
                new UpdateStatusRequest(ApplicationStatus.REJECTED, null),
                authAs("test@example.com", "ROLE_FREE")
            )
        ).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateStatus_invalidTransition_draftToRejected_throwsAccessDeniedException() {
        // DRAFT → REJECTED is blocked first by the admin-only check (403 before 400)
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

        assertThatThrownBy(() ->
            applicationService.updateStatus(
                applicationId,
                new UpdateStatusRequest(ApplicationStatus.REJECTED, null),
                authAs("test@example.com", "ROLE_FREE")
            )
        ).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateStatus_submittedToDraft_throwsIllegalArgumentException() {
        VisaApplication submittedApp = VisaApplication.builder()
            .id(applicationId).user(testUser)
            .visaType(VisaType.STUDENT).status(ApplicationStatus.SUBMITTED).build();
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(submittedApp));

        assertThatThrownBy(() ->
            applicationService.updateStatus(
                applicationId,
                new UpdateStatusRequest(ApplicationStatus.DRAFT, null),
                authAs("test@example.com", "ROLE_FREE")
            )
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageContaining("SUBMITTED");
    }

    @Test
    void updateStatus_approvedToSubmitted_throwsIllegalArgumentException() {
        VisaApplication approvedApp = VisaApplication.builder()
            .id(applicationId).user(testUser)
            .visaType(VisaType.STUDENT).status(ApplicationStatus.APPROVED).build();
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(approvedApp));

        // Even admin cannot change a terminal state
        assertThatThrownBy(() ->
            applicationService.updateStatus(
                applicationId,
                new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null),
                authAs("test@example.com", "ROLE_ADMIN")
            )
        ).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateStatus_adminApproveSubmitted_succeeds() {
        VisaApplication submittedApp = VisaApplication.builder()
            .id(applicationId).user(testUser)
            .visaType(VisaType.STUDENT).status(ApplicationStatus.SUBMITTED).build();
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(submittedApp));
        when(applicationRepository.save(any())).thenReturn(submittedApp);
        when(applicationMapper.toDto(submittedApp)).thenReturn(mockDto(applicationId, ApplicationStatus.APPROVED));

        ApplicationDto result = applicationService.updateStatus(
            applicationId,
            new UpdateStatusRequest(ApplicationStatus.APPROVED, null),
            authAs("test@example.com", "ROLE_ADMIN")
        );

        assertThat(result.status()).isEqualTo(ApplicationStatus.APPROVED);
    }

    private ApplicationDto mockDto(UUID id, ApplicationStatus status) {
        return new ApplicationDto(id, null, null, VisaType.STUDENT, status, null, null, null, null);
    }
}
