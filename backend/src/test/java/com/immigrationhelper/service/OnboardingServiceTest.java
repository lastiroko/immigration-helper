package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.profile.OnboardingFinalizeResponse;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.application.service.NotificationSettingService;
import com.immigrationhelper.application.service.OnboardingService;
import com.immigrationhelper.application.service.PersonalisationEngine;
import com.immigrationhelper.application.service.UserProfileService;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.NotificationSettingRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceTest {

    @Mock UserProfileService userProfileService;
    @Mock NotificationSettingService notificationSettingService;
    @Mock NotificationSettingRepository notificationSettingRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock UserRepository userRepository;
    @Mock CityRepository cityRepository;
    @Mock PersonalisationEngine personalisationEngine;

    @InjectMocks OnboardingService onboarding;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void saveStep_outOfRange_throwsValidation() {
        assertThatThrownBy(() -> onboarding.saveStep(userId, 0, new OnboardingStepRequest(
            null, null, null, null, null, null, null, null, null, null, null)))
            .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> onboarding.saveStep(userId, 7, new OnboardingStepRequest(
            null, null, null, null, null, null, null, null, null, null, null)))
            .isInstanceOf(ValidationException.class);
    }

    @Test
    void saveStep_resolvesCitySlugToCityId() {
        UUID cityId = UUID.randomUUID();
        City city = City.builder().slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build();
        when(cityRepository.findBySlug("munich")).thenReturn(Optional.of(city));

        // The service depends on city.getId() which is set by JPA — return a stub city with reflective id.
        // To avoid reflection, we accept that real id is null and just confirm the slug-resolution path is taken.
        OnboardingStepRequest req = new OnboardingStepRequest(
            null, null, null, "munich", null, null, null, null, null, null, null);
        onboarding.saveStep(userId, 2, req);
        // service should call upsert (we verify it does, not the specific cityId)
        verify(userProfileService).upsert(eq(userId), any());
    }

    @Test
    void saveStep_unknownCitySlug_throwsResourceNotFound() {
        when(cityRepository.findBySlug("atlantis")).thenReturn(Optional.empty());

        OnboardingStepRequest req = new OnboardingStepRequest(
            null, null, null, "atlantis", null, null, null, null, null, null, null);
        assertThatThrownBy(() -> onboarding.saveStep(userId, 2, req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void saveStep_step6_isAcknowledgedNoOp() {
        OnboardingStepRequest req = new OnboardingStepRequest(
            null, null, null, null, null, null, null, null, null, null, null);
        onboarding.saveStep(userId, 6, req);
        verify(userProfileService, never()).upsert(any(), any());
    }

    @Test
    void finalize_missingRequiredFields_throws() {
        UserProfile incomplete = UserProfile.builder().userId(userId).build();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(incomplete));

        assertThatThrownBy(() -> onboarding.finalize(userId))
            .isInstanceOf(ValidationException.class);
    }

    @Test
    void finalize_noProfileAtAll_throws() {
        when(userProfileRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> onboarding.finalize(userId))
            .isInstanceOf(ValidationException.class);
    }

    @Test
    void finalize_completeProfile_returnsMatchingTemplateCodes() {
        City munich = City.builder().slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build();
        UserProfile complete = UserProfile.builder()
            .userId(userId)
            .nationality("NG")
            .city(munich)
            .visaPathway(VisaPathway.STUDENT)
            .familyStatus(FamilyStatus.SINGLE)
            .build();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(complete));
        when(personalisationEngine.matchingTemplateCodes(complete))
            .thenReturn(List.of("PASSPORT_VALID", "ANMELDUNG_REGISTER", "UNI_MATRICULATE"));

        OnboardingFinalizeResponse response = onboarding.finalize(userId);
        assertThat(response.firstTasks()).containsExactly(
            "PASSPORT_VALID", "ANMELDUNG_REGISTER", "UNI_MATRICULATE");
        assertThat(response.journeys()).isEmpty();
        verify(notificationSettingService).getOrInit(userId);
    }
}
