package com.smarthome.modules.devices.service;

import com.smarthome.modules.devices.dto.DeviceRequest;
import com.smarthome.modules.devices.dto.DeviceResponse;
import com.smarthome.modules.devices.entity.Device;
import com.smarthome.modules.devices.repository.DeviceRepository;
import com.smarthome.modules.homes.repository.HomeRepository;
import com.smarthome.modules.rooms.repository.RoomRepository;
import com.smarthome.modules.users.entity.User;
import com.smarthome.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final HomeRepository homeRepository;
    private final RoomRepository roomRepository;

    public List<DeviceResponse> getDevices(UUID homeId, User user) {
        verifyAccess(homeId, user);
        return deviceRepository.findByHomeId(homeId).stream().map(this::toResponse).toList();
    }

    public DeviceResponse getDevice(UUID homeId, UUID deviceId, User user) {
        verifyAccess(homeId, user);
        return deviceRepository.findByIdAndHomeId(deviceId, homeId)
                .map(this::toResponse)
                .orElseThrow(() -> AppException.notFound("Device not found"));
    }

    public List<DeviceResponse> getFavorites(UUID homeId, User user) {
        verifyAccess(homeId, user);
        return deviceRepository.findByHomeIdAndFavoriteTrue(homeId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public DeviceResponse createDevice(UUID homeId, DeviceRequest request, User user) {
        var home = homeRepository.findByIdAndOwnerId(homeId, user.getId())
                .orElseThrow(() -> AppException.notFound("Home not found"));

        Device.DeviceBuilder builder = Device.builder()
                .home(home)
                .name(request.name())
                .type(request.type())
                .bleDeviceId(request.bleDeviceId())
                .bleDeviceName(request.bleDeviceName())
                .icon(request.icon() != null ? request.icon() : "device_hub");

        if (request.roomId() != null) {
            var room = roomRepository.findByIdAndHomeId(request.roomId(), homeId)
                    .orElseThrow(() -> AppException.notFound("Room not found"));
            builder.room(room);
        }

        return toResponse(deviceRepository.save(builder.build()));
    }

    @Transactional
    public DeviceResponse updateDevice(UUID homeId, UUID deviceId, DeviceRequest request, User user) {
        verifyAccess(homeId, user);
        Device device = deviceRepository.findByIdAndHomeId(deviceId, homeId)
                .orElseThrow(() -> AppException.notFound("Device not found"));

        if (request.name() != null) device.setName(request.name());
        if (request.bleDeviceId() != null) device.setBleDeviceId(request.bleDeviceId());
        if (request.bleDeviceName() != null) device.setBleDeviceName(request.bleDeviceName());
        if (request.icon() != null) device.setIcon(request.icon());
        if (request.roomId() != null) {
            var room = roomRepository.findByIdAndHomeId(request.roomId(), homeId)
                    .orElseThrow(() -> AppException.notFound("Room not found"));
            device.setRoom(room);
        }

        return toResponse(deviceRepository.save(device));
    }

    @Transactional
    public DeviceResponse toggleFavorite(UUID homeId, UUID deviceId, User user) {
        verifyAccess(homeId, user);
        Device device = deviceRepository.findByIdAndHomeId(deviceId, homeId)
                .orElseThrow(() -> AppException.notFound("Device not found"));
        device.setFavorite(!device.isFavorite());
        return toResponse(deviceRepository.save(device));
    }

    @Transactional
    public DeviceResponse updateStatus(UUID homeId, UUID deviceId, boolean online, User user) {
        verifyAccess(homeId, user);
        Device device = deviceRepository.findByIdAndHomeId(deviceId, homeId)
                .orElseThrow(() -> AppException.notFound("Device not found"));
        device.setOnline(online);
        if (online) device.setLastSeenAt(Instant.now());
        return toResponse(deviceRepository.save(device));
    }

    @Transactional
    public void deleteDevice(UUID homeId, UUID deviceId, User user) {
        verifyAccess(homeId, user);
        Device device = deviceRepository.findByIdAndHomeId(deviceId, homeId)
                .orElseThrow(() -> AppException.notFound("Device not found"));
        deviceRepository.delete(device);
    }

    private void verifyAccess(UUID homeId, User user) {
        if (!homeRepository.existsByIdAndOwnerId(homeId, user.getId()))
            throw AppException.notFound("Home not found");
    }

    private DeviceResponse toResponse(Device d) {
        return new DeviceResponse(d.getId(), d.getHome().getId(),
                d.getRoom() != null ? d.getRoom().getId() : null,
                d.getName(), d.getType(), d.getBleDeviceId(), d.getBleDeviceName(),
                d.getIcon(), d.isOnline(), d.isFavorite(), d.getFirmwareVersion(),
                d.getBatteryLevel(), d.getLastSeenAt(), d.getCreatedAt());
    }
}
