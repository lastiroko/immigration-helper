package com.immigrationhelper.infrastructure.storage;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.InputStream;

/**
 * Stub for production S3-backed storage. Activated when the prod profile is enabled.
 * Real implementation (AWS SDK, presigned URLs, IAM-scoped credentials) is a follow-up.
 */
@Service
@Profile("prod")
public class S3FileStorageService implements FileStorageService {

    @Override
    public String store(InputStream content, String storageKey, String contentType) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }

    @Override
    public InputStream retrieve(String storageKey) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }

    @Override
    public void delete(String storageKey) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }

    @Override
    public boolean exists(String storageKey) {
        throw new UnsupportedOperationException("S3 storage not yet implemented");
    }
}
