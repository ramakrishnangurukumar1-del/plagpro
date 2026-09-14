package com.plagiarism.backend.controller;

import com.plagiarism.backend.dto.AnalysisResultDto;
import com.plagiarism.backend.dto.DocumentSummaryDto;
import com.plagiarism.backend.model.Document;
import com.plagiarism.backend.security.AppUserPrincipal;
import com.plagiarism.backend.service.DocumentService;
import com.plagiarism.backend.service.ReportPdfService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final ReportPdfService reportPdfService;

    private static final Map<String, MediaType> CONTENT_TYPES = Map.of(
            "pdf", MediaType.APPLICATION_PDF,
            "jpg", MediaType.IMAGE_JPEG,
            "jpeg", MediaType.IMAGE_JPEG,
            "png", MediaType.IMAGE_PNG,
            "docx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    );

    public DocumentController(DocumentService documentService, ReportPdfService reportPdfService) {
        this.documentService = documentService;
        this.reportPdfService = reportPdfService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public List<DocumentSummaryDto> upload(
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return documentService.uploadAndAnalyze(files, principal.getUser());
    }

    @GetMapping("/mine")
    public List<DocumentSummaryDto> mine(@AuthenticationPrincipal AppUserPrincipal principal) {
        return documentService.getMine(principal.getUser());
    }

    @GetMapping("/{id}/result")
    public AnalysisResultDto result(@PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal principal) {
        return documentService.getResult(id, principal.getUser());
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<FileSystemResource> file(@PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal principal) {
        Document document = documentService.getAuthorizedDocument(id, principal.getUser());
        MediaType contentType = CONTENT_TYPES.getOrDefault(
                document.getFileType().toLowerCase(Locale.ROOT), MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(document.getOriginalFilename()).build().toString())
                .body(new FileSystemResource(document.getStoredPath()));
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> report(@PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal principal) {
        AnalysisResultDto result = documentService.getResult(id, principal.getUser());
        byte[] pdf = reportPdfService.generate(result, principal.getUser().getFullName());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(baseName(result.filename()) + "_report.pdf").build().toString())
                .body(pdf);
    }

    private String baseName(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? filename : filename.substring(0, dot);
    }
}
