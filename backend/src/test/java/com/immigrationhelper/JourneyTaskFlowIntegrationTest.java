package com.immigrationhelper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.dto.task.AttachDocumentRequest;
import com.immigrationhelper.application.dto.task.PatchTaskRequest;
import com.immigrationhelper.application.service.DeadlineEngine;
import com.immigrationhelper.domain.entity.City;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.OutboxStatus;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.domain.enums.TaskStatus;
import com.immigrationhelper.domain.enums.VisaPathway;
import com.immigrationhelper.infrastructure.persistence.CityRepository;
import com.immigrationhelper.infrastructure.persistence.NotificationOutboxRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end flow per Phase 3 deliverable:
 * onboard → tasks created → complete one → dependent task scheduled → upload doc → attach → satisfied.
 *
 * Also exercises the deadline engine (manual sweep) and the notification outbox.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "features.guidance.enabled=true")
@Transactional
class JourneyTaskFlowIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CityRepository cityRepository;
    @Autowired TaskTemplateRepository templateRepository;
    @Autowired TaskRepository taskRepository;
    @Autowired NotificationOutboxRepository outboxRepository;
    @Autowired DeadlineEngine deadlineEngine;

    private User chiamaka;

    @BeforeEach
    void setUp() {
        chiamaka = userRepository.save(User.builder()
            .email("flow-chiamaka@test.com").name("Chiamaka")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());

        cityRepository.save(City.builder()
            .slug("munich").name("Munich").bundesland("Bayern").supportedFromPhase("MVP").build());

        templateRepository.save(template("ANMELDUNG_REGISTER", "{\"all\":true}", 5, 14, List.of(), List.of()));
        templateRepository.save(template("PASSPORT_VALID", "{\"all\":true}", 10, 90, List.of(), List.of("PASSPORT")));
        templateRepository.save(template("TAX_ID_RECEIVE", "{\"all\":true}", 30, 21,
            List.of("ANMELDUNG_REGISTER"), List.of("TAX_ID_LETTER")));
    }

    @Test
    void fullFlow_onboardCompleteUploadAttach() throws Exception {
        walkOnboarding();

        MvcResult finalizeResult = mockMvc.perform(post("/api/v1/users/me/onboarding/finalize")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstTasks").isArray())
            .andReturn();

        // Confirm tasks were created in DB
        List<Task> tasksAfterFinalize = taskRepository.findAll().stream()
            .filter(t -> t.getUserId().equals(chiamaka.getId())).toList();
        assertThat(tasksAfterFinalize).extracting(Task::getTemplateCode)
            .contains("ANMELDUNG_REGISTER", "PASSPORT_VALID", "TAX_ID_RECEIVE");

        // The task that depends on ANMELDUNG_REGISTER starts blocked (dueAt null)
        Task taxId = findByCode(tasksAfterFinalize, "TAX_ID_RECEIVE");
        Task anmeldung = findByCode(tasksAfterFinalize, "ANMELDUNG_REGISTER");
        assertThat(taxId.getDueAt()).isNull();
        assertThat(anmeldung.getDueAt()).isNotNull();

        // Complete the Anmeldung — TAX_ID_RECEIVE should now have a dueAt and an outbox row
        mockMvc.perform(patch("/api/v1/tasks/" + anmeldung.getId())
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PatchTaskRequest(TaskStatus.COMPLETE, null))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETE"));

        Task taxIdAfter = taskRepository.findById(taxId.getId()).orElseThrow();
        assertThat(taxIdAfter.getDueAt()).isNotNull();

        long releasedOutboxCount = outboxRepository.findAll().stream()
            .filter(n -> n.getKind().toString().equals("TASK_RELEASED"))
            .count();
        assertThat(releasedOutboxCount).isEqualTo(1);

        // Upload a document into the vault
        MockMultipartFile file = new MockMultipartFile(
            "file", "passport.pdf", "application/pdf", "PDFCONTENT".getBytes());

        String docResponse = mockMvc.perform(multipart("/api/v1/documents")
                .file(file)
                .param("type", "PASSPORT")
                .param("title", "My passport")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("PASSPORT"))
            .andReturn().getResponse().getContentAsString();
        UUID documentId = UUID.fromString(objectMapper.readTree(docResponse).get("id").asText());

        // Attach the document to the PASSPORT_VALID task (PASSPORT slot matches → satisfied=true)
        Task passport = findByCode(tasksAfterFinalize, "PASSPORT_VALID");
        mockMvc.perform(post("/api/v1/tasks/" + passport.getId() + "/documents")
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AttachDocumentRequest(documentId, null))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.satisfied").value(true));
    }

    @Test
    void deadlineEngineSweep_transitionsTaskAndEmitsOutbox() throws Exception {
        walkOnboarding();
        mockMvc.perform(post("/api/v1/users/me/onboarding/finalize")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk());

        // Force one task into the past so the engine flips it OVERDUE.
        Task task = taskRepository.findAll().stream()
            .filter(t -> t.getUserId().equals(chiamaka.getId()) && t.getDueAt() != null)
            .findFirst().orElseThrow();
        task.setDueAt(LocalDateTime.now().minusDays(2));
        taskRepository.save(task);

        int transitions = deadlineEngine.sweep();
        assertThat(transitions).isGreaterThanOrEqualTo(1);

        Task reread = taskRepository.findById(task.getId()).orElseThrow();
        assertThat(reread.getStatus()).isEqualTo(TaskStatus.OVERDUE);
        assertThat(outboxRepository.countByUserIdAndStatus(chiamaka.getId(), OutboxStatus.PENDING))
            .isGreaterThanOrEqualTo(1);
    }

    @Test
    void crossUserTaskAccess_returns403() throws Exception {
        walkOnboarding();
        mockMvc.perform(post("/api/v1/users/me/onboarding/finalize")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk());

        Task task = taskRepository.findAll().stream()
            .filter(t -> t.getUserId().equals(chiamaka.getId()))
            .findFirst().orElseThrow();

        User intruder = userRepository.save(User.builder()
            .email("intruder@test.com").name("I").passwordHash("x").subscriptionTier(SubscriptionTier.FREE).build());

        mockMvc.perform(get("/api/v1/tasks/" + task.getId())
                .with(user(intruder.getEmail()).roles("FREE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void postponeBeyond30Days_returnsBadRequest() throws Exception {
        walkOnboarding();
        mockMvc.perform(post("/api/v1/users/me/onboarding/finalize")
                .with(user(chiamaka.getEmail()).roles("FREE")))
            .andExpect(status().isOk());

        Task task = taskRepository.findAll().stream()
            .filter(t -> t.getUserId().equals(chiamaka.getId()))
            .findFirst().orElseThrow();

        mockMvc.perform(patch("/api/v1/tasks/" + task.getId())
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new PatchTaskRequest(null, LocalDate.now().plusDays(60)))))
            .andExpect(status().isBadRequest());
    }

    private void walkOnboarding() throws Exception {
        postStep(1, new OnboardingStepRequest(
            "Chiamaka", "NG", null, null, null, null, null, null, null, null, null));
        postStep(2, new OnboardingStepRequest(
            null, null, null, "munich", null, null, null, null, null, null, null));
        postStep(3, new OnboardingStepRequest(
            null, null, null, null, VisaPathway.STUDENT, null, null, null, null, null, null));
        postStep(4, new OnboardingStepRequest(
            null, null, null, null, null, FamilyStatus.SINGLE, false, null, null, null, null));
        postStep(5, new OnboardingStepRequest(
            null, null, null, null, null, null, null,
            LocalDate.of(2026, 9, 1), null, null, "ARRIVING_30_DAYS"));
        postStep(6, new OnboardingStepRequest(
            null, null, null, null, null, null, null, null, null, null, null));
    }

    private void postStep(int n, OnboardingStepRequest body) throws Exception {
        mockMvc.perform(post("/api/v1/users/me/onboarding/step/" + n)
                .with(user(chiamaka.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isNoContent());
    }

    private static Task findByCode(List<Task> tasks, String code) {
        return tasks.stream().filter(t -> t.getTemplateCode().equals(code))
            .findFirst().orElseThrow();
    }

    private static TaskTemplate template(String code, String applicableTo, int priority,
                                          int leadDays, List<String> dependsOn, List<String> docTypes) {
        return TaskTemplate.builder()
            .code(code)
            .title("{\"en\":\"" + code + "\"}")
            .description("{\"en\":\"\"}")
            .applicableTo(applicableTo)
            .priority(priority)
            .defaultLeadDays(leadDays)
            .phase("MVP")
            .dependsOn(new java.util.ArrayList<>(dependsOn))
            .associatedDocumentTypes(new java.util.ArrayList<>(docTypes))
            .build();
    }
}
