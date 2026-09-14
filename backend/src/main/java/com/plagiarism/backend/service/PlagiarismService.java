package com.plagiarism.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plagiarism.backend.dto.PlagiarismResult;
import com.plagiarism.backend.dto.SourceMatchDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(PlagiarismService.class);
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
        // Wikimedia (and some other APIs) reject requests with a generic/default
        // User-Agent (e.g. Java's own "Java/21") with a 403. A descriptive UA is
        // required by their bot policy: https://w.wiki/4wJS
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .defaultHeader("User-Agent", "PlagPro/1.0 (college project; contact: admin@plagpro.local)")
                .build();
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
            String title = hits.get(0).path("title").asText("");
            String snippet = hits.get(0).path("snippet").asText("").replaceAll("<[^>]+>", "");
            String url = "https://en.wikipedia.org/wiki/" + java.net.URLEncoder.encode(title.replace(' ', '_'), java.nio.charset.StandardCharsets.UTF_8);
            return new SourceMatchDto("Wikipedia", round(overlapPercent(docWords, significantWords(snippet))), url);
        } catch (Exception e) {
            log.debug("Wikipedia check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkCrossRef(String query, Set<String> docWords) {
        try {
            String json = restClient.get()
                    .uri("https://api.crossref.org/works?rows=1&query={q}", query)
                    .retrieve().body(String.class);
            JsonNode item = mapper.readTree(json).path("message").path("items");
            if (!item.isArray() || item.isEmpty()) return null;
            JsonNode first = item.get(0);
            String title = first.path("title").isArray() && first.path("title").size() > 0
                    ? first.path("title").get(0).asText("") : "";
            String doi = first.path("DOI").asText("");
            String url = doi.isBlank() ? first.path("URL").asText("") : "https://doi.org/" + doi;
            return new SourceMatchDto("CrossRef", round(overlapPercent(docWords, significantWords(title))), url);
        } catch (Exception e) {
            log.debug("CrossRef check failed: {}", e.getMessage());
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
            JsonNode first = results.get(0);
            String title = first.path("title").asText("");
            String url = first.path("doi").asText(first.path("id").asText(""));
            return new SourceMatchDto("OpenAlex", round(overlapPercent(docWords, significantWords(title))), url);
        } catch (Exception e) {
            log.debug("OpenAlex check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkArxiv(String query, Set<String> docWords) {
        try {
            String xml = restClient.get()
                    .uri("https://export.arxiv.org/api/query?search_query=all:{q}&max_results=1", query)
                    .retrieve().body(String.class);
            if (xml == null) return null;
            java.util.regex.Matcher summaryMatcher = Pattern.compile("<summary>(.*?)</summary>", Pattern.DOTALL).matcher(xml);
            if (!summaryMatcher.find()) return null;
            String summary = summaryMatcher.group(1);
            java.util.regex.Matcher idMatcher = Pattern.compile("<id>(.*?)</id>", Pattern.DOTALL).matcher(xml);
            String url = idMatcher.find() ? idMatcher.group(1).trim() : "";
            return new SourceMatchDto("arXiv", round(overlapPercent(docWords, significantWords(summary))), url);
        } catch (Exception e) {
            log.debug("arXiv check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkSemanticScholar(String query, Set<String> docWords) {
        try {
            String json = restClient.get()
                    .uri("https://api.semanticscholar.org/graph/v1/paper/search?limit=1&fields=title,url&query={q}", query)
                    .retrieve().body(String.class);
            JsonNode data = mapper.readTree(json).path("data");
            if (!data.isArray() || data.isEmpty()) return null;
            JsonNode first = data.get(0);
            String title = first.path("title").asText("");
            String url = first.path("url").asText("");
            return new SourceMatchDto("Semantic Scholar", round(overlapPercent(docWords, significantWords(title))), url);
        } catch (Exception e) {
            log.debug("Semantic Scholar check failed: {}", e.getMessage());
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
