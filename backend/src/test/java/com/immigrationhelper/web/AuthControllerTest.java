package com.immigrationhelper.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.immigrationhelper.application.dto.auth.AuthResponse;
import com.immigrationhelper.application.dto.auth.LoginRequest;
import com.immigrationhelper.application.dto.auth.RegisterRequest;
import com.immigrationhelper.application.service.AuthService;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.infrastructure.security.JwtTokenProvider;
import com.immigrationhelper.infrastructure.web.AuthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@Import(AuthControllerTest.OpenSecurityConfig.class)
class AuthControllerTest {

    @TestConfiguration
    static class OpenSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .build();
        }
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthService authService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean UserDetailsService userDetailsService;

    private final AuthResponse mockAuthResponse = AuthResponse.of(
        "access-token", "refresh-token", 604800000L,
        UUID.randomUUID(), "test@example.com", "Test User", SubscriptionTier.FREE
    );

    @Test
    void register_withValidRequest_returns201() throws Exception {
        when(authService.register(any())).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new RegisterRequest("test@example.com", "password123", "Test User")
                )))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accessToken").value("access-token"))
            .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new RegisterRequest("not-an-email", "password123", "Test User")
                )))
            .andExpect(status().isBadRequest());
    }

    @Test
    void register_withShortPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new RegisterRequest("test@example.com", "short", "Test User")
                )))
            .andExpect(status().isBadRequest());
    }

    @Test
    void login_withValidCredentials_returns200() throws Exception {
        when(authService.login(any())).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new LoginRequest("test@example.com", "password123")
                )))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void login_withBadCredentials_returns401() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("Invalid credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new LoginRequest("test@example.com", "wrongpassword")
                )))
            .andExpect(status().isUnauthorized());
    }
}
