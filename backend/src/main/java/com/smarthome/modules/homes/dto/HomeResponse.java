package com.smarthome.modules.homes.dto;

import java.time.Instant;
import java.util.UUID;

public record HomeResponse(
        UUID id,
        String name,
        String description,
        String address,
        String timezone,
        String icon,
        UUID ownerId,
        Instant createdAt,
        Instant updatedAt
) {}
