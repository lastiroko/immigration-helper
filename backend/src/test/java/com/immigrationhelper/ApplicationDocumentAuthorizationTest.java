package com.immigrationhelper;

import com.immigrationhelper.domain.entity.ApplicationDocument;
import com.immigrationhelper.domain.entity.User;
import com.immigrationhelper.domain.entity.VisaApplication;
import com.immigrationhelper.domain.enums.ApplicationStatus;
import com.immigrationhelper.domain.enums.DocumentType;
import com.immigrationhelper.domain.enums.SubscriptionTier;
import com.immigrationhelper.domain.enums.VisaType;
import com.immigrationhelper.infrastructure.persistence.ApplicationDocumentRepository;
import com.immigrationhelper.infrastructure.persistence.UserRepository;
import com.immigrationhelper.infrastructure.persistence.VisaApplicationRepository;
import com.immigrationhelper.infrastructure.scanner.ScanResult;
import com.immigrationhelper.infrastructure.scanner.VirusScannerService;
import com.immigrationhelper.infrastructure.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApplicationDocumentAuthorizationTest {

    @TempDir
    static Path tempStorageDir;

    @DynamicPropertySource
    static void overrideStoragePath(DynamicPropertyRegistry registry) {
        registry.add("app.storage.local.base-path", () -> tempStorageDir.toAbsolutePath().toString());
    }

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired VisaApplicationRepository applicationRepository;
    @Autowired ApplicationDocumentRepository documentRepository;
    @Autowired FileStorageService fileStorageService;

    @MockBean VirusScannerService virusScannerService;

    private User userA;
    private User userB;
    private User adminUser;
    private VisaApplication appOfUserA;

    private static final byte[] PDF_BYTES = "%PDF-1.4 dummy content".getBytes();
    private static final String PDF = "application/pdf";

    @BeforeEach
    void setUp() {
        when(virusScannerService.scan(any())).thenReturn(new ScanResult(true, "ok"));

        userA = userRepository.save(User.builder()
            .email("usera-doc@test.com").name("User A")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());
        userB = userRepository.save(User.builder()
            .email("userb-doc@test.com").name("User B")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());
        adminUser = userRepository.save(User.builder()
            .email("admin@test.com").name("Admin")
            .passwordHash("$2a$12$irrelevant").subscriptionTier(SubscriptionTier.FREE).build());

        appOfUserA = applicationRepository.save(VisaApplication.builder()
            .user(userA).visaType(VisaType.STUDENT).status(ApplicationStatus.DRAFT).build());
    }

    private MockMultipartFile pdfFile(String filename, byte[] bytes) {
        return new MockMultipartFile("file", filename, PDF, bytes);
    }

    // ── Authorization ─────────────────────────────────────────────────────────

    @Test
    void upload_byNonOwner_returns403() throws Exception {
        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("p.pdf", PDF_BYTES))
                .param("documentType", "PASSPORT")
                .with(user(userB.getEmail()).roles("FREE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void upload_byOwner_returns201() throws Exception {
        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("p.pdf", PDF_BYTES))
                .param("documentType", "PASSPORT")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.documentType").value("PASSPORT"))
            .andExpect(jsonPath("$.originalFilename").value("p.pdf"))
            .andExpect(jsonPath("$.uploadedByEmail").value(userA.getEmail()));
    }

    @Test
    void upload_byAdmin_returns201() throws Exception {
        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("p.pdf", PDF_BYTES))
                .param("documentType", "PASSPORT")
                .with(user(adminUser.getEmail()).roles("ADMIN")))
            .andExpect(status().isCreated());
    }

    @Test
    void list_byNonOwner_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .with(user(userB.getEmail()).roles("FREE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void list_byAdmin_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .with(user(adminUser.getEmail()).roles("ADMIN")))
            .andExpect(status().isOk());
    }

    @Test
    void download_byNonOwner_returns403() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId() + "/download")
                .with(user(userB.getEmail()).roles("FREE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void download_byOwner_returns200WithFile() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId() + "/download")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("p.pdf")))
            .andExpect(content().contentType(PDF));
    }

    @Test
    void download_byAdmin_returns200() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId() + "/download")
                .with(user(adminUser.getEmail()).roles("ADMIN")))
            .andExpect(status().isOk());
    }

    @Test
    void delete_byNonOwner_returns403() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(delete("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId())
                .with(user(userB.getEmail()).roles("FREE")))
            .andExpect(status().isForbidden());
    }

    @Test
    void delete_byOwner_returns204() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(delete("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId())
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isNoContent());
    }

    @Test
    void delete_byAdmin_returns204() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(delete("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId())
                .with(user(adminUser.getEmail()).roles("ADMIN")))
            .andExpect(status().isNoContent());
    }

    // ── Upload constraints ────────────────────────────────────────────────────

    @Test
    void upload_oversizedFile_returns400() throws Exception {
        byte[] big = new byte[11 * 1024 * 1024]; // 11 MB
        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(new MockMultipartFile("file", "big.pdf", PDF, big))
                .param("documentType", "PASSPORT")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void upload_disallowedContentType_returns400() throws Exception {
        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(new MockMultipartFile("file", "evil.exe", "application/x-msdownload", new byte[]{1, 2, 3}))
                .param("documentType", "OTHER")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void upload_twentyFirstDocument_returns400() throws Exception {
        // Fill 20 docs across multiple types so the per-type "replace" doesn't reduce the count
        DocumentType[] types = DocumentType.values();
        for (int i = 0; i < 20; i++) {
            documentRepository.save(ApplicationDocument.builder()
                .application(appOfUserA)
                .documentType(types[i % types.length])
                .originalFilename("f" + i + ".pdf")
                .storedFilename(UUID.randomUUID() + ".pdf")
                .contentType(PDF)
                .fileSize(10L)
                .storageKey("applications/" + appOfUserA.getId() + "/seed-" + i + ".pdf")
                .uploadedBy(userA)
                .build());
        }

        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("21st.pdf", PDF_BYTES))
                .param("documentType", "OTHER")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void softDeletedDocuments_doNotCountTowardLimit() throws Exception {
        // 19 active + 1 soft-deleted = 20 rows but only 19 active → upload should succeed
        DocumentType[] types = DocumentType.values();
        for (int i = 0; i < 19; i++) {
            documentRepository.save(ApplicationDocument.builder()
                .application(appOfUserA)
                .documentType(types[i % types.length])
                .originalFilename("f" + i + ".pdf")
                .storedFilename(UUID.randomUUID() + ".pdf")
                .contentType(PDF)
                .fileSize(10L)
                .storageKey("applications/" + appOfUserA.getId() + "/seed-" + i + ".pdf")
                .uploadedBy(userA)
                .build());
        }
        documentRepository.save(ApplicationDocument.builder()
            .application(appOfUserA)
            .documentType(DocumentType.OTHER)
            .originalFilename("deleted.pdf")
            .storedFilename(UUID.randomUUID() + ".pdf")
            .contentType(PDF)
            .fileSize(10L)
            .storageKey("applications/" + appOfUserA.getId() + "/seed-deleted.pdf")
            .uploadedBy(userA)
            .deletedAt(java.time.Instant.now())
            .build());

        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("ok.pdf", PDF_BYTES))
                .param("documentType", "VISA")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isCreated());
    }

    // ── Replace semantics ─────────────────────────────────────────────────────

    @Test
    void uploadingSameType_softDeletesPreviousAndKeepsBothRows() throws Exception {
        ApplicationDocument first = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        uploadAsOwner(DocumentType.PASSPORT, "%PDF-1.4 second".getBytes());

        ApplicationDocument firstReloaded = documentRepository.findById(first.getId()).orElseThrow();
        assertThat(firstReloaded.getDeletedAt()).isNotNull();

        List<ApplicationDocument> active = documentRepository
            .findByApplicationIdAndDeletedAtIsNullOrderByUploadedAtDesc(appOfUserA.getId());
        assertThat(active).hasSize(1);
        assertThat(active.get(0).getDocumentType()).isEqualTo(DocumentType.PASSPORT);

        // Both rows still exist
        assertThat(documentRepository.findAll()).hasSize(2);
    }

    // ── Soft delete ───────────────────────────────────────────────────────────

    @Test
    void deletedDocument_isHiddenFromList() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(delete("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId())
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void downloadingSoftDeletedDocument_returns404() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        mockMvc.perform(delete("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId())
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId() + "/download")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isNotFound());
    }

    @Test
    void softDelete_doesNotRemoveFileFromStorage() throws Exception {
        ApplicationDocument doc = uploadAsOwner(DocumentType.PASSPORT, PDF_BYTES);
        String storageKey = doc.getStorageKey();
        assertThat(fileStorageService.exists(storageKey)).isTrue();

        mockMvc.perform(delete("/api/v1/applications/" + appOfUserA.getId() + "/documents/" + doc.getId())
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isNoContent());

        assertThat(fileStorageService.exists(storageKey)).isTrue();
    }

    // ── Virus scan hook ───────────────────────────────────────────────────────

    @Test
    void upload_virusDetected_returns400() throws Exception {
        when(virusScannerService.scan(any()))
            .thenReturn(new ScanResult(false, "EICAR test signature"));

        mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("infected.pdf", PDF_BYTES))
                .param("documentType", "PASSPORT")
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isBadRequest());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ApplicationDocument uploadAsOwner(DocumentType type, byte[] bytes) throws Exception {
        String response = mockMvc.perform(multipart("/api/v1/applications/" + appOfUserA.getId() + "/documents")
                .file(pdfFile("p.pdf", bytes))
                .param("documentType", type.name())
                .with(user(userA.getEmail()).roles("FREE")))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        UUID id = UUID.fromString(new com.fasterxml.jackson.databind.ObjectMapper().readTree(response).get("id").asText());
        return documentRepository.findById(id).orElseThrow();
    }
}
