package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.TaskStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_user_status_due", columnList = "user_id, status, due_at"),
    @Index(name = "idx_tasks_journey", columnList = "journey_id"),
    @Index(name = "idx_tasks_template", columnList = "template_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "journey_id", nullable = false, columnDefinition = "uuid")
    private UUID journeyId;

    @Column(name = "template_id", nullable = false, columnDefinition = "uuid")
    private UUID templateId;

    @NotBlank
    @Column(name = "template_code", nullable = false, length = 64)
    private String templateCode;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private TaskStatus status = TaskStatus.UPCOMING;

    @Column(nullable = false)
    @Builder.Default
    private int priority = 50;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "postponed_until")
    private LocalDate postponedUntil;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
