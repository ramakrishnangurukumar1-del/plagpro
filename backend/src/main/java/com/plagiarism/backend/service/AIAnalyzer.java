package com.plagiarism.backend.service;

import com.plagiarism.backend.dto.AiAnalysisResult;

/**
 * Contract for scoring a document's writing style for AI-generation
 * likelihood. Kept as an interface so the underlying model/ensemble
 * (currently a Flask ML microservice) can be swapped without touching
 * callers such as DocumentService.
 */
public interface AIAnalyzer {
    AiAnalysisResult analyze(String text);
}
