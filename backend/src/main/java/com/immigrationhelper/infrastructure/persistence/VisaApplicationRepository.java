package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VisaApplicationRepository extends JpaRepository<VisaApplication, UUID> {
    List<VisaApplication> findByUserId(UUID userId);
    List<VisaApplication> findByUserIdAndStatus(UUID userId, ApplicationStatus status);
}
