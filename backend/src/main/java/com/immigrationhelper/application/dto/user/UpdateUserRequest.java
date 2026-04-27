package com.immigrationhelper.application.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(min = 2, max = 255) String name,
    @Size(min = 8, max = 100) String currentPassword,
    @Size(min = 8, max = 100) String newPassword
) {}
