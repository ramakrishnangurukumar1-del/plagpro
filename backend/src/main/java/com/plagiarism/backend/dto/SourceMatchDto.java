package com.plagiarism.backend.dto;

import java.util.List;

public record SourceMatchDto(String name, double similarity, String url, List<String> matchedSentences) {
}
