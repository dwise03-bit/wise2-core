FROM python:3.11-slim

RUN groupadd -r judge && useradd -r -g judge judge

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt

COPY src/judge.py .
COPY src/questions.py .

RUN chown -R judge:judge /app

USER judge

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

CMD ["uvicorn", "judge:app", "--host", "0.0.0.0", "--port", "8080"]
