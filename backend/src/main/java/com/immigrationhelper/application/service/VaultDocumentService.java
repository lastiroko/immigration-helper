package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.document.DocumentDownload;
import com.immigrationhelper.application.dto.document.PatchVaultDocumentRequest;
import com.immigrationhelper.application.dto.document.VaultDocumentDto;
import com.immigrationhelper.application.dto.document.VaultDocumentListResponse;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.application.exception.ValidationException;
import com.immigrationhelper.domain.entity.Document;
import com.immigrationhelper.infrastructure.persistence.DocumentRepository;
import com.immigrationhelper.infrastructure.scanner.ScanResult;
import com.immigrationhelper.infrastructure.scanner.VirusScannerService;
import com.immigrationhelper.infrastructure.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaultDocumentService {

    private static final long QUOTA_FREE_BYTES = 10L * 1024 * 1024;        // 10 MB
    private static final long QUOTA_PREMIUM_BYTES = 1024L * 1024 * 1024;   // 1 GB

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final VirusScannerService virusScannerService;
    private final ResourceOwnershipGuard ownershipGuard;

    @Transactional(readOnly = true)
    public VaultDocumentListResponse list(UUID userId, String typeFilter) {
        List<Document> docs = typeFilter == null
            ? documentRepository.findByUserIdAndDeletedAtIsNullOrderByUploadedAtDesc(userId)
            : documentRepository.findByUserIdAndTypeAndDeletedAtIsNull(userId, typeFilter);
        long used = docs.stream().mapToLong(Document::getSizeBytes).sum();
        return new VaultDocumentListResponse(
            docs.stream().map(VaultDocumentService::toDto).toList(),
            used,
            QUOTA_FREE_BYTES
        );
    }

    @Transactional(readOnly = true)
    public VaultDocumentDto get(UUID userId, UUID documentId) {
        return toDto(loadAndAuthorize(userId, documentId));
    }

    @Transactional
    public VaultDocumentDto upload(UUID userId, String type, String title, MultipartFile file) {
        validateFile(file);
        runVirusScan(file);

        long usedBytes = documentRepository.findByUserIdAndDeletedAtIsNullOrderByUploadedAtDesc(userId)
            .stream().mapToLong(Document::getSizeBytes).sum();
        if (usedBytes + file.getSize() > QUOTA_FREE_BYTES) {
            throw new ValidationException("Vault quota exceeded (10 MB on the free tier)");
        }

        String storedFilename = UUID.randomUUID() + extensionFor(file.getContentType());
        String storageKey = "vault/" + userId + "/" + storedFilename;
        try (InputStream in = file.getInputStream()) {
            fileStorageService.store(in, storageKey, file.getContentType());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read uploaded file", e);
        }

        Document doc = Document.builder()
            .userId(userId)
            .type(type == null ? "OTHER" : type)
            .title(title == null || title.isBlank() ? safeOriginalFilename(file) : title)
            .storageRef(storageKey)
            .sizeBytes(file.getSize())
            .mimeType(file.getContentType())
            .build();
        doc = documentRepository.save(doc);
        log.info("Vault upload: doc {} ({}) for user {}", doc.getId(), doc.getType(), userId);
        return toDto(doc);
    }

    @Transactional
    public VaultDocumentDto patch(UUID userId, UUID documentId, PatchVaultDocumentRequest req) {
        Document doc = loadAndAuthorize(userId, documentId);
        if (req.title() != null) doc.setTitle(req.title());
        if (req.type() != null) doc.setType(req.type());
        if (req.apostilleStatus() != null) doc.setApostilleStatus(req.apostilleStatus());
        if (req.translationStatus() != null) doc.setTranslationStatus(req.translationStatus());
        if (req.expiryDate() != null) doc.setExpiryDate(req.expiryDate());
        if (req.isOriginal() != null) doc.setOriginal(req.isOriginal());
        return toDto(documentRepository.save(doc));
    }

    @Transactional
    public void softDelete(UUID userId, UUID documentId) {
        Document doc = loadAndAuthorize(userId, documentId);
        if (doc.getDeletedAt() != null) return;
        doc.setDeletedAt(LocalDateTime.now());
        documentRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public DocumentDownload download(UUID userId, UUID documentId) {
        Document doc = loadAndAuthorize(userId, documentId);
        InputStream content = fileStorageService.retrieve(doc.getStorageRef());
        return new DocumentDownload(content, doc.getTitle(), doc.getMimeType(), doc.getSizeBytes());
    }

    Document loadAndAuthorize(UUID userId, UUID documentId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        if (doc.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Document not found: " + documentId);
        }
        ownershipGuard.verifyOwnership(doc.getUserId(), userId);
        return doc;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Uploaded file is empty");
        }
        if (file.getSize() > DocumentConstraints.MAX_FILE_SIZE_BYTES) {
            throw new ValidationException("File exceeds 10MB limit");
        }
        String ct = file.getContentType();
        if (ct == null || !DocumentConstraints.ALLOWED_CONTENT_TYPES.contains(ct)) {
            throw new ValidationException("File type not allowed: " + ct);
        }
    }

    private void runVirusScan(MultipartFile file) {
        ScanResult result;
        try (InputStream in = file.getInputStream()) {
            result = virusScannerService.scan(in);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read uploaded file for virus scan", e);
        }
        if (!result.clean()) {
            throw new ValidationException("File rejected by virus scan: " + result.detail());
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType == null ? "" : contentType) {
            case "application/pdf" -> ".pdf";
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> ".docx";
            default -> "";
        };
    }

    private String safeOriginalFilename(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) return "upload";
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        return slash >= 0 ? name.substring(slash + 1) : name;
    }

    static VaultDocumentDto toDto(Document d) {
        return new VaultDocumentDto(
            d.getId(), d.getType(), d.getTitle(), d.getSizeBytes(), d.getMimeType(),
            d.getApostilleStatus(), d.getTranslationStatus(), d.getExpiryDate(),
            d.isOriginal(), d.getUploadedAt());
    }
}
