package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.journey.PatchJourneyRequest;
import com.immigrationhelper.application.dto.journey.StartJourneyRequest;
import com.immigrationhelper.application.dto.journey.UserJourneyDto;
import com.immigrationhelper.application.service.GuidanceFeatureGuard;
import com.immigrationhelper.application.service.UserJourneyService;
import com.immigrationhelper.domain.enums.JourneyStatus;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/journeys")
@RequiredArgsConstructor
@Tag(name = "Journeys", description = "Helfa user journeys")
@SecurityRequirement(name = "Bearer Authentication")
public class JourneyController {

    private final UserJourneyService journeyService;
    private final GuidanceFeatureGuard guard;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "List journeys for the authenticated user")
    public List<UserJourneyDto> list(@RequestParam(required = false) JourneyStatus status,
                                     Authentication authentication) {
        guard.requireEnabled();
        return journeyService.list(currentUserId(authentication), status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Start a new journey")
    public UserJourneyDto start(@Valid @RequestBody StartJourneyRequest request,
                                Authentication authentication) {
        guard.requireEnabled();
        return journeyService.start(currentUserId(authentication), request.type());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a journey by id")
    public UserJourneyDto get(@PathVariable UUID id, Authentication authentication) {
        guard.requireEnabled();
        return journeyService.get(currentUserId(authentication), id);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update journey status (archive or complete)")
    public UserJourneyDto patch(@PathVariable UUID id,
                                @Valid @RequestBody PatchJourneyRequest request,
                                Authentication authentication) {
        guard.requireEnabled();
        return journeyService.patch(currentUserId(authentication), id, request);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
