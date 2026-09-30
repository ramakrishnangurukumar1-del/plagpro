package com.plagiarism.backend.service;

import com.plagiarism.backend.dto.AiAnalysisResult;
import com.plagiarism.backend.dto.ModelScoreDto;
import com.plagiarism.backend.dto.SentenceScoreDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class MlServiceClient implements AIAnalyzer {

    private final RestClient restClient;

    public MlServiceClient(@Value("${app.ml.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(60).toMillis());

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public AiAnalysisResult analyze(String text) {
        try {
            return callOnce(text);
        } catch (Exception e) {
            // The ML service runs on the same free hosting tier as the
            // backend and spins down independently after idle time. A sleeping
            // service fails this call outright (connection refused/reset)
            // before it's had time to wake up - one retry after a short delay
            // is usually enough for it to be up. Without this, a cold ML
            // service silently produced a fake "0% AI, no model scores"
            // result via fallback() below, indistinguishable from a document
            // genuinely showing no AI-writing signal.
            try {
                Thread.sleep(8000);
                return callOnce(text);
            } catch (Exception retryFailure) {
                return fallback();
            }
        }
    }

    private AiAnalysisResult callOnce(String text) {
        MlResponse response = restClient.post()
                .uri("/analyze")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of("text", text))
                .retrieve()
                .body(MlResponse.class);

        if (response == null) {
            return fallback();
        }

        List<ModelScoreDto> scores = response.modelScores() == null
                ? List.of()
                : response.modelScores().stream().map(s -> new ModelScoreDto(s.name(), s.score())).toList();

        List<SentenceScoreDto> sentences = response.sentenceScores() == null
                ? List.of()
                : response.sentenceScores().stream().map(s -> new SentenceScoreDto(s.text(), s.aiScore())).toList();

        return new AiAnalysisResult(response.aiPercent(), scores, sentences);
    }

    private AiAnalysisResult fallback() {
        return new AiAnalysisResult(0.0, List.of(), List.of());
    }

    private record MlResponse(double aiPercent, List<MlModelScore> modelScores, List<MlSentenceScore> sentenceScores) {
    }

    private record MlModelScore(String name, double score) {
    }

    private record MlSentenceScore(String text, double aiScore) {
    }
}
