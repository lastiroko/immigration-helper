package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.PrivacyExport;
import com.immigrationhelper.domain.enums.PrivacyExportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrivacyExportRepository extends JpaRepository<PrivacyExport, UUID> {
    List<PrivacyExport> findByStatus(PrivacyExportStatus status);
    List<PrivacyExport> findByUserIdOrderByRequestedAtDesc(UUID userId);
}
