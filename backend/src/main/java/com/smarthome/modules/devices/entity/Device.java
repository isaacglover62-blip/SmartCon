package com.smarthome.modules.devices.entity;

import com.smarthome.modules.homes.entity.Home;
import com.smarthome.modules.rooms.entity.Room;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "devices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Device {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_id", nullable = false)
    private Home home;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(name = "ble_device_id")
    private String bleDeviceId;

    @Column(name = "ble_device_name")
    private String bleDeviceName;

    @Column(nullable = false) @Builder.Default
    private String icon = "device_hub";

    @Column(name = "is_online", nullable = false) @Builder.Default
    private boolean online = false;

    @Column(name = "is_favorite", nullable = false) @Builder.Default
    private boolean favorite = false;

    @Column(name = "firmware_version")
    private String firmwareVersion;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "created_at", nullable = false, updatable = false) @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false) @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = Instant.now(); }
}
