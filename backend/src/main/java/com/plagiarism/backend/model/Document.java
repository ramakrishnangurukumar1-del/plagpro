package com.plagiarism.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false)
    private String originalFilename;

    @Column(nullable = false)
    private String storedPath;

    @Column(nullable = false)
    private String fileType;

    private long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.QUEUED;

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    private Instant completedAt;

    @Lob
    private String errorMessage;

    public Document(User owner, String originalFilename, String storedPath, String fileType, long sizeBytes) {
        this.owner = owner;
        this.originalFilename = originalFilename;
        this.storedPath = storedPath;
        this.fileType = fileType;
        this.sizeBytes = sizeBytes;
    }
}
