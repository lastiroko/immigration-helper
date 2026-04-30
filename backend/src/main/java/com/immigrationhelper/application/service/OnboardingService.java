package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.profile.OnboardingFinalizeResponse;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.dto.profile.UpdateUserProfileRequest;
import com.immigrationhelper.application.dto.profile.UserProfileDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.NotificationSettingRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingService {

    public static final int TOTAL_STEPS = 6;

    private final UserProfileService userProfileService;
    private final NotificationSettingService notificationSettingService;
    private final NotificationSettingRepository notificationSettingRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final PersonalisationEngine personalisationEngine;

    @Transactional
    public void saveStep(UUID userId, int step, OnboardingStepRequest request) {
        if (step < 1 || step > TOTAL_STEPS) {
            throw new ValidationException("Onboarding step must be 1.." + TOTAL_STEPS + ", got " + step);
        }
        // Step 6 is optional document upload; a no-op for the profile in Phase 2.
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
        // Make sure notification defaults exist.
        notificationSettingService.getOrInit(userId);

        List<String> matchingTemplateCodes = personalisationEngine.matchingTemplateCodes(profile);
        UserProfileDto dto = userProfileService.get(userId);
        return new OnboardingFinalizeResponse(dto, List.of(), matchingTemplateCodes);
    }
}
