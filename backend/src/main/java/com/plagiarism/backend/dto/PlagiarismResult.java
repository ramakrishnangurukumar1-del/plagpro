package com.plagiarism.backend.dto;

import java.util.List;

public record PlagiarismResult(
        double plagiarismPercent,
        List<SourceMatchDto> sources
) {
}
