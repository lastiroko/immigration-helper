package com.immigrationhelper.service;

import com.immigrationhelper.application.dto.profile.OnboardingFinalizeResponse;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.dto.profile.UserProfileDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.application.service.NotificationSettingService;
import com.immigrationhelper.application.service.OnboardingService;
import com.immigrationhelper.application.service.PersonalisationEngine;
import com.immigrationhelper.application.service.UserProfileService;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.UserJourney;
import com.immigrationhelper.domain.entity.UserProfile;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.JourneyType;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import com.immigrationhelper.infrastructure.persistence.UserJourneyRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
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
    @Mock UserProfileRepository userProfileRepository;
    @Mock UserJourneyRepository journeyRepository;
    @Mock TaskRepository taskRepository;
    @Mock TaskTemplateRepository templateRepository;
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
        City city = City.builder().slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build();
        when(cityRepository.findBySlug("munich")).thenReturn(Optional.of(city));

        OnboardingStepRequest req = new OnboardingStepRequest(
            null, null, null, "munich", null, null, null, null, null, null, null);
        onboarding.saveStep(userId, 2, req);
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
    void finalize_completeProfile_createsJourneyAndTasks() {
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

        UUID journeyId = UUID.randomUUID();
        when(journeyRepository.save(any(UserJourney.class))).thenAnswer(inv -> {
            UserJourney j = inv.getArgument(0);
            j.setId(journeyId);
            return j;
        });

        when(templateRepository.findByCode("PASSPORT_VALID")).thenReturn(Optional.of(
            template("PASSPORT_VALID", 10, 90)));
        when(templateRepository.findByCode("ANMELDUNG_REGISTER")).thenReturn(Optional.of(
            template("ANMELDUNG_REGISTER", 5, 14)));
        when(templateRepository.findByCode("UNI_MATRICULATE")).thenReturn(Optional.of(
            template("UNI_MATRICULATE", 25, 30)));

        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });
        when(userProfileService.get(userId)).thenReturn(new UserProfileDto(
            userId, null, "NG", null, "munich", VisaPathway.STUDENT, FamilyStatus.SINGLE,
            false, null, null, null));

        OnboardingFinalizeResponse response = onboarding.finalize(userId);
        assertThat(response.firstTasks()).hasSize(3);
        assertThat(response.firstTasks()).extracting("templateCode")
            .containsExactly("PASSPORT_VALID", "ANMELDUNG_REGISTER", "UNI_MATRICULATE");
        assertThat(response.journeys()).hasSize(1);
        assertThat(response.journeys().get(0).type()).isEqualTo(JourneyType.STUDENT_ARRIVAL);
        verify(notificationSettingService).getOrInit(userId);
    }

    private static TaskTemplate template(String code, int priority, int leadDays) {
        TaskTemplate t = TaskTemplate.builder()
            .code(code)
            .title("{\"en\":\"" + code + "\"}")
            .description("{\"en\":\"\"}")
            .applicableTo("{\"all\":true}")
            .priority(priority)
            .defaultLeadDays(leadDays)
            .phase("MVP")
            .build();
        t.setId(UUID.randomUUID());
        return t;
    }
}
