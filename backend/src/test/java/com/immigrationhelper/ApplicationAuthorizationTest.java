package com.immigrationhelper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.ApplicationStatus;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.domain.enums.VisaType;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.persistence.VisaApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApplicationAuthorizationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired VisaApplicationRepository applicationRepository;

    private User userA;
    private User userB;
    private VisaApplication appOfUserA;

    @BeforeEach
    void setUp() {
        userA = userRepository.save(User.builder()
            .email("usera@test.com").name("User A")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());

        userB = userRepository.save(User.builder()
            .email("userb@test.com").name("User B")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());

        appOfUserA = applicationRepository.save(VisaApplication.builder()
            .user(userA).visaType(VisaType.STUDENT).status(ApplicationStatus.DRAFT).build());
    }

    // ── Issue 1: userId derived from JWT, not request body ───────────────────

    @Test
    void create_applicationBelongsToAuthenticatedUser_notArbitraryId() throws Exception {
        var body = new CreateApplicationRequest(null, VisaType.STUDENT, "notes");

        mockMvc.perform(post("/api/v1/applications")
                .with(user(userA.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.user.email").value(userA.getEmail()));
    }

    // ── Issue 2: cross-user list read ─────────────────────────────────────────

    @Test
    void getMyApplications_returnsOnlyOwnApplications() throws Exception {
        mockMvc.perform(get("/api/v1/applications/me")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].user.email").value(userA.getEmail()));
    }

    @Test
    void getMyApplications_userBSeesNoApplications() throws Exception {
        mockMvc.perform(get("/api/v1/applications/me")
                .with(user(userB.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    // ── Issue 3: cross-user single-record read ────────────────────────────────

    @Test
    void getApplication_byOwner_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId())
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.email").value(userA.getEmail()));
    }

    @Test
    void getApplication_byNonOwner_returns403() throws Exception {
        // Attack: userB reads userA's application by guessing the ID
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId())
                .with(user(userB.getEmail()).roles("FREE")))
            .andExpect(status().isForbidden());
    }

    // ── Issue 4a: ownership on status update ──────────────────────────────────

    @Test
    void updateStatus_byNonOwner_returns403() throws Exception {
        // Attack: userB submits userA's application
        mockMvc.perform(put("/api/v1/applications/" + appOfUserA.getId() + "/status")
                .with(user(userB.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null))))
            .andExpect(status().isForbidden());
    }

    // ── Issue 4b: role check — regular user cannot approve/reject ─────────────

    @Test
    void updateStatus_nonAdminApprove_returns403() throws Exception {
        // Attack: user approves their own application
        mockMvc.perform(put("/api/v1/applications/" + appOfUserA.getId() + "/status")
                .with(user(userA.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateStatusRequest(ApplicationStatus.APPROVED, null))))
            .andExpect(status().isForbidden());
    }

    @Test
    void updateStatus_nonAdminReject_returns403() throws Exception {
        mockMvc.perform(put("/api/v1/applications/" + appOfUserA.getId() + "/status")
                .with(user(userA.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateStatusRequest(ApplicationStatus.REJECTED, null))))
            .andExpect(status().isForbidden());
    }

    // ── Issue 4c: state machine ────────────────────────────────────────────────

    @Test
    void updateStatus_draftToSubmitted_returns200() throws Exception {
        // Happy path: owner submits their own draft
        mockMvc.perform(put("/api/v1/applications/" + appOfUserA.getId() + "/status")
                .with(user(userA.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void updateStatus_submittedToDraft_returns400() throws Exception {
        // Attack: user tries to reset a submitted application back to draft
        appOfUserA.setStatus(ApplicationStatus.SUBMITTED);
        applicationRepository.save(appOfUserA);

        mockMvc.perform(put("/api/v1/applications/" + appOfUserA.getId() + "/status")
                .with(user(userA.getEmail()).roles("FREE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateStatusRequest(ApplicationStatus.DRAFT, null))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void updateStatus_approvedApplication_returns400() throws Exception {
        // Attack: user tries to re-open an approved application
        appOfUserA.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(appOfUserA);

        mockMvc.perform(put("/api/v1/applications/" + appOfUserA.getId() + "/status")
                .with(user(userA.getEmail()).roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateStatusRequest(ApplicationStatus.SUBMITTED, null))))
            .andExpect(status().isBadRequest());
    }
}
