package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.ApplicationDocument;
import com.immigrationhelper.domain.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, UUID> {

    List<ApplicationDocument> findByApplicationIdAndDeletedAtIsNullOrderByUploadedAtDesc(UUID applicationId);

    long countByApplicationIdAndDeletedAtIsNull(UUID applicationId);

    List<ApplicationDocument> findByApplicationIdAndDocumentTypeAndDeletedAtIsNull(
        UUID applicationId, DocumentType documentType);
}
