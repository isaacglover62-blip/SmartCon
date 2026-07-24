package com.smarthome.modules.rooms.service;

import com.smarthome.modules.homes.entity.Home;
import com.smarthome.modules.homes.repository.HomeRepository;
import com.smarthome.modules.rooms.dto.RoomRequest;
import com.smarthome.modules.rooms.dto.RoomResponse;
import com.smarthome.modules.rooms.entity.Room;
import com.smarthome.modules.rooms.repository.RoomRepository;
import com.smarthome.modules.users.entity.User;
import com.smarthome.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final HomeRepository homeRepository;

    public List<RoomResponse> getRooms(UUID homeId, User user) {
        verifyHomeAccess(homeId, user);
        return roomRepository.findByHomeIdOrderBySortOrderAsc(homeId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public RoomResponse createRoom(UUID homeId, RoomRequest request, User user) {
        Home home = homeRepository.findByIdAndOwnerId(homeId, user.getId())
                .orElseThrow(() -> AppException.notFound("Home not found"));

        Room room = Room.builder()
                .home(home)
                .name(request.name())
                .icon(request.icon() != null ? request.icon() : "room")
                .color(request.color() != null ? request.color() : "#6366f1")
                .floor(request.floor() != null ? request.floor() : 1)
                .build();
        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse updateRoom(UUID homeId, UUID roomId, RoomRequest request, User user) {
        verifyHomeAccess(homeId, user);
        Room room = roomRepository.findByIdAndHomeId(roomId, homeId)
                .orElseThrow(() -> AppException.notFound("Room not found"));

        if (request.name() != null) room.setName(request.name());
        if (request.icon() != null) room.setIcon(request.icon());
        if (request.color() != null) room.setColor(request.color());
        if (request.floor() != null) room.setFloor(request.floor());
        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(UUID homeId, UUID roomId, User user) {
        verifyHomeAccess(homeId, user);
        Room room = roomRepository.findByIdAndHomeId(roomId, homeId)
                .orElseThrow(() -> AppException.notFound("Room not found"));
        roomRepository.delete(room);
    }

    private void verifyHomeAccess(UUID homeId, User user) {
        if (!homeRepository.existsByIdAndOwnerId(homeId, user.getId())) {
            throw AppException.notFound("Home not found");
        }
    }

    private RoomResponse toResponse(Room r) {
        return new RoomResponse(r.getId(), r.getHome().getId(), r.getName(),
                r.getIcon(), r.getColor(), r.getFloor(), r.getSortOrder(), r.getCreatedAt());
    }
}
