FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN pip install --no-cache-dir fastapi==0.115.12 uvicorn==0.34.2
COPY app.py /app/app.py
RUN useradd -u 10001 -m appuser && mkdir -p /data/input /data/output && chown -R appuser:appuser /data
USER appuser
EXPOSE 8094
CMD ["uvicorn","app:app","--host","0.0.0.0","--port","8094"]
