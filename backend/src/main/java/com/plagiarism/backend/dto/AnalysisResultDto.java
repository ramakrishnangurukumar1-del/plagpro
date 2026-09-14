package com.plagiarism.backend.dto;

import java.util.List;

public record AnalysisResultDto(
        Long documentId,
        String filename,
        String status,
        double aiPercent,
        double plagiarismPercent,
        List<ModelScoreDto> modelScores,
        List<SourceMatchDto> plagiarismSources,
        List<SentenceScoreDto> sentenceAnalysis
) {
}
