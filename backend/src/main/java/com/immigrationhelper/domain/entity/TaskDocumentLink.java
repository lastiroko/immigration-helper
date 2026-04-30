package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.TaskDocumentRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_document_links", indexes = {
    @Index(name = "idx_task_document_links_doc", columnList = "document_id")
})
@IdClass(TaskDocumentLinkId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDocumentLink {

    @Id
    @Column(name = "task_id", nullable = false, columnDefinition = "uuid")
    private UUID taskId;

    @Id
    @Column(name = "document_id", nullable = false, columnDefinition = "uuid")
    private UUID documentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private TaskDocumentRole role = TaskDocumentRole.REQUIRED;

    @Column(nullable = false)
    @Builder.Default
    private boolean satisfied = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
