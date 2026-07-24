package com.smarthome.modules.devices.controller;

import com.smarthome.modules.devices.dto.DeviceRequest;
import com.smarthome.modules.devices.dto.DeviceResponse;
import com.smarthome.modules.devices.service.DeviceService;
import com.smarthome.modules.users.entity.User;
import com.smarthome.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/homes/{homeId}/devices")
@RequiredArgsConstructor
@Tag(name = "Devices")
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> list(@PathVariable UUID homeId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.getDevices(homeId, user)));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> favorites(@PathVariable UUID homeId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.getFavorites(homeId, user)));
    }

    @GetMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<DeviceResponse>> get(@PathVariable UUID homeId, @PathVariable UUID deviceId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.getDevice(homeId, deviceId, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DeviceResponse>> create(@PathVariable UUID homeId, @Valid @RequestBody DeviceRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(deviceService.createDevice(homeId, request, user)));
    }

    @PutMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<DeviceResponse>> update(@PathVariable UUID homeId, @PathVariable UUID deviceId, @Valid @RequestBody DeviceRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.updateDevice(homeId, deviceId, request, user)));
    }

    @PostMapping("/{deviceId}/favorite")
    public ResponseEntity<ApiResponse<DeviceResponse>> toggleFavorite(@PathVariable UUID homeId, @PathVariable UUID deviceId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.toggleFavorite(homeId, deviceId, user)));
    }

    @PatchMapping("/{deviceId}/status")
    public ResponseEntity<ApiResponse<DeviceResponse>> updateStatus(@PathVariable UUID homeId, @PathVariable UUID deviceId, @RequestParam boolean online, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(deviceService.updateStatus(homeId, deviceId, online, user)));
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID homeId, @PathVariable UUID deviceId, @AuthenticationPrincipal User user) {
        deviceService.deleteDevice(homeId, deviceId, user);
        return ResponseEntity.ok(ApiResponse.ok("Device deleted", null));
    }
}
