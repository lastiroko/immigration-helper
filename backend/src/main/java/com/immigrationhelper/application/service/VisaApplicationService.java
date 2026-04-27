package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.application.mapper.VisaApplicationMapper;
import com.immigrationhelper.domain.entity.ImmigrationOffice;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.ApplicationStatus;
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
    private final VisaApplicationMapper applicationMapper;

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
        log.info("Created visa application {} for user {}", application.getId(), user.getEmail());
        return applicationMapper.toDto(application);
    }

    @Transactional(readOnly = true)
    public ApplicationDto getById(UUID id, String authenticatedEmail) {
        VisaApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));
        verifyOwnership(application, authenticatedEmail);
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

        verifyOwnership(application, authentication.getName());
        verifyStatusTransition(application.getStatus(), request.status(), authentication.getAuthorities());

        application.setStatus(request.status());
        if (request.notes() != null) {
            application.setNotes(request.notes());
        }

        application = applicationRepository.save(application);
        log.info("Updated application {} status to {}", id, request.status());
        return applicationMapper.toDto(application);
    }

    private void verifyOwnership(VisaApplication application, String authenticatedEmail) {
        if (!application.getUser().getEmail().equals(authenticatedEmail)) {
            throw new AccessDeniedException("Access denied: application belongs to another user");
        }
    }

    private void verifyStatusTransition(ApplicationStatus current, ApplicationStatus next,
                                         Collection<? extends GrantedAuthority> authorities) {
        if (current == next) return;

        boolean isAdmin = authorities.stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        // APPROVED and REJECTED are officer/admin-only target states
        if ((next == ApplicationStatus.APPROVED || next == ApplicationStatus.REJECTED) && !isAdmin) {
            throw new AccessDeniedException("Only administrators can approve or reject applications");
        }

        boolean validTransition = switch (current) {
            case DRAFT     -> next == ApplicationStatus.SUBMITTED;
            case SUBMITTED -> next == ApplicationStatus.APPROVED || next == ApplicationStatus.REJECTED;
            case APPROVED, REJECTED -> false; // terminal states
        };

        if (!validTransition) {
            throw new IllegalArgumentException(
                "Invalid status transition: " + current + " → " + next);
        }
    }
}
