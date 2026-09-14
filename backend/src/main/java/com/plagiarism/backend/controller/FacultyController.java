package com.plagiarism.backend.controller;

import com.plagiarism.backend.dto.DocumentSummaryDto;
import com.plagiarism.backend.dto.FacultyStatsDto;
import com.plagiarism.backend.service.DocumentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final DocumentService documentService;

    public FacultyController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/documents")
    public List<DocumentSummaryDto> documents() {
        return documentService.getAll();
    }

    @GetMapping("/stats")
    public FacultyStatsDto stats() {
        return documentService.getFacultyStats();
    }
}
