package com.immigrationhelper.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "immigration_offices", indexes = {
    @Index(name = "idx_offices_city", columnList = "city"),
    @Index(name = "idx_offices_location", columnList = "latitude, longitude")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImmigrationOffice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 10)
    private String postalCode;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(length = 500)
    private String appointmentUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
