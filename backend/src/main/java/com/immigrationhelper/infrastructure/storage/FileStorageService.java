package com.immigrationhelper.infrastructure.storage;

import java.io.InputStream;

public interface FileStorageService {

    String store(InputStream content, String storageKey, String contentType);

    InputStream retrieve(String storageKey);

    void delete(String storageKey);

    boolean exists(String storageKey);
}
