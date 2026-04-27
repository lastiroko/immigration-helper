package com.immigrationhelper.application.dto.document;

import java.io.InputStream;

public record DocumentDownload(
    InputStream content,
    String originalFilename,
    String contentType,
    long fileSize
) {}
