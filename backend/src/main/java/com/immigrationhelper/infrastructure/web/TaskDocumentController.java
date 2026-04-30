package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.task.AttachDocumentRequest;
import com.immigrationhelper.application.dto.task.TaskDocumentLinkDto;
import com.immigrationhelper.application.service.GuidanceFeatureGuard;
import com.immigrationhelper.application.service.TaskDocumentService;
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
@RequestMapping("/api/v1/tasks/{taskId}/documents")
@RequiredArgsConstructor
@Tag(name = "Task documents", description = "Attach vault documents to a task")
@SecurityRequirement(name = "Bearer Authentication")
public class TaskDocumentController {

    private final TaskDocumentService service;
    private final GuidanceFeatureGuard guard;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Attach an existing vault document to a task")
    public TaskDocumentLinkDto attach(@PathVariable UUID taskId,
                                      @Valid @RequestBody AttachDocumentRequest request,
                                      Authentication authentication) {
        guard.requireEnabled();
        return service.attach(currentUserId(authentication), taskId, request);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
