# WISE² LLM v0.1

Local-first OpenAI-compatible chat gateway backed by Ollama. Initial implementation; not yet production-verified.

## Run

```bash
cd services/wise2-llm
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
ollama pull qwen2.5:3b
export WISE2_LLM_API_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
export WISE2_LLM_MODEL=qwen2.5:3b
uvicorn app:app --host 127.0.0.1 --port 8132
```

Set OLLAMA_URL if Ollama runs on a different host. Keep the gateway bound to loopback; use an authenticated proxy or private network for remote access. Store API keys in a secrets manager, not git. Never expose Ollama directly to the internet.

## Test

```bash
curl -fsS http://127.0.0.1:8132/health
curl -fsS http://127.0.0.1:8132/v1/chat/completions -H "Authorization: Bearer $WISE2_LLM_API_KEY" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Introduce yourself"}]}'
```

## Limits

No streaming, tool execution, RAG, tenancy, or fine-tuning in v0.1. The service does not autonomously deploy, trade, or execute commands. Verify performance on target hardware before production rollout.
