package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.OfficeType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "task_templates", indexes = {
    @Index(name = "idx_task_templates_phase", columnList = "phase")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(unique = true, nullable = false, length = 64)
    private String code;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "applicable_to", nullable = false)
    private String applicableTo;

    @Column(name = "default_lead_days")
    private Integer defaultLeadDays;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "depends_on", nullable = false)
    @Builder.Default
    private List<String> dependsOn = new ArrayList<>();

    @NotBlank
    @Column(nullable = false, length = 8)
    private String phase;

    @Column(nullable = false)
    @Builder.Default
    private int priority = 50;

    @Enumerated(EnumType.STRING)
    @Column(name = "associated_office_type", length = 32)
    private OfficeType associatedOfficeType;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "associated_document_types", nullable = false)
    @Builder.Default
    private List<String> associatedDocumentTypes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
