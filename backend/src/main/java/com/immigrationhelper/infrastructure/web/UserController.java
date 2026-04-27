package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.user.UpdateUserRequest;
import com.immigrationhelper.application.dto.user.UserDto;
import com.immigrationhelper.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public UserDto getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getByEmail(userDetails.getUsername());
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
}
