package com.smarthome.modules.homes.repository;

import com.smarthome.modules.homes.entity.Home;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeRepository extends JpaRepository<Home, UUID> {
    List<Home> findByOwnerId(UUID ownerId);
    Optional<Home> findByIdAndOwnerId(UUID id, UUID ownerId);
    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);
}
