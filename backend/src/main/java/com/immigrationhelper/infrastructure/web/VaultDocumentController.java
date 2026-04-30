package com.immigrationhelper.infrastructure.web;

import com.immigrationhelper.application.dto.document.DocumentDownload;
import com.immigrationhelper.application.dto.document.PatchVaultDocumentRequest;
import com.immigrationhelper.application.dto.document.VaultDocumentDto;
import com.immigrationhelper.application.dto.document.VaultDocumentListResponse;
import com.immigrationhelper.application.service.GuidanceFeatureGuard;
import com.immigrationhelper.application.service.VaultDocumentService;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Vault documents", description = "User-owned document vault")
@SecurityRequirement(name = "Bearer Authentication")
public class VaultDocumentController {

    private final VaultDocumentService service;
    private final GuidanceFeatureGuard guard;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "List vault documents (active only)")
    public VaultDocumentListResponse list(@RequestParam(required = false) String type,
                                          Authentication authentication) {
        guard.requireEnabled();
        return service.list(currentUserId(authentication), type);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload a document into the vault")
    public VaultDocumentDto upload(@RequestParam(required = false) String type,
                                   @RequestParam(required = false) String title,
                                   @RequestParam("file") MultipartFile file,
                                   Authentication authentication) {
        guard.requireEnabled();
        return service.upload(currentUserId(authentication), type, title, file);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vault document metadata")
    public VaultDocumentDto get(@PathVariable UUID id, Authentication authentication) {
        guard.requireEnabled();
        return service.get(currentUserId(authentication), id);
    }

    @GetMapping("/{id}/content")
    @Operation(summary = "Stream vault document bytes")
    public ResponseEntity<InputStreamResource> content(@PathVariable UUID id, Authentication authentication) {
        guard.requireEnabled();
        DocumentDownload dl = service.download(currentUserId(authentication), id);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(dl.contentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + dl.originalFilename() + "\"")
            .contentLength(dl.fileSize())
            .body(new InputStreamResource(dl.content()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update vault document metadata")
    public VaultDocumentDto patch(@PathVariable UUID id,
                                  @Valid @RequestBody PatchVaultDocumentRequest request,
                                  Authentication authentication) {
        guard.requireEnabled();
        return service.patch(currentUserId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft-delete a vault document (90-day restore window)")
    public void delete(@PathVariable UUID id, Authentication authentication) {
        guard.requireEnabled();
        service.softDelete(currentUserId(authentication), id);
    }

    private UUID currentUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .map(u -> u.getId())
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + authentication.getName()));
    }
}
