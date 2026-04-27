package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.StatusHistoryDto;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.application.mapper.StatusHistoryMapper;
import com.immigrationhelper.application.mapper.VisaApplicationMapper;
import com.immigrationhelper.domain.entity.ApplicationStatusHistory;
import com.immigrationhelper.domain.entity.ImmigrationOffice;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.ApplicationStatus;
import com.immigrationhelper.infrastructure.persistence.ApplicationStatusHistoryRepository;
import com.immigrationhelper.infrastructure.persistence.ImmigrationOfficeRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.persistence.VisaApplicationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisaApplicationService {

    private final VisaApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ImmigrationOfficeRepository officeRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final VisaApplicationMapper applicationMapper;
    private final StatusHistoryMapper statusHistoryMapper;
    private final ApplicationAccessGuard accessGuard;

    @Transactional
    public ApplicationDto create(CreateApplicationRequest request, String authenticatedEmail) {
        User user = userRepository.findByEmail(authenticatedEmail)
            .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        ImmigrationOffice office = null;
        if (request.officeId() != null) {
            office = officeRepository.findById(request.officeId())
                .orElseThrow(() -> new EntityNotFoundException("Office not found: " + request.officeId()));
        }

        VisaApplication application = VisaApplication.builder()
            .user(user)
            .office(office)
            .visaType(request.visaType())
            .notes(request.notes())
            .build();

        application = applicationRepository.save(application);

        historyRepository.save(ApplicationStatusHistory.builder()
            .application(application)
            .fromStatus(null)
            .toStatus(application.getStatus())
            .changedBy(user)
            .build());

        log.info("Created visa application {} for user {}", application.getId(), user.getEmail());
        return applicationMapper.toDto(application);
    }

    @Transactional(readOnly = true)
    public ApplicationDto getById(UUID id, String authenticatedEmail) {
        VisaApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));
        accessGuard.verifyOwnership(application, authenticatedEmail);
        return applicationMapper.toDto(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getByAuthenticatedUser(String authenticatedEmail) {
        User user = userRepository.findByEmail(authenticatedEmail)
            .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));
        return applicationRepository.findByUserId(user.getId()).stream()
            .map(applicationMapper::toDto)
            .toList();
    }

    @Transactional
    public ApplicationDto updateStatus(UUID id, UpdateStatusRequest request, Authentication authentication) {
        VisaApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));

        accessGuard.verifyOwnership(application, authentication.getName());
        ApplicationStatus from = application.getStatus();
        verifyStatusTransition(from, request.status(), authentication.getAuthorities());

        User changer = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        application.setStatus(request.status());
        if (request.notes() != null) {
            application.setNotes(request.notes());
        }
        application = applicationRepository.save(application);

        historyRepository.save(ApplicationStatusHistory.builder()
            .application(application)
            .fromStatus(from)
            .toStatus(request.status())
            .changedBy(changer)
            .note(request.notes())
            .build());

        log.info("Updated application {} status {} -> {} by {}", id, from, request.status(), changer.getEmail());
        return applicationMapper.toDto(application);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryDto> getHistory(UUID applicationId, Authentication authentication) {
        VisaApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + applicationId));

        if (!accessGuard.isAdmin(authentication.getAuthorities())) {
            accessGuard.verifyOwnership(application, authentication.getName());
        }

        return historyRepository.findByApplicationIdOrderByChangedAtAsc(applicationId).stream()
            .map(statusHistoryMapper::toDto)
            .toList();
    }

    private void verifyStatusTransition(ApplicationStatus current, ApplicationStatus next,
                                         Collection<? extends GrantedAuthority> authorities) {
        if (current == next) return;

        if ((next == ApplicationStatus.APPROVED || next == ApplicationStatus.REJECTED) && !accessGuard.isAdmin(authorities)) {
            throw new AccessDeniedException("Only administrators can approve or reject applications");
        }

        boolean validTransition = switch (current) {
            case DRAFT     -> next == ApplicationStatus.SUBMITTED;
            case SUBMITTED -> next == ApplicationStatus.APPROVED || next == ApplicationStatus.REJECTED;
            case APPROVED, REJECTED -> false;
        };

        if (!validTransition) {
            throw new IllegalArgumentException(
                "Invalid status transition: " + current + " -> " + next);
        }
    }
}
