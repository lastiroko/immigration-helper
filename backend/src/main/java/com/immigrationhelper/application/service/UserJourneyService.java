package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.journey.PatchJourneyRequest;
import com.immigrationhelper.application.dto.journey.UserJourneyDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.domain.entity.UserJourney;
import com.immigrationhelper.domain.enums.JourneyStatus;
import com.immigrationhelper.domain.enums.JourneyType;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.UserJourneyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserJourneyService {

    private final UserJourneyRepository repository;
    private final ResourceOwnershipGuard ownershipGuard;

    @Transactional(readOnly = true)
    public List<UserJourneyDto> list(UUID userId, JourneyStatus statusFilter) {
        List<UserJourney> journeys = statusFilter == null
            ? repository.findByUserIdOrderByStartedAtDesc(userId)
            : repository.findByUserIdAndStatus(userId, statusFilter);
        return journeys.stream().map(UserJourneyService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UserJourneyDto get(UUID userId, UUID journeyId) {
        UserJourney journey = require(journeyId);
        ownershipGuard.verifyOwnership(journey.getUserId(), userId);
        return toDto(journey);
    }

    @Transactional
    public UserJourneyDto start(UUID userId, JourneyType type) {
        UserJourney journey = UserJourney.builder()
            .userId(userId)
            .type(type)
            .status(JourneyStatus.ACTIVE)
            .startedAt(LocalDateTime.now())
            .build();
        return toDto(repository.save(journey));
    }

    @Transactional
    public UserJourneyDto patch(UUID userId, UUID journeyId, PatchJourneyRequest req) {
        UserJourney journey = require(journeyId);
        ownershipGuard.verifyOwnership(journey.getUserId(), userId);
        if (req.status() == null) {
            throw new ValidationException("status is required");
        }
        if (req.status() == JourneyStatus.COMPLETED && journey.getCompletedAt() == null) {
            journey.setCompletedAt(LocalDateTime.now());
        }
        journey.setStatus(req.status());
        return toDto(repository.save(journey));
    }

    /** Picks the journey type that fits a profile's visa pathway during onboarding finalize. */
    public static JourneyType journeyTypeFor(VisaPathway pathway) {
        return switch (pathway) {
            case STUDENT, OTHER, REFUGEE -> JourneyType.STUDENT_ARRIVAL;
            case BLUE_CARD, CHANCENKARTE -> JourneyType.JOBSEEKER_TO_WORK;
            case FAMILY_REUNION -> JourneyType.FAMILY_REUNION;
        };
    }

    private UserJourney require(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Journey not found: " + id));
    }

    static UserJourneyDto toDto(UserJourney j) {
        return new UserJourneyDto(j.getId(), j.getType(), j.getStatus(),
            j.getStartedAt(), j.getExpectedEndAt(), j.getCompletedAt());
    }
}
