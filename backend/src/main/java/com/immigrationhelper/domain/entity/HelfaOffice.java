package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.OfficeType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "offices", indexes = {
    @Index(name = "idx_offices_city_type", columnList = "city_id, type"),
    @Index(name = "idx_offices_last_verified_at", columnList = "last_verified_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelfaOffice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OfficeType type;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String address;

    @Column(precision = 8, scale = 5)
    private BigDecimal latitude;

    @Column(precision = 8, scale = 5)
    private BigDecimal longitude;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "opening_hours")
    private String openingHoursJson;

    @Column(name = "booking_url", length = 500)
    private String bookingUrl;

    @Column(length = 64)
    private String phone;

    @Column(length = 255)
    private String email;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "languages_supported", nullable = false)
    @Builder.Default
    private List<String> languagesSupported = List.of("de");

    @Column(name = "last_verified_at", nullable = false)
    @Builder.Default
    private LocalDateTime lastVerifiedAt = LocalDateTime.now();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "what_to_bring")
    private String whatToBringJson;

    @Column(name = "current_notes", columnDefinition = "text")
    private String currentNotes;

    @Column(name = "current_notes_updated_at")
    private LocalDateTime currentNotesUpdatedAt;
}
