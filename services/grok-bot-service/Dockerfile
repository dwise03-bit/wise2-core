FROM python:3.11-alpine

RUN addgroup -S bot && adduser -S bot -G bot

WORKDIR /app

COPY requirements.txt .
RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev && \
    pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del gcc musl-dev libffi-dev openssl-dev

COPY src/ ./src/

RUN chown -R bot:bot /app

USER bot

ENV PYTHONUNBUFFERED=1
ENV JUDGE_URL=http://judge:8080
ENV BOOK_DB_PATH=/data/desk.db

VOLUME ["/data"]

CMD ["python", "src/main.py"]
