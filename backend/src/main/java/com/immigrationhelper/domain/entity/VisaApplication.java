package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.ApplicationStatus;
import com.immigrationhelper.domain.enums.VisaType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "visa_applications", indexes = {
    @Index(name = "idx_applications_user_id", columnList = "user_id"),
    @Index(name = "idx_applications_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisaApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private ImmigrationOffice office;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VisaType visaType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column
    private List<Map<String, Object>> documents;

    @Column(length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
