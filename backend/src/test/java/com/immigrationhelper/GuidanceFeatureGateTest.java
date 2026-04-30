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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * When features.guidance.enabled is false (the dev/test default), all guidance endpoints
 * must return 404 — i.e., the new domain is invisible to the existing CRM-only UI.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GuidanceFeatureGateTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;

    private User u;

    @BeforeEach
    void setUp() {
        u = userRepository.save(User.builder()
            .email("gate@test.com").name("Gate")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());
    }

    @Test
    void getProfile_whenFlagOff_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/profile")
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }

    @Test
    void getNotificationSettings_whenFlagOff_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/notification-settings")
                .with(user(u.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }
}
