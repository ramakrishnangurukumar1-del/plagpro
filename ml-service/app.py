"""
Lightweight AI-writing heuristic service.

This is intentionally a simple, CPU-only, no-GPU-needed baseline —
two statistical signals over the raw text, no transformer models yet.
RoBERTa/BERT/GPT-2-perplexity/BART can be swapped in later behind the
same /analyze contract without touching the Java caller.
"""
import re
import statistics

from flask import Flask, jsonify, request

app = Flask(__name__)

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
WORD_SPLIT = re.compile(r"[A-Za-z']+")


def split_sentences(text):
    sentences = [s.strip() for s in SENTENCE_SPLIT.split(text) if s.strip()]
    return sentences if sentences else ([text.strip()] if text.strip() else [])


def words_of(text):
    return WORD_SPLIT.findall(text.lower())


def burstiness_score(sentences):
    """Coefficient of variation of sentence length (in words).
    Human writing tends to vary sentence length more; AI text is more
    uniform. Lower variation -> higher AI-likelihood score."""
    lengths = [len(words_of(s)) for s in sentences if words_of(s)]
    if len(lengths) < 2:
        return 50.0
    mean = statistics.mean(lengths)
    if mean == 0:
        return 50.0
    stdev = statistics.pstdev(lengths)
    cv = stdev / mean
    # Map CV (~0 = uniform/AI-like, ~1+ = varied/human-like) to a 0-100 AI score.
    score = max(0.0, min(100.0, 100.0 * (1.0 - min(cv, 1.0))))
    return round(score, 1)


def lexical_diversity_score(text):
    """Type-token ratio (unique words / total words) as a repetition proxy.
    Lower diversity (more repetitive phrasing) -> higher AI-likelihood score."""
    words = words_of(text)
    if not words:
        return 50.0
    unique = len(set(words))
    ttr = unique / len(words)
    # Typical human TTR for a few paragraphs sits around 0.5-0.7; below that
    # reads as more repetitive/formulaic.
    score = max(0.0, min(100.0, 100.0 * (1.0 - min(ttr / 0.65, 1.0))))
    return round(score, 1)


def sentence_score(sentence, mean_len, spread):
    """A sentence very close to the document's mean length reads as more
    uniform / AI-like than one that deviates a lot."""
    length = len(words_of(sentence))
    if spread == 0:
        return 50.0
    deviation = abs(length - mean_len) / spread
    score = max(0.0, min(100.0, 100.0 * (1.0 - min(deviation, 1.0))))
    return round(score, 1)


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()

    if not text:
        return jsonify(aiPercent=0.0, modelScores=[], sentenceScores=[])

    sentences = split_sentences(text)
    lengths = [len(words_of(s)) for s in sentences if words_of(s)]
    mean_len = statistics.mean(lengths) if lengths else 0
    spread = statistics.pstdev(lengths) if len(lengths) > 1 else 1

    burstiness = burstiness_score(sentences)
    diversity = lexical_diversity_score(text)
    ai_percent = round((burstiness * 0.55) + (diversity * 0.45), 1)

    model_scores = [
        {"name": "Burstiness Analysis", "score": burstiness},
        {"name": "Lexical Diversity (TF-IDF proxy)", "score": diversity},
    ]

    sentence_scores = [
        {"text": s, "aiScore": sentence_score(s, mean_len, spread)}
        for s in sentences
    ]

    return jsonify(
        aiPercent=ai_percent,
        modelScores=model_scores,
        sentenceScores=sentence_scores,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
