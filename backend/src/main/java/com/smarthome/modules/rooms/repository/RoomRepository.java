package com.smarthome.modules.rooms.repository;

import com.smarthome.modules.rooms.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findByHomeIdOrderBySortOrderAsc(UUID homeId);
    Optional<Room> findByIdAndHomeId(UUID id, UUID homeId);
    boolean existsByIdAndHomeId(UUID id, UUID homeId);
}
