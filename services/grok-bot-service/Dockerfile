FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

ENV PYTHONUNBUFFERED=1
ENV JUDGE_URL=http://judge:8080
ENV BOOK_DB_PATH=/data/desk.db

VOLUME ["/data"]

CMD ["python", "src/main.py"]
