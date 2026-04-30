package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.PartnerCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "partners", indexes = {
    @Index(name = "idx_partners_category_active", columnList = "category, active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 64)
    private String slug;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PartnerCategory category;

    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;

    @NotBlank
    @Column(name = "website_url", nullable = false, columnDefinition = "text")
    private String websiteUrl;

    @Column(name = "affiliate_url_template", columnDefinition = "text")
    private String affiliateUrlTemplate;

    @NotBlank
    @Column(name = "commission_disclosure", nullable = false, columnDefinition = "text")
    private String commissionDisclosure;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "supported_nationalities")
    @Builder.Default
    private List<String> supportedNationalities = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
