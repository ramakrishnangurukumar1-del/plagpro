FROM python:3.11-slim
WORKDIR /app

# CPU-only torch wheel keeps the image much smaller than the default CUDA build.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV PORT=5000
EXPOSE 5000

# Single worker: the transformer models are loaded once per process and are
# memory-heavy, so extra workers would multiply RAM use for no benefit here.
# A long timeout covers the first request's model-loading cold start.
CMD gunicorn --bind 0.0.0.0:${PORT} --workers 1 --threads 4 --timeout 180 app:app
