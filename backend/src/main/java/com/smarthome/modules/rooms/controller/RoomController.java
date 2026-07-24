package com.smarthome.modules.rooms.controller;

import com.smarthome.modules.rooms.dto.RoomRequest;
import com.smarthome.modules.rooms.dto.RoomResponse;
import com.smarthome.modules.rooms.service.RoomService;
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
@RequestMapping("/homes/{homeId}/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> list(@PathVariable UUID homeId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getRooms(homeId, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> create(@PathVariable UUID homeId, @Valid @RequestBody RoomRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(roomService.createRoom(homeId, request, user)));
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> update(@PathVariable UUID homeId, @PathVariable UUID roomId, @Valid @RequestBody RoomRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.updateRoom(homeId, roomId, request, user)));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID homeId, @PathVariable UUID roomId, @AuthenticationPrincipal User user) {
        roomService.deleteRoom(homeId, roomId, user);
        return ResponseEntity.ok(ApiResponse.ok("Room deleted", null));
    }
}
