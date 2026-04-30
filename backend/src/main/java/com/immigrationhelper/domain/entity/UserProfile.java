package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.FamilyStatus;
import com.immigrationhelper.domain.enums.VisaPathway;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles", indexes = {
    @Index(name = "idx_user_profiles_city_visa", columnList = "city_id, visa_pathway")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", length = 255)
    private String firstName;

    @Column(length = 2)
    private String nationality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Enumerated(EnumType.STRING)
    @Column(name = "visa_pathway", length = 32)
    private VisaPathway visaPathway;

    @Enumerated(EnumType.STRING)
    @Column(name = "family_status", length = 16)
    private FamilyStatus familyStatus;

    @Column(name = "family_in_germany", nullable = false)
    @Builder.Default
    private boolean familyInGermany = false;

    @Column(name = "arrival_date")
    private LocalDate arrivalDate;

    @Column(name = "anmeldung_date")
    private LocalDate anmeldungDate;

    @Column(name = "permit_expiry_date")
    private LocalDate permitExpiryDate;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
