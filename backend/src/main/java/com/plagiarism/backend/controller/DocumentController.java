package com.plagiarism.backend.controller;

import com.plagiarism.backend.dto.AnalysisResultDto;
import com.plagiarism.backend.dto.DocumentSummaryDto;
import com.plagiarism.backend.security.AppUserPrincipal;
import com.plagiarism.backend.service.DocumentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
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
}
