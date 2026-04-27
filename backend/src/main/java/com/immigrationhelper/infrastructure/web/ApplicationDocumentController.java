package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.document.ApplicationDocumentDto;
import com.immigrationhelper.application.dto.document.DocumentDownload;
import com.immigrationhelper.application.service.ApplicationDocumentService;
import com.immigrationhelper.domain.enums.DocumentType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications/{applicationId}/documents")
@RequiredArgsConstructor
@Tag(name = "Application Documents", description = "Upload and manage documents attached to a visa application")
@SecurityRequirement(name = "Bearer Authentication")
public class ApplicationDocumentController {

    private final ApplicationDocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload a document for the application")
    public ApplicationDocumentDto upload(@PathVariable UUID applicationId,
                                          @RequestParam("documentType") DocumentType documentType,
                                          @RequestParam("file") MultipartFile file,
                                          Authentication authentication) {
        return documentService.upload(applicationId, documentType, file, authentication);
    }

    @GetMapping
    @Operation(summary = "List active documents for an application")
    public List<ApplicationDocumentDto> list(@PathVariable UUID applicationId, Authentication authentication) {
        return documentService.list(applicationId, authentication);
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Download a document")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID applicationId,
                                                         @PathVariable UUID documentId,
                                                         Authentication authentication) {
        DocumentDownload download = documentService.download(documentId, authentication);
        String quoted = download.originalFilename().replace("\"", "");
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(download.contentType()))
            .contentLength(download.fileSize())
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + quoted + "\"")
            .body(new InputStreamResource(download.content()));
    }

    @DeleteMapping("/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft-delete a document")
    public void delete(@PathVariable UUID applicationId,
                       @PathVariable UUID documentId,
                       Authentication authentication) {
        documentService.delete(documentId, authentication);
    }
}
