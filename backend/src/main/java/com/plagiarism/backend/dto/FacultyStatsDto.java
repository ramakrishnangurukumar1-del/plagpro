package com.plagiarism.backend.dto;

public record FacultyStatsDto(
        long totalDocuments,
        double avgAiPercent,
        double avgPlagiarismPercent
) {
}
