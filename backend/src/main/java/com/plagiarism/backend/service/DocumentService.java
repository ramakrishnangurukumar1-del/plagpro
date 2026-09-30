package com.plagiarism.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plagiarism.backend.dto.*;
import com.plagiarism.backend.model.*;
import com.plagiarism.backend.repository.AnalysisResultRepository;
import com.plagiarism.backend.repository.DocumentRepository;
import com.plagiarism.backend.service.fileprocessor.FileProcessorFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final FileProcessorFactory fileProcessorFactory;
    private final AIAnalyzer aiAnalyzer;
    private final PlagiarismService plagiarismService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Spring's @Async only takes effect through the proxy; calling
    // processDocument(...) directly from within this same class (self-
    // invocation) bypasses that proxy entirely and just runs it inline on
    // the caller's thread. Injecting a lazy self-reference and calling
    // through it routes the call back through the proxy so @Async actually
    // applies. Without this, uploadAndAnalyze() silently ran the whole
    // extraction + AI + plagiarism pipeline synchronously before returning
    // the HTTP response - fast enough locally to go unnoticed, but tens of
    // seconds on a slower host with real network calls to five external
    // APIs plus the ML service.
    @Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private DocumentService self;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public DocumentService(
            DocumentRepository documentRepository,
            AnalysisResultRepository analysisResultRepository,
            FileProcessorFactory fileProcessorFactory,
            AIAnalyzer aiAnalyzer,
            PlagiarismService plagiarismService
    ) {
        this.documentRepository = documentRepository;
        this.analysisResultRepository = analysisResultRepository;
        this.fileProcessorFactory = fileProcessorFactory;
        this.aiAnalyzer = aiAnalyzer;
        this.plagiarismService = plagiarismService;
    }

    private static final List<String> ALLOWED_EXTENSIONS = List.of("pdf", "jpg", "jpeg", "png", "docx");
    private static final int MAX_FILES = 10;

    public List<DocumentSummaryDto> uploadAndAnalyze(List<MultipartFile> files, User owner) {
        if (files.size() > MAX_FILES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max " + MAX_FILES + " files per upload");
        }

        List<Document> saved = files.stream().map(f -> storeAndCreate(f, owner)).toList();
        saved.forEach(doc -> self.processDocument(doc.getId()));
        return saved.stream().map(this::toSummary).toList();
    }

    private Document storeAndCreate(MultipartFile file, User owner) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing filename");
        }
        String ext = extension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported file type: ." + ext);
        }

        try {
            Path ownerDir = Path.of(uploadDir, String.valueOf(owner.getId()));
            Files.createDirectories(ownerDir);
            String storedName = UUID.randomUUID() + "." + ext;
            Path target = ownerDir.resolve(storedName);
            file.transferTo(target);

            Document document = new Document(owner, originalFilename, target.toString(), ext, file.getSize());
            return documentRepository.save(document);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file: " + originalFilename);
        }
    }

    @Async("analysisExecutor")
    public void processDocument(Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) return;

        document.setStatus(DocumentStatus.PROCESSING);
        documentRepository.save(document);

        try {
            String text = fileProcessorFactory.getProcessor(document.getOriginalFilename())
                    .process(new File(document.getStoredPath()));

            AiAnalysisResult aiResult = aiAnalyzer.analyze(text);
            PlagiarismResult plagiarismResult = plagiarismService.check(text);

            AnalysisResult result = analysisResultRepository.findByDocument(document)
                    .orElseGet(() -> new AnalysisResult(document));
            result.setAiPercent(aiResult.aiPercent());
            result.setPlagiarismPercent(plagiarismResult.plagiarismPercent());
            result.setModelScoresJson(objectMapper.writeValueAsString(aiResult.modelScores()));
            result.setSentenceAnalysisJson(objectMapper.writeValueAsString(aiResult.sentenceScores()));
            result.setPlagiarismSourcesJson(objectMapper.writeValueAsString(plagiarismResult.sources()));
            analysisResultRepository.save(result);

            document.setStatus(DocumentStatus.COMPLETED);
            document.setCompletedAt(Instant.now());
        } catch (Exception e) {
            document.setStatus(DocumentStatus.FAILED);
            document.setErrorMessage(e.getMessage());
        }
        documentRepository.save(document);
    }

    public List<DocumentSummaryDto> getMine(User owner) {
        return documentRepository.findByOwnerOrderByUploadedAtDesc(owner).stream().map(this::toSummary).toList();
    }

    public List<DocumentSummaryDto> getAll() {
        return documentRepository.findAllByOrderByUploadedAtDesc().stream().map(this::toSummary).toList();
    }

    public Document getAuthorizedDocument(Long documentId, User requester) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

        boolean isOwner = document.getOwner().getId().equals(requester.getId());
        boolean isFacultyOrAdmin = requester.getRole() == Role.FACULTY || requester.getRole() == Role.ADMIN;
        if (!isOwner && !isFacultyOrAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your document");
        }
        return document;
    }

    public AnalysisResultDto getResult(Long documentId, User requester) {
        Document document = getAuthorizedDocument(documentId, requester);

        AnalysisResult result = analysisResultRepository.findByDocument(document).orElse(null);
        if (result == null) {
            return new AnalysisResultDto(document.getId(), document.getOriginalFilename(),
                    document.getStatus().name(), 0, 0, List.of(), List.of(), List.of());
        }

        try {
            return new AnalysisResultDto(
                    document.getId(),
                    document.getOriginalFilename(),
                    document.getStatus().name(),
                    result.getAiPercent(),
                    result.getPlagiarismPercent(),
                    List.of(objectMapper.readValue(result.getModelScoresJson(), ModelScoreDto[].class)),
                    List.of(objectMapper.readValue(result.getPlagiarismSourcesJson(), SourceMatchDto[].class)),
                    List.of(objectMapper.readValue(result.getSentenceAnalysisJson(), SentenceScoreDto[].class))
            );
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupted analysis result");
        }
    }

    public FacultyStatsDto getFacultyStats() {
        List<AnalysisResult> results = analysisResultRepository.findAll();
        long total = documentRepository.count();
        double avgAi = results.stream().mapToDouble(AnalysisResult::getAiPercent).average().orElse(0);
        double avgPlag = results.stream().mapToDouble(AnalysisResult::getPlagiarismPercent).average().orElse(0);
        return new FacultyStatsDto(total, round(avgAi), round(avgPlag));
    }

    private DocumentSummaryDto toSummary(Document d) {
        AnalysisResult result = analysisResultRepository.findByDocument(d).orElse(null);
        return new DocumentSummaryDto(
                d.getId(),
                d.getOriginalFilename(),
                d.getSizeBytes(),
                d.getStatus().name(),
                d.getOwner().getFullName(),
                d.getUploadedAt(),
                result == null ? null : result.getAiPercent(),
                result == null ? null : result.getPlagiarismPercent()
        );
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
