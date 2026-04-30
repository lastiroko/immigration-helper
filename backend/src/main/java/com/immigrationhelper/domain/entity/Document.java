package com.immigrationhelper.domain.entity;

import com.immigrationhelper.domain.enums.ApostilleStatus;
import com.immigrationhelper.domain.enums.TranslationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_documents_user_deleted", columnList = "user_id, deleted_at"),
    @Index(name = "idx_documents_user_type", columnList = "user_id, type"),
    @Index(name = "idx_documents_expiry", columnList = "expiry_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @NotBlank
    @Column(nullable = false, length = 64)
    private String type;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String title;

    @NotBlank
    @Column(name = "storage_ref", nullable = false, columnDefinition = "text")
    private String storageRef;

    @Column(name = "encrypted_key")
    private byte[] encryptedKey;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @NotBlank
    @Column(name = "mime_type", nullable = false, length = 64)
    private String mimeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "apostille_status", nullable = false, length = 16)
    @Builder.Default
    private ApostilleStatus apostilleStatus = ApostilleStatus.NONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "translation_status", nullable = false, length = 16)
    @Builder.Default
    private TranslationStatus translationStatus = TranslationStatus.NONE;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "is_original", nullable = false)
    @Builder.Default
    private boolean isOriginal = false;

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
