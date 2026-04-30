package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.task.PatchTaskRequest;
import com.immigrationhelper.application.dto.task.SkipTaskRequest;
import com.immigrationhelper.application.dto.task.TaskDetailResponse;
import com.immigrationhelper.application.dto.task.TaskDto;
import com.immigrationhelper.application.dto.task.TaskListResponse;
import com.immigrationhelper.application.service.GuidanceFeatureGuard;
import com.immigrationhelper.application.service.TaskService;
import com.immigrationhelper.domain.enums.TaskStatus;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Helfa task list, primary dashboard surface")
@SecurityRequirement(name = "Bearer Authentication")
public class TaskController {

    private final TaskService taskService;
    private final GuidanceFeatureGuard guard;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "List tasks for the authenticated user")
    public TaskListResponse list(@RequestParam(required = false) TaskStatus status,
                                 @RequestParam(required = false) UUID journeyId,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size,
                                 Authentication authentication) {
        guard.requireEnabled();
        return taskService.list(currentUserId(authentication), status, journeyId, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Task detail with required documents and journey context")
    public TaskDetailResponse detail(@PathVariable UUID id, Authentication authentication) {
        guard.requireEnabled();
        return taskService.detail(currentUserId(authentication), id);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Mark complete or postpone a task")
    public TaskDto patch(@PathVariable UUID id,
                         @Valid @RequestBody PatchTaskRequest request,
                         Authentication authentication) {
        guard.requireEnabled();
        return taskService.patch(currentUserId(authentication), id, request);
    }

    @PostMapping("/{id}/skip")
    @Operation(summary = "Skip a task")
    public TaskDto skip(@PathVariable UUID id,
                        @RequestBody(required = false) SkipTaskRequest request,
                        Authentication authentication) {
        guard.requireEnabled();
        return taskService.skip(currentUserId(authentication), id);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
