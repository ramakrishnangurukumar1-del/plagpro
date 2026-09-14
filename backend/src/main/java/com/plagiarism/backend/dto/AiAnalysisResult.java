package com.plagiarism.backend.dto;

import java.util.List;

public record AiAnalysisResult(
        double aiPercent,
        List<ModelScoreDto> modelScores,
        List<SentenceScoreDto> sentenceScores
) {
}
