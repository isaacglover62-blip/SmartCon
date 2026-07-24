package com.smarthome.modules.devices.dto;

import java.time.Instant;
import java.util.UUID;

public record DeviceResponse(
        UUID id,
        UUID homeId,
        UUID roomId,
        String name,
        String type,
        String bleDeviceId,
        String bleDeviceName,
        String icon,
        boolean online,
        boolean favorite,
        String firmwareVersion,
        Integer batteryLevel,
        Instant lastSeenAt,
        Instant createdAt
) {}
