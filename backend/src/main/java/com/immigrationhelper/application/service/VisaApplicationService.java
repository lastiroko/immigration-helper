package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.application.mapper.VisaApplicationMapper;
import com.immigrationhelper.domain.entity.ImmigrationOffice;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.infrastructure.persistence.ImmigrationOfficeRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.persistence.VisaApplicationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public ApplicationDto create(CreateApplicationRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + request.userId()));

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
    public ApplicationDto getById(UUID id) {
        return applicationRepository.findById(id)
            .map(applicationMapper::toDto)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getByUserId(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found: " + userId);
        }
        return applicationRepository.findByUserId(userId).stream()
            .map(applicationMapper::toDto)
            .toList();
    }

    @Transactional
    public ApplicationDto updateStatus(UUID id, UpdateStatusRequest request) {
        VisaApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + id));

        application.setStatus(request.status());
        if (request.notes() != null) {
            application.setNotes(request.notes());
        }

        application = applicationRepository.save(application);
        log.info("Updated application {} status to {}", id, request.status());
        return applicationMapper.toDto(application);
    }
}
