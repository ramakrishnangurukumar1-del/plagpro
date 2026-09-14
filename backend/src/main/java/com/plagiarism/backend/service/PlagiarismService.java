package com.plagiarism.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plagiarism.backend.dto.PlagiarismResult;
import com.plagiarism.backend.dto.SourceMatchDto;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Cross-checks a document's text against a handful of free public APIs
 * to estimate source-matching plagiarism. Each source is queried
 * independently and failures are isolated so one flaky API doesn't
 * sink the whole check.
 */
@Service
public class PlagiarismService {

    private static final Pattern WORD = Pattern.compile("[a-zA-Z]{4,}");
    private static final Set<String> STOPWORDS = Set.of(
            "this", "that", "with", "from", "have", "were", "they", "their",
            "which", "these", "those", "been", "being", "into", "such", "also"
    );

    private final RestClient restClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public PlagiarismService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(8).toMillis());
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    public PlagiarismResult check(String text) {
        String query = topKeywords(text, 6);
        Set<String> docWords = significantWords(text);

        List<SourceMatchDto> sources = new ArrayList<>();
        addIfPresent(sources, checkWikipedia(query, docWords));
        addIfPresent(sources, checkCrossRef(query, docWords));
        addIfPresent(sources, checkOpenAlex(query, docWords));
        addIfPresent(sources, checkArxiv(query, docWords));
        addIfPresent(sources, checkSemanticScholar(query, docWords));

        sources.sort(Comparator.comparingDouble(SourceMatchDto::similarity).reversed());

        double overall = sources.stream()
                .mapToDouble(SourceMatchDto::similarity)
                .max()
                .orElse(0.0);

        return new PlagiarismResult(round(overall), sources);
    }

    private void addIfPresent(List<SourceMatchDto> list, SourceMatchDto match) {
        if (match != null && match.similarity() > 0) {
            list.add(match);
        }
    }

    private SourceMatchDto checkWikipedia(String query, Set<String> docWords) {
        try {
            String json = restClient.get()
                    .uri("https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=1&srsearch={q}", query)
                    .retrieve().body(String.class);
            JsonNode root = mapper.readTree(json);
            JsonNode hits = root.path("query").path("search");
            if (!hits.isArray() || hits.isEmpty()) return null;
            String snippet = hits.get(0).path("snippet").asText("").replaceAll("<[^>]+>", "");
            return new SourceMatchDto("Wikipedia", round(overlapPercent(docWords, significantWords(snippet))));
        } catch (Exception e) {
            return null;
        }
    }

    private SourceMatchDto checkCrossRef(String query, Set<String> docWords) {
        try {
            String json = restClient.get()
                    .uri("https://api.crossref.org/works?rows=1&query={q}", query)
                    .retrieve().body(String.class);
            JsonNode items = mapper.readTree(json).path("message").path("items");
            if (!items.isArray() || items.isEmpty()) return null;
            String title = items.get(0).path("title").isArray() && items.get(0).path("title").size() > 0
                    ? items.get(0).path("title").get(0).asText("") : "";
            return new SourceMatchDto("CrossRef", round(overlapPercent(docWords, significantWords(title))));
        } catch (Exception e) {
            return null;
        }
    }

    private SourceMatchDto checkOpenAlex(String query, Set<String> docWords) {
        try {
            String json = restClient.get()
                    .uri("https://api.openalex.org/works?per-page=1&search={q}", query)
                    .retrieve().body(String.class);
            JsonNode results = mapper.readTree(json).path("results");
            if (!results.isArray() || results.isEmpty()) return null;
            String title = results.get(0).path("title").asText("");
            return new SourceMatchDto("OpenAlex", round(overlapPercent(docWords, significantWords(title))));
        } catch (Exception e) {
            return null;
        }
    }

    private SourceMatchDto checkArxiv(String query, Set<String> docWords) {
        try {
            String xml = restClient.get()
                    .uri("https://export.arxiv.org/api/query?search_query=all:{q}&max_results=1", query)
                    .retrieve().body(String.class);
            if (xml == null) return null;
            java.util.regex.Matcher m = Pattern.compile("<summary>(.*?)</summary>", Pattern.DOTALL).matcher(xml);
            if (!m.find()) return null;
            String summary = m.group(1);
            return new SourceMatchDto("arXiv", round(overlapPercent(docWords, significantWords(summary))));
        } catch (Exception e) {
            return null;
        }
    }

    private SourceMatchDto checkSemanticScholar(String query, Set<String> docWords) {
        try {
            String json = restClient.get()
                    .uri("https://api.semanticscholar.org/graph/v1/paper/search?limit=1&query={q}", query)
                    .retrieve().body(String.class);
            JsonNode data = mapper.readTree(json).path("data");
            if (!data.isArray() || data.isEmpty()) return null;
            String title = data.get(0).path("title").asText("");
            return new SourceMatchDto("Semantic Scholar", round(overlapPercent(docWords, significantWords(title))));
        } catch (Exception e) {
            return null;
        }
    }

    private String topKeywords(String text, int count) {
        Map<String, Integer> freq = new LinkedHashMap<>();
        var matcher = WORD.matcher(text.toLowerCase(Locale.ROOT));
        while (matcher.find()) {
            String w = matcher.group();
            if (!STOPWORDS.contains(w)) {
                freq.merge(w, 1, Integer::sum);
            }
        }
        return freq.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(count)
                .map(Map.Entry::getKey)
                .reduce((a, b) -> a + " " + b)
                .orElse(text.length() > 40 ? text.substring(0, 40) : text);
    }

    private Set<String> significantWords(String text) {
        Set<String> words = new HashSet<>();
        var matcher = WORD.matcher(text.toLowerCase(Locale.ROOT));
        while (matcher.find()) {
            String w = matcher.group();
            if (!STOPWORDS.contains(w)) words.add(w);
        }
        return words;
    }

    private double overlapPercent(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        long shared = b.stream().filter(a::contains).count();
        return Math.min(100.0, (shared * 100.0) / Math.min(a.size(), b.size()));
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
