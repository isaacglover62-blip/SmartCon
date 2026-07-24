package com.smarthome.modules.auth.dto;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserInfo user
) {
    public record UserInfo(UUID id, String email, String firstName, String lastName, String avatarUrl, String role) {}
}
