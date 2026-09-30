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
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+");
    private static final Set<String> STOPWORDS = Set.of(
            "this", "that", "with", "from", "have", "were", "they", "their",
            "which", "these", "those", "been", "being", "into", "such", "also"
    );

    private final RestClient restClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public PlagiarismService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        // arXiv's export API in particular routinely takes 6-7s to respond;
        // give every source enough headroom that a slow-but-healthy response
        // isn't mistaken for a dead source.
        requestFactory.setReadTimeout((int) Duration.ofSeconds(15).toMillis());
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
        List<String> sentences = splitSentences(text);

        List<SourceMatchDto> sources = new ArrayList<>();
        addIfPresent(sources, checkWikipedia(query, docWords, sentences));
        addIfPresent(sources, checkCrossRef(query, docWords, sentences));
        addIfPresent(sources, checkOpenAlex(query, docWords, sentences));
        addIfPresent(sources, checkDoaj(query, docWords, sentences));
        addIfPresent(sources, checkEuropePmc(query, docWords, sentences));

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

    private SourceMatchDto checkWikipedia(String query, Set<String> docWords, List<String> sentences) {
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
            Set<String> sourceWords = significantWords(snippet);
            return new SourceMatchDto("Wikipedia", round(overlapPercent(docWords, sourceWords)), url,
                    topMatchingSentences(sentences, sourceWords));
        } catch (Exception e) {
            log.debug("Wikipedia check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkCrossRef(String query, Set<String> docWords, List<String> sentences) {
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
            String abstractText = first.path("abstract").asText("").replaceAll("<[^>]+>", "");
            Set<String> sourceWords = significantWords(title + " " + abstractText);
            return new SourceMatchDto("CrossRef", round(overlapPercent(docWords, sourceWords)), url,
                    topMatchingSentences(sentences, sourceWords));
        } catch (Exception e) {
            log.debug("CrossRef check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkOpenAlex(String query, Set<String> docWords, List<String> sentences) {
        try {
            String json = restClient.get()
                    .uri("https://api.openalex.org/works?per-page=1&search={q}", query)
                    .retrieve().body(String.class);
            JsonNode results = mapper.readTree(json).path("results");
            if (!results.isArray() || results.isEmpty()) return null;
            JsonNode first = results.get(0);
            String title = first.path("title").asText("");
            String url = first.path("doi").asText(first.path("id").asText(""));
            Set<String> sourceWords = significantWords(title + " " + abstractFromInvertedIndex(first.path("abstract_inverted_index")));
            return new SourceMatchDto("OpenAlex", round(overlapPercent(docWords, sourceWords)), url,
                    topMatchingSentences(sentences, sourceWords));
        } catch (Exception e) {
            log.debug("OpenAlex check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkDoaj(String query, Set<String> docWords, List<String> sentences) {
        try {
            String json = restClient.get()
                    .uri("https://doaj.org/api/search/articles/{q}?pageSize=1", query)
                    .retrieve().body(String.class);
            JsonNode results = mapper.readTree(json).path("results");
            if (!results.isArray() || results.isEmpty()) return null;
            JsonNode bibjson = results.get(0).path("bibjson");
            String title = bibjson.path("title").asText("");
            String abstractText = bibjson.path("abstract").asText("");

            String url = "";
            for (JsonNode id : bibjson.path("identifier")) {
                if ("doi".equalsIgnoreCase(id.path("type").asText())) {
                    url = "https://doi.org/" + id.path("id").asText();
                    break;
                }
            }
            if (url.isBlank()) {
                JsonNode links = bibjson.path("link");
                if (links.isArray() && !links.isEmpty()) url = links.get(0).path("url").asText("");
            }

            Set<String> sourceWords = significantWords(title + " " + abstractText);
            return new SourceMatchDto("DOAJ", round(overlapPercent(docWords, sourceWords)), url,
                    topMatchingSentences(sentences, sourceWords));
        } catch (Exception e) {
            log.debug("DOAJ check failed: {}", e.getMessage());
            return null;
        }
    }

    private SourceMatchDto checkEuropePmc(String query, Set<String> docWords, List<String> sentences) {
        try {
            String json = restClient.get()
                    .uri("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&pageSize=1&resultType=core", query)
                    .retrieve().body(String.class);
            JsonNode results = mapper.readTree(json).path("resultList").path("result");
            if (!results.isArray() || results.isEmpty()) return null;
            JsonNode first = results.get(0);
            String title = first.path("title").asText("");
            String abstractText = first.path("abstractText").asText("");
            String doi = first.path("doi").asText("");
            String url = doi.isBlank()
                    ? "https://europepmc.org/article/" + first.path("source").asText("MED") + "/" + first.path("id").asText("")
                    : "https://doi.org/" + doi;
            Set<String> sourceWords = significantWords(title + " " + abstractText);
            return new SourceMatchDto("Europe PMC", round(overlapPercent(docWords, sourceWords)), url,
                    topMatchingSentences(sentences, sourceWords));
        } catch (Exception e) {
            log.debug("Europe PMC check failed: {}", e.getMessage());
            return null;
        }
    }

    /** Reconstructs plain text from OpenAlex's word->positions inverted index format. */
    private String abstractFromInvertedIndex(JsonNode invertedIndex) {
        if (invertedIndex == null || !invertedIndex.isObject()) return "";
        Map<Integer, String> positions = new TreeMap<>();
        invertedIndex.properties().forEach(entry -> {
            String word = entry.getKey();
            entry.getValue().forEach(idx -> positions.put(idx.asInt(), word));
        });
        return String.join(" ", positions.values());
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

    private List<String> splitSentences(String text) {
        List<String> sentences = new ArrayList<>();
        for (String s : SENTENCE_SPLIT.split(text)) {
            String trimmed = s.strip();
            if (!trimmed.isEmpty()) sentences.add(trimmed);
        }
        return sentences;
    }

    /** Sentences from the document with the highest word-overlap against a
     * specific source's comparison text, so a viewer can see exactly which
     * lines in their document triggered that match. */
    private List<String> topMatchingSentences(List<String> sentences, Set<String> sourceWords) {
        if (sourceWords.isEmpty()) return List.of();
        record Scored(String sentence, double score) {}
        return sentences.stream()
                .map(s -> new Scored(s, overlapPercent(sourceWords, significantWords(s))))
                .filter(s -> s.score() >= 40.0)
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .limit(3)
                .map(Scored::sentence)
                .toList();
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
