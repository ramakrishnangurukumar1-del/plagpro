package com.plagiarism.backend.service.fileprocessor;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Locale;

@Component
public class FileProcessorFactory {

    private final PdfFileProcessor pdfFileProcessor;
    private final ImageFileProcessor imageFileProcessor;
    private final DocxFileProcessor docxFileProcessor;

    public FileProcessorFactory(
            PdfFileProcessor pdfFileProcessor,
            ImageFileProcessor imageFileProcessor,
            DocxFileProcessor docxFileProcessor
    ) {
        this.pdfFileProcessor = pdfFileProcessor;
        this.imageFileProcessor = imageFileProcessor;
        this.docxFileProcessor = docxFileProcessor;
    }

    public FileProcessor getProcessor(String originalFilename) {
        String ext = extension(originalFilename);
        return switch (ext) {
            case "pdf" -> pdfFileProcessor;
            case "jpg", "jpeg", "png" -> imageFileProcessor;
            case "docx" -> docxFileProcessor;
            default -> throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported file type: ." + ext);
        };
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File has no extension: " + filename);
        }
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
