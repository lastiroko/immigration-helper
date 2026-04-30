package com.immigrationhelper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.profile.NotificationSettingDto;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.dto.profile.UpdateUserProfileRequest;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.DigestMode;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.NotificationSettingRepository;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import com.immigrationhelper.infrastructure.persistence.UserProfileRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "features.guidance.enabled=true")
@Transactional
class OnboardingIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired UserProfileRepository profileRepository;
    @Autowired NotificationSettingRepository settingRepository;
    @Autowired CityRepository cityRepository;
    @Autowired TaskTemplateRepository templateRepository;

    private User chiamaka;
    private City munich;

    @BeforeEach
    void setUp() {
        chiamaka = userRepository.save(User.builder()
            .email("chiamaka@test.com").name("Chiamaka")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());

        munich = cityRepository.save(City.builder()
            .slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build());
        cityRepository.save(City.builder()
            .slug("berlin").name("Berlin").bundesland("Berlin").supportedFromPhase("MVP").build());

        templateRepository.save(template("PASSPORT_VALID", "{\"all\":true}", 10));
        templateRepository.save(template("ANMELDUNG_REGISTER", "{\"all\":true}", 5));
        templateRepository.save(template("SPERRKONTO_OPEN",
            "{\"visaPathway\":[\"STUDENT\",\"CHANCENKARTE\"]}", 15));
        templateRepository.save(template("UNI_MATRICULATE",
            "{\"visaPathway\":[\"STUDENT\"]}", 25));
        templateRepository.save(template("ZAB_RECOGNITION",
            "{\"visaPathway\":[\"BLUE_CARD\",\"CHANCENKARTE\"]}", 35));
    }

    @Test
    void walksAllSixStepsAndFinalizesPersonalisedTaskList() throws Exception {
        // Step 1 — Nationality
        postStep(1, new OnboardingStepRequest(
            "Chiamaka", "NG", null, null, null, null, null, null, null, null, null));

        // Step 2 — City
        postStep(2, new OnboardingStepRequest(
            null, null, null, "munich", null, null, null, null, null, null, null));

        // Step 3 — Visa pathway
        postStep(3, new OnboardingStepRequest(
            null, null, null, null, VisaPathway.STUDENT, null, null, null, null, null, null));

        // Step 4 — Family status
        postStep(4, new OnboardingStepRequest(
            null, null, null, null, null, FamilyStatus.SINGLE, false, null, null, null, null));

        // Step 5 — Arrival timeline
        postStep(5, new OnboardingStepRequest(
            null, null, null, null, null, null, null,
            LocalDate.of(2026, 9, 1), null, null, "ARRIVING_30_DAYS"));

        // Step 6 — Optional document upload (no-op for Phase 2)
        postStep(6, new OnboardingStepRequest(
            null, null, null, null, null, null, null, null, null, null, null));

        // Profile is populated
        mockMvc.perform(get("/api/v1/users/me/profile")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstName").value("Chiamaka"))
            .andExpect(jsonPath("$.nationality").value("NG"))
            .andExpect(jsonPath("$.citySlug").value("munich"))
            .andExpect(jsonPath("$.visaPathway").value("STUDENT"))
            .andExpect(jsonPath("$.familyStatus").value("SINGLE"));

        // Finalize triggers personalisation engine
        mockMvc.perform(post("/api/v1/users/me/onboarding/finalize")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.profile.citySlug").value("munich"))
            .andExpect(jsonPath("$.firstTasks").isArray())
            .andExpect(jsonPath("$.journeys[0].type").value("STUDENT_ARRIVAL"))
            // Student in Munich gets all-applicable + STUDENT-specific templates,
            // ordered by priority (ANMELDUNG_REGISTER=5 first).
            .andExpect(jsonPath("$.firstTasks[0].templateCode").value("ANMELDUNG_REGISTER"))
            .andExpect(jsonPath("$.firstTasks[*].templateCode",
                org.hamcrest.Matchers.hasItem("PASSPORT_VALID")))
            .andExpect(jsonPath("$.firstTasks[*].templateCode",
                org.hamcrest.Matchers.hasItem("SPERRKONTO_OPEN")))
            .andExpect(jsonPath("$.firstTasks[*].templateCode",
                org.hamcrest.Matchers.hasItem("UNI_MATRICULATE")))
            .andExpect(jsonPath("$.firstTasks[*].templateCode",
                org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("ZAB_RECOGNITION"))));

        // Notification defaults written
        assertThat(settingRepository.findById(chiamaka.getId())).isPresent();
    }

    @Test
    void finalizeWithIncompleteProfile_returnsBadRequest() throws Exception {
        // Only nationality submitted — missing city, visa pathway, family status.
        postStep(1, new OnboardingStepRequest(
            null, "NG", null, null, null, null, null, null, null, null, null));

        mockMvc.perform(post("/api/v1/users/me/onboarding/finalize")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void invalidStepNumber_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/onboarding/step/9")
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OnboardingStepRequest(
                    null, null, null, null, null, null, null, null, null, null, null))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void unknownCitySlug_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/onboarding/step/2")
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OnboardingStepRequest(
                    null, null, null, "atlantis", null, null, null, null, null, null, null))))
            .andExpect(status().isNotFound());
    }

    @Test
    void patchProfile_appliesPartialUpdate() throws Exception {
        // Bootstrap a profile via step 3 (visa pathway).
        postStep(3, new OnboardingStepRequest(
            null, null, null, null, VisaPathway.BLUE_CARD, null, null, null, null, null, null));

        UpdateUserProfileRequest patch = new UpdateUserProfileRequest(
            "Arjun", "IN", null, null, FamilyStatus.MARRIED, true, null, null, null);

        mockMvc.perform(patch("/api/v1/users/me/profile")
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patch)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstName").value("Arjun"))
            .andExpect(jsonPath("$.nationality").value("IN"))
            .andExpect(jsonPath("$.visaPathway").value("BLUE_CARD"))
            .andExpect(jsonPath("$.familyStatus").value("MARRIED"))
            .andExpect(jsonPath("$.familyInGermany").value(true));
    }

    @Test
    void notificationSettings_putReturnsReplacedValues() throws Exception {
        NotificationSettingDto dto = new NotificationSettingDto(
            false, true, DigestMode.WEEKLY, "MON",
            LocalTime.of(7, 30), LocalTime.of(23, 0), LocalTime.of(7, 0));

        mockMvc.perform(put("/api/v1/users/me/notification-settings")
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pushEnabled").value(false))
            .andExpect(jsonPath("$.digestMode").value("WEEKLY"))
            .andExpect(jsonPath("$.digestDay").value("MON"));
    }

    @Test
    void notificationSettings_getInitialisesDefaults() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/notification-settings")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pushEnabled").value(true))
            .andExpect(jsonPath("$.emailEnabled").value(true))
            .andExpect(jsonPath("$.digestMode").value("IMMEDIATE"));
    }

    private void postStep(int n, OnboardingStepRequest body) throws Exception {
        mockMvc.perform(post("/api/v1/users/me/onboarding/step/" + n)
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isNoContent());
    }

    private static TaskTemplate template(String code, String applicableTo, int priority) {
        return TaskTemplate.builder()
            .code(code)
            .title("{\"en\":\"" + code + "\"}")
            .description("{\"en\":\"\"}")
            .applicableTo(applicableTo)
            .priority(priority)
            .phase("MVP")
            .build();
    }
}
