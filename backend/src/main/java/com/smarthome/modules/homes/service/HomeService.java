package com.smarthome.modules.homes.service;

import com.smarthome.modules.homes.dto.HomeRequest;
import com.smarthome.modules.homes.dto.HomeResponse;
import com.smarthome.modules.homes.entity.Home;
import com.smarthome.modules.homes.repository.HomeRepository;
import com.smarthome.modules.users.entity.User;
import com.smarthome.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final HomeRepository homeRepository;

    public List<HomeResponse> getHomes(User user) {
        return homeRepository.findByOwnerId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public HomeResponse getHome(UUID id, User user) {
        return homeRepository.findByIdAndOwnerId(id, user.getId())
                .map(this::toResponse)
                .orElseThrow(() -> AppException.notFound("Home not found"));
    }

    @Transactional
    public HomeResponse createHome(HomeRequest request, User user) {
        Home home = Home.builder()
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .timezone(request.timezone() != null ? request.timezone() : "UTC")
                .icon(request.icon() != null ? request.icon() : "home")
                .owner(user)
                .build();
        return toResponse(homeRepository.save(home));
    }

    @Transactional
    public HomeResponse updateHome(UUID id, HomeRequest request, User user) {
        Home home = homeRepository.findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() -> AppException.notFound("Home not found"));
        if (request.name() != null) home.setName(request.name());
        if (request.description() != null) home.setDescription(request.description());
        if (request.address() != null) home.setAddress(request.address());
        if (request.timezone() != null) home.setTimezone(request.timezone());
        if (request.icon() != null) home.setIcon(request.icon());
        return toResponse(homeRepository.save(home));
    }

    @Transactional
    public void deleteHome(UUID id, User user) {
        Home home = homeRepository.findByIdAndOwnerId(id, user.getId())
                .orElseThrow(() -> AppException.notFound("Home not found"));
        homeRepository.delete(home);
    }

    private HomeResponse toResponse(Home h) {
        return new HomeResponse(h.getId(), h.getName(), h.getDescription(),
                h.getAddress(), h.getTimezone(), h.getIcon(),
                h.getOwner().getId(), h.getCreatedAt(), h.getUpdatedAt());
    }
}
