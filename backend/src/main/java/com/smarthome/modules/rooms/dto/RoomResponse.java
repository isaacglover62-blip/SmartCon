package com.smarthome.modules.rooms.dto;

import java.time.Instant;
import java.util.UUID;

public record RoomResponse(UUID id, UUID homeId, String name, String icon, String color, int floor, int sortOrder, Instant createdAt) {}
