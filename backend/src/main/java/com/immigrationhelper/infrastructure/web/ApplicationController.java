package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.application.ApplicationDto;
import com.immigrationhelper.application.dto.application.CreateApplicationRequest;
import com.immigrationhelper.application.dto.application.UpdateStatusRequest;
import com.immigrationhelper.application.service.VisaApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    @Operation(summary = "Create a new visa application")
    public ApplicationDto createApplication(@Valid @RequestBody CreateApplicationRequest request) {
        return applicationService.create(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get visa application by ID")
    public ApplicationDto getApplication(@PathVariable UUID id) {
        return applicationService.getById(id);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all visa applications for a user")
    public List<ApplicationDto> getUserApplications(@PathVariable UUID userId) {
        return applicationService.getByUserId(userId);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update visa application status")
    public ApplicationDto updateStatus(@PathVariable UUID id,
                                        @Valid @RequestBody UpdateStatusRequest request) {
        return applicationService.updateStatus(id, request);
    }
}
