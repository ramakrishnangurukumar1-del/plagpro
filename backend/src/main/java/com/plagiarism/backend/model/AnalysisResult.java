package com.plagiarism.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "analysis_results")
@Getter
@Setter
@NoArgsConstructor
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", unique = true)
    private Document document;

    private double aiPercent;
    private double plagiarismPercent;

    /** JSON array of {name, score} model scores */
    @Lob
    private String modelScoresJson;

    /** JSON array of {name, similarity} plagiarism sources */
    @Lob
    private String plagiarismSourcesJson;

    /** JSON array of {text, aiScore} per-sentence breakdown */
    @Lob
    private String sentenceAnalysisJson;

    public AnalysisResult(Document document) {
        this.document = document;
    }
}
