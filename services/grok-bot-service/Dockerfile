FROM python:3.11-slim

RUN groupadd -r bot && useradd -r -g bot bot

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

RUN chown -R bot:bot /app

USER bot

ENV PYTHONUNBUFFERED=1
ENV JUDGE_URL=http://judge:8080
ENV BOOK_DB_PATH=/data/desk.db

VOLUME ["/data"]

CMD ["python", "src/main.py"]
