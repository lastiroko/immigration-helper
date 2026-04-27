package com.immigrationhelper.infrastructure.storage;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;

@Service
@Profile("!prod")
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final Path basePath;

    public LocalFileStorageService(@Value("${app.storage.local.base-path:./uploads}") String basePathConfig) {
        this.basePath = Paths.get(basePathConfig).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(basePath);
            log.info("Local file storage initialized at {}", basePath);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create storage directory: " + basePath, e);
        }
    }

    @Override
    public String store(InputStream content, String storageKey, String contentType) {
        Path target = resolveSafe(storageKey);
        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = content) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return storageKey;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file at " + storageKey, e);
        }
    }

    @Override
    public InputStream retrieve(String storageKey) {
        Path source = resolveSafe(storageKey);
        if (!Files.exists(source)) {
            throw new IllegalStateException("File not found in storage: " + storageKey);
        }
        try {
            return Files.newInputStream(source);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read file: " + storageKey, e);
        }
    }

    @Override
    public void delete(String storageKey) {
        Path target = resolveSafe(storageKey);
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete file: " + storageKey, e);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        Path target = resolveSafe(storageKey);
        return Files.exists(target);
    }

    /**
     * Defense-in-depth path-traversal guard: reject suspicious characters and absolute paths,
     * then verify the resolved path stays within the configured base directory.
     * Forward slashes are allowed inside the key (used as directory separators) but the
     * resolved path must still live under basePath.
     */
    private Path resolveSafe(String storageKey) {
        Objects.requireNonNull(storageKey, "storageKey must not be null");
        if (storageKey.isBlank()
            || storageKey.contains("..")
            || storageKey.contains("\0")
            || storageKey.startsWith("/")
            || storageKey.startsWith("\\")) {
            throw new IllegalArgumentException("Invalid storage key: " + storageKey);
        }
        Path resolved = basePath.resolve(storageKey).normalize();
        if (!resolved.startsWith(basePath)) {
            throw new IllegalArgumentException("Storage key escapes base path: " + storageKey);
        }
        return resolved;
    }
}
