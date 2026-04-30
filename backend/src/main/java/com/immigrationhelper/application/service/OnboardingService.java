package com.immigrationhelper.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.journey.UserJourneyDto;
import com.immigrationhelper.application.dto.profile.OnboardingFinalizeResponse;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.dto.profile.UpdateUserProfileRequest;
import com.immigrationhelper.application.dto.profile.UserProfileDto;
import com.immigrationhelper.application.dto.task.TaskDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.UserJourney;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.domain.enums.JourneyStatus;
import com.immigrationhelper.domain.enums.JourneyType;
import com.immigrationhelper.domain.enums.TaskStatus;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import com.immigrationhelper.infrastructure.persistence.UserJourneyRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    public static final int TOTAL_STEPS = 6;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final UserProfileService userProfileService;
    private final NotificationSettingService notificationSettingService;
    private final UserProfileRepository userProfileRepository;
    private final UserJourneyRepository journeyRepository;
    private final TaskRepository taskRepository;
    private final TaskTemplateRepository templateRepository;
    private final CityRepository cityRepository;
    private final PersonalisationEngine personalisationEngine;

    @Transactional
    public void saveStep(UUID userId, int step, OnboardingStepRequest request) {
        if (step < 1 || step > TOTAL_STEPS) {
            throw new ValidationException("Onboarding step must be 1.." + TOTAL_STEPS + ", got " + step);
        }
        if (step == 6) {
            log.debug("Onboarding step 6 (document upload) acknowledged for user {}", userId);
            return;
        }
        UUID resolvedCityId = request.cityId();
        if (resolvedCityId == null && request.citySlug() != null) {
            City city = cityRepository.findBySlug(request.citySlug())
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + request.citySlug()));
            resolvedCityId = city.getId();
        }
        UpdateUserProfileRequest patch = new UpdateUserProfileRequest(
            request.firstName(),
            request.nationality(),
            resolvedCityId,
            request.visaPathway(),
            request.familyStatus(),
            request.familyInGermany(),
            request.arrivalDate(),
            request.anmeldungDate(),
            request.permitExpiryDate()
        );
        userProfileService.upsert(userId, patch);
    }

    @Transactional
    public OnboardingFinalizeResponse finalize(UUID userId) {
        UserProfile profile = userProfileRepository.findById(userId)
            .orElseThrow(() -> new ValidationException("Onboarding cannot finalize: profile not started"));
        if (profile.getNationality() == null
            || profile.getVisaPathway() == null
            || profile.getCity() == null
            || profile.getFamilyStatus() == null) {
            throw new ValidationException("Onboarding cannot finalize: nationality, city, visaPathway and familyStatus are required");
        }
        notificationSettingService.getOrInit(userId);

        UserJourney journey = createJourneyForProfile(profile);
        List<Task> tasks = instantiateTasks(profile, journey);

        UserProfileDto dto = userProfileService.get(userId);
        UserJourneyDto journeyDto = UserJourneyService.toDto(journey);
        List<TaskDto> taskDtos = tasks.stream().map(TaskService::toDto).toList();
        return new OnboardingFinalizeResponse(dto, List.of(journeyDto), taskDtos);
    }

    private UserJourney createJourneyForProfile(UserProfile profile) {
        JourneyType type = UserJourneyService.journeyTypeFor(profile.getVisaPathway());
        return journeyRepository.save(UserJourney.builder()
            .userId(profile.getUserId())
            .type(type)
            .status(JourneyStatus.ACTIVE)
            .startedAt(LocalDateTime.now())
            .build());
    }

    /**
     * Instantiates a Task per matched template. Tasks with no dependencies get a dueAt
     * of now + defaultLeadDays so they show up on the dashboard immediately. Tasks that
     * depend on other templates start with dueAt=null and are scheduled by TaskService
     * once their parent completes.
     */
    private List<Task> instantiateTasks(UserProfile profile, UserJourney journey) {
        List<String> matchingCodes = personalisationEngine.matchingTemplateCodes(profile);
        List<Task> created = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (String code : matchingCodes) {
            TaskTemplate template = templateRepository.findByCode(code).orElse(null);
            if (template == null) continue;

            String title = i18nField(template.getTitle(), code);
            String description = i18nField(template.getDescription(), "");

            int leadDays = template.getDefaultLeadDays() == null ? 14 : template.getDefaultLeadDays();
            LocalDateTime dueAt = template.getDependsOn().isEmpty()
                ? now.plusDays(leadDays)
                : null;

            Task task = Task.builder()
                .userId(profile.getUserId())
                .journeyId(journey.getId())
                .templateId(template.getId())
                .templateCode(template.getCode())
                .title(title)
                .description(description)
                .priority(template.getPriority())
                .dueAt(dueAt)
                .status(TaskStatus.UPCOMING)
                .build();
            created.add(taskRepository.save(task));
        }
        return created;
    }

    private static String i18nField(String json, String fallback) {
        if (json == null) return fallback;
        try {
            Map<String, String> map = MAPPER.readValue(json, new TypeReference<Map<String, String>>() {});
            String en = map.get("en");
            return en == null ? fallback : en;
        } catch (Exception e) {
            return fallback;
        }
    }
}
