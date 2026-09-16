# WISE² Local AI Router - MacBook Integration Guide

## Overview

The Local AI Router automatically routes AI queries between your MacBook (local) and GPU-NMLS VPS based on:
- Query complexity detection
- Mac responsiveness checks
- Explicit user routing preferences

## Prerequisites

### 1. Ollama on MacBook

Ollama must be running on your Mac at `localhost:11434`.

**Check status:**
```bash
curl http://localhost:11434/api/tags
```

**Start Ollama (if not running):**
```bash
# If installed via brew:
brew services start ollama

# Or launch directly:
/usr/local/bin/ollama serve
```

### 2. Available Models on Mac

The following models are available via Ollama:

| Model | Use Case | Speed | Notes |
|-------|----------|-------|-------|
| `wise2-fast-m4` | Default (fast) | ⚡⚡⚡ | Optimized for speed, multi-capability |
| `wise2-coder-m4` | Code generation | ⚡⚡ | Specialized for programming tasks |
| `wise2-vision-m4` | Vision + text | ⚡⚡ | Can process images |
| `wise2-m4` | General purpose | ⚡⚡ | Full capabilities |
| `qwen2.5-coder:7b` | Code generation | ⚡⚡ | 7B parameter model |
| `qwen3.5:4b` | Lightweight | ⚡⚡⚡ | 4.7B, fastest |
| `gemma4:12b-mlx` | Advanced | ⚡ | 12B, most capable |

## Configuration

### Environment Variables

Set these in your `.env.local` file (create if missing in `apps/command-center/`):

```bash
# Ollama endpoints
LOCAL_AI_MAC_ENDPOINT=http://localhost:11434
LOCAL_AI_VPS_ENDPOINT=http://173.208.147.165:11434

# Model selection (default: wise2-fast-m4)
OLLAMA_MODEL=wise2-fast-m4

# Request timeout in milliseconds (default: 30000)
QUERY_TIMEOUT_MS=30000
```

### Change Model

To use a different model, update `OLLAMA_MODEL`:

```bash
OLLAMA_MODEL=wise2-coder-m4    # For code tasks
OLLAMA_MODEL=wise2-vision-m4   # For vision tasks
OLLAMA_MODEL=qwen3.5:4b        # For lightweight/fast
```

## Usage

### 1. Start the Command Center

```bash
cd ~/Projects/wise2-core
npm --prefix apps/command-center run dev
# Runs on http://localhost:3004
```

### 2. Navigate to Local AI Router

- Open http://localhost:3004/local-ai
- Or click "Local AI Router" in the Intelligence section of the sidebar

### 3. Submit Queries

**Three routing modes:**

- **Smart Router (AUTO)** - Automatically chooses based on:
  - Query complexity (word count, code presence, context length)
  - Mac health (checks every 5 seconds)
  - Routes simple queries to Mac (fast), complex to VPS

- **Mac Local (Ollama)** - Always use local Mac
  - Best for simple questions, exploration
  - Keeps your Mac responsive
  - Instant responses (no network latency)

- **VPS GPU (NMLS)** - Always use GPU server
  - For heavy/complex workloads
  - Better for long contexts, reasoning tasks
  - More powerful but network latency

## Routing Logic

### AUTO Routing Decision Tree

```
Query submitted with AUTO mode
    ↓
[Check query complexity]
    ├─ Code present? → COMPLEX
    ├─ 3D/ML keywords? → COMPLEX
    ├─ > 500 chars? → COMPLEX
    ├─ > 100 words? → COMPLEX
    └─ Else → SIMPLE
    ↓
[Check Mac health]
    ├─ Mac responsive? 
    │   ├─ YES + SIMPLE → Route to Mac
    │   └─ NO or COMPLEX → Route to VPS
    └─ Timeout after 1.5s
    ↓
[Execute on selected endpoint]
```

### Caching

- Mac health check cached for 5 seconds
- Prevents repeated 1.5s checks on every request
- Cache invalidates after 5s (will re-check)

## Troubleshooting

### "Model 'wise2-fast-m4' not found on Ollama"

**Solution:** Install the model
```bash
ollama pull wise2-fast-m4
```

### "Network error connecting to localhost:11434. Is Ollama running?"

**Solution:** Start Ollama
```bash
# Check if running:
curl http://localhost:11434/api/tags

# Start if not running:
brew services start ollama
```

### "Network error connecting to http://173.208.147.165:11434"

**Solution:** VPS is unreachable or offline. Either:
- Wait for VPS to come back online, or
- Use "Mac Local (Ollama)" mode explicitly

### Slow responses on Mac

**Solution:** Switch to a faster model
```bash
# In .env.local:
OLLAMA_MODEL=qwen3.5:4b    # Fastest on M-series Mac
```

Or use VPS GPU mode for complex queries.

### Queries timeout after 30 seconds

**Solution:** Increase timeout or use a faster model
```bash
# In .env.local:
QUERY_TIMEOUT_MS=60000    # 60 seconds
OLLAMA_MODEL=qwen3.5:4b   # Faster model
```

## Performance Tips

### For Speed

1. Use `qwen3.5:4b` or `wise2-fast-m4` (fastest)
2. Use "Mac Local" mode for simple questions
3. Keep queries concise
4. Avoid complex multi-step prompts on Mac

### For Accuracy

1. Use `wise2-m4` or `wise2-coder-m4` (most capable)
2. Use "VPS GPU" mode for important queries
3. Provide detailed context when available

### For Vision Tasks

1. Use `wise2-vision-m4` or `gemma4:12b-mlx`
2. Set `OLLAMA_MODEL=wise2-vision-m4` in `.env.local`
3. Use VPS mode for large images (slower upload over network)

## API Endpoints

### POST `/api/local-ai/query`

Submit a query to the Local AI Router.

**Request:**
```json
{
  "query": "What is Node.js?",
  "route": "auto"
}
```

**Parameters:**
- `query` (string, required): The question or prompt
- `route` (string, default: "auto"): Routing mode - "auto", "mac", or "vps"

**Response:**
```json
{
  "response": "Node.js is...",
  "routeUsed": "mac",
  "endpoint": "http://localhost:11434",
  "model": "wise2-fast-m4",
  "tokensUsed": 142
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Invalid request (missing query, invalid route mode)
- `413` - Query exceeds 10,000 character limit
- `502` - Bad Gateway (Ollama error)
- `503` - Service Unavailable (Ollama offline)
- `500` - Server error

## Monitoring

### View Request Logs

Watch the dev server console for telemetry:

```
[LocalAI] Query routed to mac (127ms)
[LocalAI] Error (2034ms): Network error connecting to http://localhost:11434...
```

**Logged info:**
- Route used (mac/vps)
- Duration
- Model name
- Tokens used
- Query length

### Check Mac Health

```bash
# Manual health check:
curl http://localhost:11434/api/tags | jq '.models | length'
```

Should return the number of installed models (e.g., `10`).

## Advanced Configuration

### Custom Mac Endpoint

If Ollama runs on a different port:

```bash
# In .env.local:
LOCAL_AI_MAC_ENDPOINT=http://localhost:12345
```

### Custom VPS Endpoint

If using a different GPU server:

```bash
# In .env.local:
LOCAL_AI_VPS_ENDPOINT=http://gpu-server.example.com:11434
```

### Increase Query Timeout

For slower connections or large queries:

```bash
# In .env.local:
QUERY_TIMEOUT_MS=60000    # 60 seconds (default: 30 seconds)
```

## Architecture

```
┌─────────────────────┐
│  Command Center     │
│  Local AI Router UI │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Next.js API Route                  │
│  /api/local-ai/query                │
│  - Input validation                 │
│  - Complexity detection             │
│  - Mac health check (cached 5s)     │
│  - Routing decision                 │
│  - Error handling & logging         │
└──────────┬────────────────────────┬─┘
           │                        │
      SIMPLE & HEALTHY      COMPLEX or OFFLINE
           │                        │
           ↓                        ↓
┌──────────────────────┐   ┌──────────────────────┐
│  Mac Local           │   │  VPS GPU             │
│  Ollama              │   │  Ollama              │
│  localhost:11434     │   │  173.208.147.165     │
│                      │   │                      │
│  Models:             │   │  Models:             │
│  - wise2-fast-m4     │   │  - Any Ollama model  │
│  - wise2-coder-m4    │   │  - Access via VPN    │
│  - wise2-vision-m4   │   │                      │
│  - qwen3.5:4b        │   │  More powerful       │
└──────────────────────┘   └──────────────────────┘
           │                        │
           └────────────┬───────────┘
                        ↓
           ┌────────────────────────┐
           │  Response to UI        │
           │  - Text response       │
           │  - Route used          │
           │  - Model name          │
           │  - Tokens consumed     │
           └────────────────────────┘
```

## Security Notes

1. **Local queries**: Ollama runs on `localhost:11434` (no external access)
2. **VPS queries**: Routed over secure network (Tailscale)
3. **No auth on Ollama**: Assumes trusted local network
4. **Input validation**: 10,000 char limit prevents abuse
5. **Error messages**: Safe, don't leak internal details

## Support

For issues or questions:

1. Check Troubleshooting section above
2. Verify Ollama is running: `curl http://localhost:11434/api/tags`
3. Check available models: `ollama list`
4. View server logs: Watch dev server console output
5. Review request logs for duration and routing decisions

## Next Steps

1. ✅ Configure your preferred model in `.env.local`
2. ✅ Start the Command Center dev server
3. ✅ Navigate to Local AI Router at `/local-ai`
4. ✅ Test queries in all three routing modes
5. ✅ Monitor performance and adjust model/timeout as needed

---

**Last Updated:** 2026-09-16  
**Status:** Production Ready  
**Integration:** MacBook Local Ollama ✅ VPS GPU Server ⏳
