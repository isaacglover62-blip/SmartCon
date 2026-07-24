package com.smarthome.modules.homes.entity;

import com.smarthome.modules.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "homes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Home {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;
    private String address;

    @Column(nullable = false)
    @Builder.Default
    private String timezone = "UTC";

    @Column(nullable = false)
    @Builder.Default
    private String icon = "home";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() { this.updatedAt = Instant.now(); }
}
