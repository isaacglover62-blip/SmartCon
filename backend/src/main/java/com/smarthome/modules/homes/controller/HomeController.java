package com.smarthome.modules.homes.controller;

import com.smarthome.modules.homes.dto.HomeRequest;
import com.smarthome.modules.homes.dto.HomeResponse;
import com.smarthome.modules.homes.service.HomeService;
import com.smarthome.modules.users.entity.User;
import com.smarthome.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/homes")
@RequiredArgsConstructor
@Tag(name = "Homes")
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    @Operation(summary = "List all homes for authenticated user")
    public ResponseEntity<ApiResponse<List<HomeResponse>>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(homeService.getHomes(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HomeResponse>> get(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(homeService.getHome(id, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HomeResponse>> create(@Valid @RequestBody HomeRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(homeService.createHome(request, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HomeResponse>> update(@PathVariable UUID id, @Valid @RequestBody HomeRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(homeService.updateHome(id, request, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        homeService.deleteHome(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Home deleted", null));
    }
}
