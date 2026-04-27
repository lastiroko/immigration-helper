package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "application_documents", indexes = {
    @Index(name = "idx_app_docs_application_id", columnList = "application_id"),
    @Index(name = "idx_app_docs_app_and_type", columnList = "application_id, document_type"),
    @Index(name = "idx_app_docs_deleted_at", columnList = "deleted_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, updatable = false)
    private VisaApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50, updatable = false)
    private DocumentType documentType;

    @Column(name = "original_filename", nullable = false, length = 500, updatable = false)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false, length = 255, updatable = false)
    private String storedFilename;

    @Column(name = "content_type", nullable = false, length = 255, updatable = false)
    private String contentType;

    @Column(name = "file_size", nullable = false, updatable = false)
    private Long fileSize;

    @Column(name = "storage_key", nullable = false, length = 1000, updatable = false)
    private String storageKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false, updatable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
