package com.smarthome.modules.devices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record DeviceRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank String type,
        String bleDeviceId,
        String bleDeviceName,
        String icon,
        UUID roomId
) {}
