package com.smarthome.modules.devices.repository;

import com.smarthome.modules.devices.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findByHomeId(UUID homeId);
    List<Device> findByRoomId(UUID roomId);
    List<Device> findByHomeIdAndFavoriteTrue(UUID homeId);
    Optional<Device> findByIdAndHomeId(UUID id, UUID homeId);
    boolean existsByIdAndHomeId(UUID id, UUID homeId);
    long countByHomeId(UUID homeId);
    long countByHomeIdAndOnlineTrue(UUID homeId);
}
