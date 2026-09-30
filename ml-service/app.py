"""
AI-writing detection service.

Ensemble of:
  - RoBERTa fine-tuned on HC3 (human vs. ChatGPT) - primary classifier
  - GPT-2 perplexity - lower perplexity reads as more "predictable" / AI-like
  - Burstiness analysis - sentence-length variation (statistical, no model)
  - Lexical diversity - type-token ratio (statistical, no model)

The two transformer signals are optional: if the models can't be
downloaded (no internet / first run still fetching), the service
degrades gracefully to the statistical-only signals rather than
failing the whole request.
"""
import math
import os
import re
import statistics
import threading

import torch
from flask import Flask, jsonify, request

app = Flask(__name__)

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
WORD_SPLIT = re.compile(r"[A-Za-z']+")

_models_lock = threading.Lock()
_models = {"loaded": False, "roberta": None, "roberta_tok": None, "gpt2": None, "gpt2_tok": None}


def load_models():
    """Lazily load transformer models on first request so the server
    starts instantly; subsequent requests reuse the cached models.
    RoBERTa and GPT-2 are loaded independently so a failure in one
    (e.g. a memory-constrained machine choking on GPT-2) doesn't take
    the other down with it."""
    with _models_lock:
        if _models["loaded"]:
            return

        from transformers import (
            AutoModelForSequenceClassification,
            AutoTokenizer,
            GPT2LMHeadModel,
            GPT2TokenizerFast,
        )

        try:
            roberta_name = "Hello-SimpleAI/chatgpt-detector-roberta"
            _models["roberta_tok"] = AutoTokenizer.from_pretrained(roberta_name)
            _models["roberta"] = AutoModelForSequenceClassification.from_pretrained(
                roberta_name, low_cpu_mem_usage=True
            )
            _models["roberta"].eval()
        except Exception as e:
            app.logger.warning("RoBERTa unavailable, dropping that signal: %s", e)
            _models["roberta"] = None
            _models["roberta_tok"] = None

        # On memory-constrained hosts (e.g. a 512MB free tier), loading both
        # RoBERTa and GPT-2 in the same process risks an OOM kill - which is
        # a SIGKILL from the OS, not a catchable Python exception, so no
        # amount of try/except here saves it. ENABLE_GPT2=false lets a
        # constrained deployment skip GPT-2 entirely and keep RoBERTa (the
        # primary signal) working reliably instead of crashing the process.
        if os.environ.get("ENABLE_GPT2", "true").lower() == "false":
            app.logger.info("GPT-2 disabled via ENABLE_GPT2=false")
            _models["gpt2"] = None
            _models["gpt2_tok"] = None
        else:
            try:
                _models["gpt2_tok"] = GPT2TokenizerFast.from_pretrained("gpt2")
                _models["gpt2"] = GPT2LMHeadModel.from_pretrained("gpt2")
                _models["gpt2"].eval()
            except Exception as e:
                app.logger.warning("GPT-2 unavailable, dropping that signal: %s", e)
                _models["gpt2"] = None
                _models["gpt2_tok"] = None

        _models["loaded"] = True


def split_sentences(text):
    sentences = [s.strip() for s in SENTENCE_SPLIT.split(text) if s.strip()]
    return sentences if sentences else ([text.strip()] if text.strip() else [])


def words_of(text):
    return WORD_SPLIT.findall(text.lower())


def burstiness_score(sentences):
    lengths = [len(words_of(s)) for s in sentences if words_of(s)]
    if len(lengths) < 2:
        return 50.0
    mean = statistics.mean(lengths)
    if mean == 0:
        return 50.0
    stdev = statistics.pstdev(lengths)
    cv = stdev / mean
    return round(max(0.0, min(100.0, 100.0 * (1.0 - min(cv, 1.0)))), 1)


def lexical_diversity_score(text):
    words = words_of(text)
    if not words:
        return 50.0
    unique = len(set(words))
    ttr = unique / len(words)
    return round(max(0.0, min(100.0, 100.0 * (1.0 - min(ttr / 0.65, 1.0)))), 1)


def sentence_heuristic_score(sentence, mean_len, spread):
    length = len(words_of(sentence))
    if spread == 0:
        return 50.0
    deviation = abs(length - mean_len) / spread
    return round(max(0.0, min(100.0, 100.0 * (1.0 - min(deviation, 1.0)))), 1)


@torch.no_grad()
def roberta_ai_probability(text):
    """Returns 0-100 probability the text is AI-generated, per-sentence
    probabilities too, or None if the model isn't available."""
    if _models["roberta"] is None:
        return None, {}

    tok = _models["roberta_tok"]
    model = _models["roberta"]
    inputs = tok(text, return_tensors="pt", truncation=True, max_length=512)
    logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=-1)[0]

    id2label = model.config.id2label
    ai_index = next(
        (i for i, label in id2label.items() if "chatgpt" in label.lower() or "ai" in label.lower() or "1" in str(label)),
        1,
    )
    ai_prob = float(probs[ai_index]) * 100.0
    return round(ai_prob, 1), {}


@torch.no_grad()
def sentence_roberta_score(sentence):
    if _models["roberta"] is None:
        return None
    tok = _models["roberta_tok"]
    model = _models["roberta"]
    inputs = tok(sentence, return_tensors="pt", truncation=True, max_length=256)
    logits = model(**inputs).logits
    probs = torch.softmax(logits, dim=-1)[0]
    id2label = model.config.id2label
    ai_index = next(
        (i for i, label in id2label.items() if "chatgpt" in label.lower() or "ai" in label.lower() or "1" in str(label)),
        1,
    )
    return round(float(probs[ai_index]) * 100.0, 1)


@torch.no_grad()
def gpt2_perplexity_score(text):
    """Lower perplexity (more predictable text) -> higher AI-likelihood score.
    Returns a 0-100 score, or None if the model isn't available."""
    if _models["gpt2"] is None:
        return None

    tok = _models["gpt2_tok"]
    model = _models["gpt2"]
    encodings = tok(text, return_tensors="pt", truncation=True, max_length=512)
    input_ids = encodings.input_ids
    if input_ids.shape[1] < 2:
        return None

    outputs = model(input_ids, labels=input_ids)
    perplexity = math.exp(min(outputs.loss.item(), 20))

    # Empirically, human text often sits ~30-80 ppl on gpt2, AI text lower (~10-30).
    # Map perplexity down to a 0-100 "AI-likelihood" score (lower ppl -> higher score).
    score = max(0.0, min(100.0, 100.0 * (1.0 - min(perplexity / 60.0, 1.0))))
    return round(score, 1)


@app.get("/health")
def health():
    return jsonify(
        status="ok",
        modelsLoaded=_models["loaded"],
        robertaAvailable=_models["roberta"] is not None,
        gpt2Available=_models["gpt2"] is not None,
    )


@app.post("/analyze")
def analyze():
    load_models()

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

    model_scores = [
        {"name": "Burstiness Analysis", "score": burstiness},
        {"name": "Lexical Diversity (TF-IDF proxy)", "score": diversity},
    ]
    weighted = [(burstiness, 0.3), (diversity, 0.2)]

    roberta_score, _ = roberta_ai_probability(text)
    if roberta_score is not None:
        model_scores.insert(0, {"name": "RoBERTa (HC3)", "score": roberta_score})
        weighted.append((roberta_score, 0.35))

    perplexity_score = gpt2_perplexity_score(text)
    if perplexity_score is not None:
        model_scores.append({"name": "GPT-2 Perplexity", "score": perplexity_score})
        weighted.append((perplexity_score, 0.15))

    total_weight = sum(w for _, w in weighted)
    ai_percent = round(sum(s * w for s, w in weighted) / total_weight, 1) if total_weight else 0.0

    sentence_scores = []
    for s in sentences:
        rscore = sentence_roberta_score(s) if _models["roberta"] is not None else None
        hscore = sentence_heuristic_score(s, mean_len, spread)
        combined = round((rscore * 0.7 + hscore * 0.3), 1) if rscore is not None else hscore
        sentence_scores.append({"text": s, "aiScore": combined})

    return jsonify(
        aiPercent=ai_percent,
        modelScores=model_scores,
        sentenceScores=sentence_scores,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
