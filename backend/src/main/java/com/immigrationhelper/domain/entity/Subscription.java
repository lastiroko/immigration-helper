package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.SubscriptionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @NotBlank
    @Column(name = "stripe_customer_id", unique = true, nullable = false, columnDefinition = "text")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id", unique = true, columnDefinition = "text")
    private String stripeSubscriptionId;

    @NotBlank
    @Column(nullable = false, length = 32)
    private String tier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SubscriptionStatus status;

    @Column(name = "current_period_start")
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "renews_at")
    private LocalDateTime renewsAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
