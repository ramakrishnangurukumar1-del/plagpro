package com.plagiarism.backend.repository;

import com.plagiarism.backend.model.AnalysisResult;
import com.plagiarism.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    Optional<AnalysisResult> findByDocument(Document document);
    Optional<AnalysisResult> findByDocumentId(Long documentId);
}
