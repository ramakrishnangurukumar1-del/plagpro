package com.plagiarism.backend.service.fileprocessor;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

/**
 * OCR-based extraction for scanned/photographed submissions.
 * Requires a local Tesseract data path (tessdata) to be configured.
 */
@Component
public class ImageFileProcessor extends FileProcessor {

    private final String tessDataPath;

    public ImageFileProcessor(@Value("${app.tesseract.data-path:}") String tessDataPath) {
        this.tessDataPath = tessDataPath;
    }

    @Override
    protected String extractText(File file) throws IOException {
        Tesseract tesseract = new Tesseract();
        if (tessDataPath != null && !tessDataPath.isBlank()) {
            tesseract.setDatapath(tessDataPath);
        }
        try {
            return tesseract.doOCR(file);
        } catch (TesseractException e) {
            throw new IOException("OCR failed for " + file.getName(), e);
        }
    }
}
