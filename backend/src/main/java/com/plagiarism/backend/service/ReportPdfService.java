package com.plagiarism.backend.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TabAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.plagiarism.backend.dto.AnalysisResultDto;
import com.plagiarism.backend.dto.ModelScoreDto;
import com.plagiarism.backend.dto.SourceMatchDto;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;

@Service
public class ReportPdfService {

    private static final DeviceRgb PURPLE = new DeviceRgb(124, 92, 255);
    private static final DeviceRgb TEAL = new DeviceRgb(51, 224, 201);
    private static final DeviceRgb AMBER = new DeviceRgb(245, 165, 36);
    private static final DeviceRgb GREY = new DeviceRgb(110, 110, 120);

    public byte[] generate(AnalysisResultDto result, String studentName) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PdfDocument pdf = new PdfDocument(new PdfWriter(out)); Document doc = new Document(pdf)) {
            doc.setMargins(40, 40, 40, 40);

            doc.add(new Paragraph("PLAGPRO")
                    .simulateBold().setFontSize(10).setFontColor(GREY).setCharacterSpacing(1.5f));
            doc.add(new Paragraph("Document Analysis Report")
                    .simulateBold().setFontSize(20).setMarginTop(4).setMarginBottom(12));

            Table meta = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1})).useAllAvailableWidth();
            meta.addCell(metaCell("File Name", result.filename()));
            meta.addCell(metaCell("Student", studentName));
            meta.addCell(metaCell("Date", DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")
                    .withZone(ZoneId.systemDefault()).format(java.time.Instant.now())));
            doc.add(meta.setMarginBottom(16));

            Table scores = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
            scores.addCell(scoreCell("AI Content Detection", result.aiPercent(), PURPLE, "Likely AI-generated"));
            scores.addCell(scoreCell("Plagiarism Detection", result.plagiarismPercent(), AMBER, "Matched with sources"));
            doc.add(scores.setMarginBottom(16));

            Table cols = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();

            Cell modelCell = new Cell().setBorder(Border.NO_BORDER).setPaddingRight(12);
            modelCell.add(new Paragraph("Model Scores").simulateBold().setFontSize(11).setMarginBottom(6));
            if (result.modelScores().isEmpty()) {
                modelCell.add(new Paragraph("No model scores available.").setFontSize(9).setFontColor(GREY));
            } else {
                for (ModelScoreDto m : result.modelScores()) {
                    modelCell.add(rowLine(m.name(), Math.round(m.score()) + "%"));
                }
            }
            cols.addCell(modelCell);

            Cell sourceCell = new Cell().setBorder(Border.NO_BORDER).setPaddingLeft(12);
            sourceCell.add(new Paragraph("Matched Sources").simulateBold().setFontSize(11).setMarginBottom(6));
            if (result.plagiarismSources().isEmpty()) {
                sourceCell.add(new Paragraph("No matching sources found.").setFontSize(9).setFontColor(GREY));
            } else {
                int i = 1;
                for (SourceMatchDto s : result.plagiarismSources()) {
                    Paragraph p = rowLine((i++) + ". " + s.name(), Math.round(s.similarity()) + "%");
                    sourceCell.add(p);
                    if (s.url() != null && !s.url().isBlank()) {
                        Link link = new Link(s.url(), com.itextpdf.kernel.pdf.action.PdfAction.createURI(s.url()));
                        sourceCell.add(new Paragraph(link).setFontSize(7).setFontColor(TEAL).setMarginTop(-4).setMarginBottom(4));
                    }
                }
            }
            cols.addCell(sourceCell);
            doc.add(cols);

            if (!result.sentenceAnalysis().isEmpty()) {
                doc.add(new Paragraph("Sentence-Level Breakdown").simulateBold().setFontSize(11).setMarginTop(20).setMarginBottom(6));
                result.sentenceAnalysis().forEach(s -> {
                    Paragraph p = new Paragraph()
                            .add(new Text(s.text() + "  ").setFontSize(9))
                            .add(new Text(Math.round(s.aiScore()) + "% AI").setFontSize(8).setFontColor(GREY).simulateBold())
                            .setMarginBottom(4);
                    doc.add(p);
                });
            }

            doc.add(new Paragraph("Generated by PlagPro — AI detection is a confidence signal, not a verdict.")
                    .setFontSize(7).setFontColor(GREY).setMarginTop(24).setTextAlignment(TextAlignment.CENTER));
        }
        return out.toByteArray();
    }

    private Cell metaCell(String label, String value) {
        Cell c = new Cell().setBorder(Border.NO_BORDER);
        c.add(new Paragraph(label).simulateBold().setFontSize(8).setFontColor(GREY).setMarginBottom(2));
        c.add(new Paragraph(value == null ? "-" : value).setFontSize(9));
        return c;
    }

    private Cell scoreCell(String label, double value, DeviceRgb color, String sub) {
        Cell c = new Cell().setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 1)).setPadding(10);
        c.add(new Paragraph(label).setFontSize(8).setFontColor(GREY).setMarginBottom(4));
        c.add(new Paragraph(Math.round(value) + "%").simulateBold().setFontSize(20).setFontColor(color).setMarginBottom(2));
        c.add(new Paragraph(sub).setFontSize(8).setFontColor(GREY));
        return c;
    }

    private Paragraph rowLine(String left, String right) {
        return new Paragraph()
                .add(new Text(left).setFontSize(9))
                .add(new Tab())
                .add(new Text(right).setFontSize(9).simulateBold())
                .addTabStops(new TabStop(220, TabAlignment.RIGHT))
                .setMarginBottom(3);
    }
}
