package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.profile.NotificationSettingDto;
import com.immigrationhelper.application.dto.profile.OnboardingFinalizeResponse;
import com.immigrationhelper.application.dto.profile.OnboardingStepRequest;
import com.immigrationhelper.application.dto.profile.UpdateUserProfileRequest;
import com.immigrationhelper.application.dto.profile.UserProfileDto;
import com.immigrationhelper.application.service.GuidanceFeatureGuard;
import com.immigrationhelper.application.service.NotificationSettingService;
import com.immigrationhelper.application.service.OnboardingService;
import com.immigrationhelper.application.service.UserProfileService;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "User profile + onboarding", description = "Helfa guidance: profile, onboarding, notification settings")
@SecurityRequirement(name = "Bearer Authentication")
public class UserProfileController {

    private final UserProfileService profileService;
    private final NotificationSettingService notificationSettingService;
    private final OnboardingService onboardingService;
    private final GuidanceFeatureGuard guard;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    @Operation(summary = "Get the authenticated user's Helfa profile")
    public UserProfileDto getProfile(Authentication authentication) {
        guard.requireEnabled();
        return profileService.get(currentUserId(authentication));
    }

    @PatchMapping("/profile")
    @Operation(summary = "Update the authenticated user's Helfa profile")
    public UserProfileDto patchProfile(@Valid @RequestBody UpdateUserProfileRequest request,
                                       Authentication authentication) {
        guard.requireEnabled();
        return profileService.upsert(currentUserId(authentication), request);
    }

    @PostMapping("/onboarding/step/{n}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Save onboarding step n (1..6)")
    public void saveOnboardingStep(@PathVariable("n") int n,
                                   @Valid @RequestBody OnboardingStepRequest request,
                                   Authentication authentication) {
        guard.requireEnabled();
        onboardingService.saveStep(currentUserId(authentication), n, request);
    }

    @PostMapping("/onboarding/finalize")
    @Operation(summary = "Finalize onboarding and trigger personalisation engine")
    public OnboardingFinalizeResponse finalizeOnboarding(Authentication authentication) {
        guard.requireEnabled();
        return onboardingService.finalize(currentUserId(authentication));
    }

    @GetMapping("/notification-settings")
    @Operation(summary = "Get the authenticated user's notification settings")
    public NotificationSettingDto getNotificationSettings(Authentication authentication) {
        guard.requireEnabled();
        return notificationSettingService.getOrInit(currentUserId(authentication));
    }

    @PutMapping("/notification-settings")
    @Operation(summary = "Replace the authenticated user's notification settings")
    public NotificationSettingDto putNotificationSettings(@Valid @RequestBody NotificationSettingDto dto,
                                                          Authentication authentication) {
        guard.requireEnabled();
        return notificationSettingService.replace(currentUserId(authentication), dto);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
