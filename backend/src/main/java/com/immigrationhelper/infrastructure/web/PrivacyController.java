package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.privacy.PrivacyExportDto;
import com.immigrationhelper.application.service.PrivacyExportService;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/privacy")
@RequiredArgsConstructor
@Tag(name = "Privacy", description = "GDPR data export")
@SecurityRequirement(name = "Bearer Authentication")
public class PrivacyController {

    private final PrivacyExportService exportService;
    private final UserRepository userRepository;

    @PostMapping("/export")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Queue a GDPR data export. Worker assembles a JSON bundle.")
    public PrivacyExportDto request(Authentication authentication) {
        return exportService.request(currentUserId(authentication));
    }

    @GetMapping("/export/{id}")
    @Operation(summary = "Get the status of a previously requested export")
    public PrivacyExportDto status(@PathVariable UUID id, Authentication authentication) {
        return exportService.get(currentUserId(authentication), id);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
