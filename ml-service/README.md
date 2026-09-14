# ML Service (Flask)

Lightweight, CPU-only AI-writing heuristic — no GPU or model downloads
needed. Two statistical signals (sentence-length burstiness + lexical
diversity) combined into one score, per the "simple heuristic first"
plan. RoBERTa/BERT/GPT-2-perplexity/BART can be swapped in later behind
the same `/analyze` contract.

## Run locally

```
pip install -r requirements.txt
python app.py
```

Listens on `http://localhost:5000`.

## API

`POST /analyze` — body `{"text": "..."}` — returns:
```json
{
  "aiPercent": 27.5,
  "modelScores": [{"name": "Burstiness Analysis", "score": 50.0}, ...],
  "sentenceScores": [{"text": "...", "aiScore": 100.0}, ...]
}
```
