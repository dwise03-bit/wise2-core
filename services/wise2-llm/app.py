"""WISE² LLM: local-first OpenAI-compatible inference gateway."""
import os
import hmac
import time
import uuid
from typing import Any
import httpx
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="WISE² LLM", version="0.1.0")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
MODEL = os.getenv("WISE2_LLM_MODEL", "qwen2.5:3b")
API_KEY = os.getenv("WISE2_LLM_API_KEY", "")
SYSTEM = "You are WISE², a careful, capable assistant for the WISE² Business OS. Never claim to have executed an action unless a verified tool result confirms it. Do not expose secrets."

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str | None = None
    messages: list[Message] = Field(min_length=1)
    temperature: float = Field(default=0.4, ge=0, le=2)
    stream: bool = False

def authorize(authorization: str | None):
    if not API_KEY:
        raise HTTPException(503, "WISE2_LLM_API_KEY must be configured")
    if not authorization or not hmac.compare_digest(authorization, f"Bearer {API_KEY}"):
        raise HTTPException(401, "Unauthorized")

@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            tags = r.json().get("models", [])
        if not any(m.get("name") == MODEL or m.get("model") == MODEL for m in tags):
            raise HTTPException(503, "Configured model is not installed")
        return {"status": "ok", "runtime": "reachable", "model": MODEL}
    except httpx.HTTPError:
        raise HTTPException(503, "Model runtime unavailable")

@app.get("/v1/models")
async def models(authorization: str | None = Header(default=None)):
    authorize(authorization)
    return {"object": "list", "data": [{"id": MODEL, "object": "model", "owned_by": "wise2"}]}

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest, authorization: str | None = Header(default=None)):
    authorize(authorization)
    if request.stream:
        raise HTTPException(400, "Streaming not supported in v0.1")
    if request.model and request.model != MODEL:
        raise HTTPException(400, "Requested model is not allowlisted")
    messages: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM}]
    for message in request.messages:
        if message.role not in ("system", "user", "assistant"):
            raise HTTPException(400, "Unsupported role")
        if message.role == "system":
            continue
        messages.append(message.model_dump())
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(f"{OLLAMA_URL}/api/chat", json={
                "model": MODEL, "messages": messages,
                "stream": False, "options": {"temperature": request.temperature}
            })
            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, dict) or not isinstance(payload.get("message"), dict) or not isinstance(payload["message"].get("content"), str):
                raise ValueError("Malformed Ollama response")
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, "Model request failed")
    return {
        "id": "chatcmpl-" + uuid.uuid4().hex,
        "object": "chat.completion",
        "created": int(time.time()),
        "model": MODEL,
        "choices": [{"index": 0, "message": {
            "role": "assistant", "content": payload.get("message", {}).get("content", "")
        }, "finish_reason": "stop"}],
        "usage": {
            "prompt_tokens": payload.get("prompt_eval_count", 0),
            "completion_tokens": payload.get("eval_count", 0),
            "total_tokens": payload.get("prompt_eval_count", 0) + payload.get("eval_count", 0)
        }
    }
