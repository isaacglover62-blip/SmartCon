package com.smarthome.modules.rooms.entity;

import com.smarthome.modules.homes.entity.Home;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_id", nullable = false)
    private Home home;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false) @Builder.Default
    private String icon = "room";

    @Column(nullable = false) @Builder.Default
    private String color = "#6366f1";

    @Column(nullable = false) @Builder.Default
    private int floor = 1;

    @Column(name = "sort_order", nullable = false) @Builder.Default
    private int sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false) @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false) @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = Instant.now(); }
}
