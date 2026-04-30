package com.immigrationhelper.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 64)
    private String slug;

    @NotBlank
    @Column(nullable = false, length = 128)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 64)
    private String bundesland;

    private Integer population;

    @NotBlank
    @Column(name = "supported_from_phase", nullable = false, length = 8)
    private String supportedFromPhase;

    @Column(name = "hero_image_url", length = 500)
    private String heroImageUrl;

    @Column(precision = 8, scale = 5)
    private BigDecimal latitude;

    @Column(precision = 8, scale = 5)
    private BigDecimal longitude;
}
