package com.immigrationhelper.application.dto.document;

import java.util.List;

public record VaultDocumentListResponse(
    List<VaultDocumentDto> items,
    long quotaUsedBytes,
    long quotaLimitBytes
) {}
