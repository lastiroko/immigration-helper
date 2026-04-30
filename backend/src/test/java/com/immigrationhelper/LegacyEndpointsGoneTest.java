package com.immigrationhelper;

import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 4 exit criterion: the legacy CRM endpoints no longer exist. Calls to them must
 * 404 (Spring's default for unmapped routes), not 401/403/500.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class LegacyEndpointsGoneTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;

    private User u;

    @BeforeEach
    void setUp() {
        u = userRepository.save(User.builder()
            .email("legacy-gone@test.com").name("L")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());
    }

    @Test
    void getApplications_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/applications/me")
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }

    @Test
    void getApplicationById_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/applications/" + UUID.randomUUID())
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }

    @Test
    void postApplication_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/applications")
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }

    @Test
    void getApplicationDocuments_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/applications/" + UUID.randomUUID() + "/documents")
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }

    @Test
    void getApplicationHistory_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/applications/" + UUID.randomUUID() + "/history")
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }
}
