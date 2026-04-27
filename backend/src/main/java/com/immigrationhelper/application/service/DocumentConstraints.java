package com.immigrationhelper.application.service;

import java.util.Set;

public final class DocumentConstraints {

    public static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024; // 10 MB

    public static final int MAX_DOCUMENTS_PER_APPLICATION = 20;

    public static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private DocumentConstraints() {}
}
