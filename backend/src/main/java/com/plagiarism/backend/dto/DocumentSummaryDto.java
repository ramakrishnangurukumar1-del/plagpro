package com.plagiarism.backend.dto;

import java.time.Instant;

public record DocumentSummaryDto(
        Long id,
        String filename,
        long sizeBytes,
        String status,
        String ownerName,
        Instant uploadedAt,
        Double aiPercent,
        Double plagiarismPercent
) {
}
