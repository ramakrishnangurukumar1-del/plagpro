# ML Service (Flask)

AI-writing detection ensemble:

- **RoBERTa (HC3)** — [`Hello-SimpleAI/chatgpt-detector-roberta`](https://huggingface.co/Hello-SimpleAI/chatgpt-detector-roberta), fine-tuned on the HC3 human-vs-ChatGPT dataset. Primary classifier, both document-level and per-sentence.
- **GPT-2 Perplexity** — lower perplexity (more "predictable" word choices) reads as more AI-like.
- **Burstiness Analysis** — coefficient of variation of sentence length; human writing varies more.
- **Lexical Diversity (TF-IDF proxy)** — type-token ratio; more repetitive phrasing reads as more AI-like.

The two transformer signals are optional at runtime: if the models can't be downloaded (offline, or still fetching on first run), the service falls back to the two statistical signals instead of failing the request. Models are loaded lazily on the first `/analyze` call — the first request after a cold start takes 1-2 minutes to download weights (~600MB, cached afterward under `~/.cache/huggingface`); every request after that is sub-second on CPU.

## Run locally

```
pip install -r requirements.txt
python app.py
```

Listens on `http://localhost:5000`. Check `GET /health` for `modelsLoaded` / `transformersAvailable` status.

## API

`POST /analyze` — body `{"text": "..."}` — returns:
```json
{
  "aiPercent": 49.1,
  "modelScores": [
    {"name": "RoBERTa (HC3)", "score": 97.5},
    {"name": "Burstiness Analysis", "score": 50.0},
    {"name": "Lexical Diversity (TF-IDF proxy)", "score": 0.0},
    {"name": "GPT-2 Perplexity", "score": 0.0}
  ],
  "sentenceScores": [{"text": "...", "aiScore": 98.2}]
}
```
