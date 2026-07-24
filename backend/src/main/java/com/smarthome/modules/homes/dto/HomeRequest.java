package com.smarthome.modules.homes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HomeRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        String address,
        String timezone,
        String icon
) {}
