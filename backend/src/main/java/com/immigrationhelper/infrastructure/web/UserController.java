package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.user.AccountDeletionResponse;
import com.immigrationhelper.application.dto.user.UpdateUserRequest;
import com.immigrationhelper.application.dto.user.UserDto;
import com.immigrationhelper.application.service.AccountDeletionService;
import com.immigrationhelper.application.service.UserService;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;
    private final AccountDeletionService accountDeletionService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public UserDto getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getByEmail(userDetails.getUsername());
    }

    @DeleteMapping("/me")
    @Operation(summary = "Mark the current user for deletion (30-day grace, then hard-delete)")
    public AccountDeletionResponse deleteSelf(Authentication authentication) {
        return accountDeletionService.requestDeletion(currentUserId(authentication));
    }

    @PostMapping("/me/restore")
    @Operation(summary = "Cancel a pending account deletion within the 30-day grace window")
    public AccountDeletionResponse restoreSelf(Authentication authentication) {
        return accountDeletionService.cancelDeletion(currentUserId(authentication));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public UserDto getUser(@PathVariable UUID id) {
        return userService.getById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile")
    public UserDto updateUser(@PathVariable UUID id,
                               @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
