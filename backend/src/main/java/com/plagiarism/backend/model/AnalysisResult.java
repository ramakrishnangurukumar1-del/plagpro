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

    // Plain TEXT columns rather than @Lob: on PostgreSQL, @Lob maps a String
    // to large-object (OID) storage, which requires being read within the
    // same transaction that wrote it - fine when everything happened to run
    // in one transaction, but breaks ("Unable to access lob stream") once
    // analysis genuinely runs in a separate async transaction from the
    // request that reads the result later. TEXT has no practical size limit
    // on Postgres, so there's no downside to dropping @Lob here.

    /** JSON array of {name, score} model scores */
    @Column(columnDefinition = "TEXT")
    private String modelScoresJson;

    /** JSON array of {name, similarity} plagiarism sources */
    @Column(columnDefinition = "TEXT")
    private String plagiarismSourcesJson;

    /** JSON array of {text, aiScore} per-sentence breakdown */
    @Column(columnDefinition = "TEXT")
    private String sentenceAnalysisJson;

    public AnalysisResult(Document document) {
        this.document = document;
    }
}
