package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.StatusHistoryDto;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.application.service.VisaApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Visa Applications", description = "Manage visa applications")
@SecurityRequirement(name = "Bearer Authentication")
public class ApplicationController {

    private final VisaApplicationService applicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new visa application for the authenticated user")
    public ApplicationDto createApplication(@Valid @RequestBody CreateApplicationRequest request,
                                             Authentication authentication) {
        return applicationService.create(request, authentication.getName());
    }

    @GetMapping("/me")
    @Operation(summary = "Get all visa applications belonging to the authenticated user")
    public List<ApplicationDto> getMyApplications(Authentication authentication) {
        return applicationService.getByAuthenticatedUser(authentication.getName());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a visa application by ID (must belong to the authenticated user)")
    public ApplicationDto getApplication(@PathVariable UUID id, Authentication authentication) {
        return applicationService.getById(id, authentication.getName());
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update visa application status")
    public ApplicationDto updateStatus(@PathVariable UUID id,
                                        @Valid @RequestBody UpdateStatusRequest request,
                                        Authentication authentication) {
        return applicationService.updateStatus(id, request, authentication);
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get the chronological status history of a visa application")
    public List<StatusHistoryDto> getHistory(@PathVariable UUID id, Authentication authentication) {
        return applicationService.getHistory(id, authentication);
    }
}
