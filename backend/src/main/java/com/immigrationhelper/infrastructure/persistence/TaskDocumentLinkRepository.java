package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.TaskDocumentLink;
import com.immigrationhelper.domain.entity.TaskDocumentLinkId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskDocumentLinkRepository extends JpaRepository<TaskDocumentLink, TaskDocumentLinkId> {
    List<TaskDocumentLink> findByTaskId(UUID taskId);
    List<TaskDocumentLink> findByDocumentId(UUID documentId);
}
