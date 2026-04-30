package com.immigrationhelper.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "partner_referrals", indexes = {
    @Index(name = "idx_partner_referrals_user_partner", columnList = "user_id, partner_id, product_code"),
    @Index(name = "idx_partner_referrals_converted", columnList = "converted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerReferral {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "partner_id", nullable = false, columnDefinition = "uuid")
    private UUID partnerId;

    @Column(name = "product_code", length = 64)
    private String productCode;

    @NotBlank
    @Column(name = "click_id", unique = true, nullable = false, length = 64)
    private String clickId;

    @Column(name = "clicked_at", nullable = false)
    @Builder.Default
    private LocalDateTime clickedAt = LocalDateTime.now();

    @Column(name = "converted_at")
    private LocalDateTime convertedAt;

    @Column(precision = 10, scale = 2)
    private BigDecimal commission;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "webhook_payload")
    private String webhookPayload;
}
