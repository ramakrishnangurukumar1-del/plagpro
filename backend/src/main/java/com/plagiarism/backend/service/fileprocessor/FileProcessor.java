package com.plagiarism.backend.service.fileprocessor;

import java.io.File;
import java.io.IOException;

/**
 * Abstraction over "how do I turn this file into plain text".
 * Concrete subclasses hide the format-specific extraction mechanics
 * (direct parsing vs. OCR) behind one common entry point.
 */
public abstract class FileProcessor {

    public final String process(File file) throws IOException {
        String text = extractText(file);
        return text == null ? "" : text.trim();
    }

    protected abstract String extractText(File file) throws IOException;
}
