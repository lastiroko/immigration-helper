package com.immigrationhelper.application.service;

import com.immigrationhelper.application.dto.task.AttachDocumentRequest;
import com.immigrationhelper.application.dto.task.TaskDocumentLinkDto;
import com.immigrationhelper.application.exception.ResourceNotFoundException;
import com.immigrationhelper.domain.entity.Document;
import com.immigrationhelper.domain.entity.Task;
import com.immigrationhelper.domain.entity.TaskDocumentLink;
import com.immigrationhelper.domain.entity.TaskDocumentLinkId;
import com.immigrationhelper.domain.entity.TaskTemplate;
import com.immigrationhelper.domain.enums.TaskDocumentRole;
import com.immigrationhelper.infrastructure.persistence.DocumentRepository;
import com.immigrationhelper.infrastructure.persistence.TaskDocumentLinkRepository;
import com.immigrationhelper.infrastructure.persistence.TaskRepository;
import com.immigrationhelper.infrastructure.persistence.TaskTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskDocumentService {

    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final TaskDocumentLinkRepository linkRepository;
    private final TaskTemplateRepository templateRepository;
    private final ResourceOwnershipGuard ownershipGuard;

    @Transactional
    public TaskDocumentLinkDto attach(UUID userId, UUID taskId, AttachDocumentRequest req) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        ownershipGuard.verifyOwnership(task.getUserId(), userId);

        Document doc = documentRepository.findById(req.documentId())
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + req.documentId()));
        if (doc.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Document not found: " + req.documentId());
        }
        ownershipGuard.verifyOwnership(doc.getUserId(), userId);

        TaskDocumentLinkId pk = new TaskDocumentLinkId(taskId, doc.getId());
        TaskDocumentLink link = linkRepository.findById(pk).orElseGet(() -> TaskDocumentLink.builder()
            .taskId(taskId)
            .documentId(doc.getId())
            .role(req.role() == null ? TaskDocumentRole.REQUIRED : req.role())
            .build());

        // Mark satisfied if the document's type matches one slot the template advertises.
        TaskTemplate template = templateRepository.findById(task.getTemplateId()).orElse(null);
        boolean typeMatches = template != null
            && template.getAssociatedDocumentTypes().stream()
                .anyMatch(t -> t.equalsIgnoreCase(doc.getType()));
        link.setSatisfied(typeMatches);

        link = linkRepository.save(link);
        return new TaskDocumentLinkDto(link.getTaskId(), link.getDocumentId(), link.getRole(), link.isSatisfied());
    }
}
