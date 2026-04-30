package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.DigestMode;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSetting {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private boolean pushEnabled = true;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "digest_mode", nullable = false, length = 16)
    @Builder.Default
    private DigestMode digestMode = DigestMode.IMMEDIATE;

    @Column(name = "digest_day", length = 3)
    private String digestDay;

    @Column(name = "digest_time", nullable = false)
    @Builder.Default
    private LocalTime digestTime = LocalTime.of(9, 0);

    @Column(name = "quiet_hours_start", nullable = false)
    @Builder.Default
    private LocalTime quietHoursStart = LocalTime.of(22, 0);

    @Column(name = "quiet_hours_end", nullable = false)
    @Builder.Default
    private LocalTime quietHoursEnd = LocalTime.of(8, 0);
}
