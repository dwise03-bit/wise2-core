#!/usr/bin/env python3
"""WISE²-compatible API for the fine-tuned MusicGen-small model on gpu-nmls."""

import os
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

import torch
import torchaudio
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from transformers import AutoProcessor, MusicgenForConditionalGeneration

MODEL_PATH = os.environ.get("MUSICGEN_MODEL_PATH", "/home/dwise/wise2-musicgen-v1/epoch_1")
OUTPUT_DIR = Path(os.environ.get("MUSICGEN_OUTPUT_DIR", "/tmp/musicgen-outputs"))
SAMPLE_RATE = 16000
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
app = FastAPI(title="WISE² MusicGen API", version="2.0")
generation_lock = threading.Lock()
results: dict[str, dict] = {}

model = MusicgenForConditionalGeneration.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
).to(DEVICE)
processor = AutoProcessor.from_pretrained(MODEL_PATH)
model.eval()


class GenerationRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1000)
    duration: int = Field(default=20, ge=5, le=30)
    genre: str | None = None
    mood: str | None = None
    tempo: int | None = None
    temperature: float = Field(default=1.0, gt=0, le=2)
    seed: int | None = None


@app.get("/health")
def health():
    return {"status": "ok", "model": "wise2-musicgen-small", "device": DEVICE}


@app.post("/api/v1/generate")
def generate(request: GenerationRequest):
    generation_id = uuid.uuid4().hex[:12]
    created_at = datetime.now(timezone.utc).isoformat()
    prompt_parts = [request.prompt, request.genre, request.mood]
    conditioned_prompt = ", ".join(part for part in prompt_parts if part)

    try:
        with generation_lock:
            if request.seed is not None:
                torch.manual_seed(request.seed)
                if DEVICE == "cuda":
                    torch.cuda.manual_seed_all(request.seed)
            inputs = processor(text=conditioned_prompt, return_tensors="pt").to(DEVICE)
            with torch.inference_mode():
                audio = model.generate(
                    **inputs,
                    do_sample=True,
                    temperature=request.temperature,
                    max_new_tokens=request.duration * 50,
                )
            output_path = OUTPUT_DIR / f"{generation_id}.wav"
            waveform = audio.float().cpu()
            if waveform.ndim == 3:
                waveform = waveform[0]
            torchaudio.save(str(output_path), waveform, SAMPLE_RATE)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    result = {
        "generation_id": generation_id,
        "prompt": request.prompt,
        "duration": request.duration,
        "sample_rate": SAMPLE_RATE,
        "genre": request.genre,
        "mood": request.mood,
        "timestamp": created_at,
        "download_url": f"/api/v1/download/{generation_id}",
        "status": "completed",
    }
    results[generation_id] = result
    return result


@app.get("/api/v1/result/{generation_id}")
def result(generation_id: str):
    result_data = results.get(generation_id)
    if result_data is None:
        raise HTTPException(status_code=404, detail="Generation not found")
    return result_data


@app.get("/api/v1/download/{generation_id}")
def download(generation_id: str):
    output_path = OUTPUT_DIR / f"{generation_id}.wav"
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(output_path, media_type="audio/wav", filename=output_path.name)
