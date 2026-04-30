package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByUserIdAndDeletedAtIsNullOrderByUploadedAtDesc(UUID userId);
    List<Document> findByUserIdAndTypeAndDeletedAtIsNull(UUID userId, String type);
    long countByUserIdAndDeletedAtIsNull(UUID userId);
}
