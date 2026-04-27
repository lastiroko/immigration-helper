package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.document.ApplicationDocumentDto;
import com.immigrationhelper.application.dto.document.DocumentDownload;
import com.immigrationhelper.application.mapper.ApplicationDocumentMapper;
import com.immigrationhelper.domain.entity.ApplicationDocument;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.DocumentType;
import com.immigrationhelper.infrastructure.persistence.ApplicationDocumentRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.persistence.VisaApplicationRepository;
import com.immigrationhelper.infrastructure.scanner.ScanResult;
import com.immigrationhelper.infrastructure.scanner.VirusScannerService;
import com.immigrationhelper.infrastructure.storage.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationDocumentService {

    private final ApplicationDocumentRepository documentRepository;
    private final VisaApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final VirusScannerService virusScannerService;
    private final ApplicationDocumentMapper documentMapper;
    private final ApplicationAccessGuard accessGuard;

    @Transactional
    public ApplicationDocumentDto upload(UUID applicationId, DocumentType documentType,
                                          MultipartFile file, Authentication authentication) {
        VisaApplication application = loadAndAuthorize(applicationId, authentication);

        validateFile(file);
        validateCount(applicationId);
        runVirusScan(file);

        // Replace semantics: soft-delete any existing active document(s) of the same type
        List<ApplicationDocument> existing =
            documentRepository.findByApplicationIdAndDocumentTypeAndDeletedAtIsNull(applicationId, documentType);
        Instant now = Instant.now();
        existing.forEach(prev -> {
            prev.setDeletedAt(now);
            documentRepository.save(prev);
            // TODO: schedule the prior storage object for cleanup once a retention job exists
        });

        User uploader = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        String storedFilename = UUID.randomUUID() + extensionFor(file.getContentType());
        String storageKey = "applications/" + applicationId + "/" + storedFilename;

        try (InputStream in = file.getInputStream()) {
            fileStorageService.store(in, storageKey, file.getContentType());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read uploaded file", e);
        }

        ApplicationDocument doc = ApplicationDocument.builder()
            .application(application)
            .documentType(documentType)
            .originalFilename(safeOriginalFilename(file))
            .storedFilename(storedFilename)
            .contentType(file.getContentType())
            .fileSize(file.getSize())
            .storageKey(storageKey)
            .uploadedBy(uploader)
            .build();
        doc = documentRepository.save(doc);

        log.info("Uploaded document {} ({}) for application {} by {}",
            doc.getId(), documentType, applicationId, uploader.getEmail());
        return documentMapper.toDto(doc);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDocumentDto> list(UUID applicationId, Authentication authentication) {
        loadAndAuthorize(applicationId, authentication);
        return documentRepository
            .findByApplicationIdAndDeletedAtIsNullOrderByUploadedAtDesc(applicationId)
            .stream()
            .map(documentMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDownload download(UUID documentId, Authentication authentication) {
        ApplicationDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));
        if (doc.getDeletedAt() != null) {
            throw new EntityNotFoundException("Document not found: " + documentId);
        }
        accessGuard.verifyOwnerOrAdmin(doc.getApplication(), authentication);

        InputStream content = fileStorageService.retrieve(doc.getStorageKey());
        return new DocumentDownload(content, doc.getOriginalFilename(), doc.getContentType(), doc.getFileSize());
    }

    @Transactional
    public void delete(UUID documentId, Authentication authentication) {
        ApplicationDocument doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new EntityNotFoundException("Document not found: " + documentId));
        if (doc.getDeletedAt() != null) return;

        accessGuard.verifyOwnerOrAdmin(doc.getApplication(), authentication);

        doc.setDeletedAt(Instant.now());
        documentRepository.save(doc);
        log.info("Soft-deleted document {} for application {}", documentId, doc.getApplication().getId());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private VisaApplication loadAndAuthorize(UUID applicationId, Authentication authentication) {
        VisaApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new EntityNotFoundException("Application not found: " + applicationId));
        accessGuard.verifyOwnerOrAdmin(application, authentication);
        return application;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > DocumentConstraints.MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds 10MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !DocumentConstraints.ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }
    }

    private void validateCount(UUID applicationId) {
        long active = documentRepository.countByApplicationIdAndDeletedAtIsNull(applicationId);
        if (active >= DocumentConstraints.MAX_DOCUMENTS_PER_APPLICATION) {
            throw new IllegalArgumentException("Maximum 20 documents per application");
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
            throw new IllegalArgumentException("File rejected by virus scan: " + result.detail());
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType == null ? "" : contentType) {
            case "application/pdf" -> ".pdf";
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> ".docx";
            default -> "";
        };
    }

    private String safeOriginalFilename(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) return "upload";
        // Strip any path components so the original_filename column is just the leaf name
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        return slash >= 0 ? name.substring(slash + 1) : name;
    }
}
