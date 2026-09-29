# WISE² Hermes Local AI Integration

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2026-08-23

---

## Overview

WISE² Hermes is a **local-first AI intelligence subsystem** that provides three operating modes for adaptive reasoning:

- **FAST**: Optimized for interactive, responsive conversations
- **DEEP**: Configured for complex analysis and strategic reasoning
- **AUTO**: Intelligent automatic classification based on request characteristics

The system uses **Ollama** as the local LLM provider and **wise2:latest** as the default model, with OpenAI-compatible endpoint support for flexibility.

---

## Architecture

```
WISE² Application
        ↓
Platform API (port 3010)
        ↓
JWT Authentication (required for chat)
        ↓
Hermes Service
        ├─ Generation Config Resolver
        ├─ Auto Classifier (for AUTO mode)
        └─ Ollama Request Builder
        ↓
Ollama (port 11434)
        ↓
wise2:latest Model
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **HermesService** | `hermes.service.ts` | Core chat and action management |
| **HermesController** | `hermes.controller.ts` | HTTP routes, health check |
| **HermesGenerationResolver** | `hermes-generation.config.ts` | Profile resolution, request building |
| **HermesChatDto** | `hermes.dto.ts` | Request/response validation |

---

## Operating Modes

### FAST Mode (Default)

**Use for**: Interactive requests, status checks, simple questions, summaries, business lookups.

**Configuration**:
```
think: false
num_ctx: 4096
num_predict: 1024
timeout: 90s
```

**Performance**: ~8-12 seconds for a typical request.

**Environment Variables**:
```bash
HERMES_FAST_THINK=false
HERMES_FAST_NUM_CTX=4096
HERMES_FAST_NUM_PREDICT=1024
```

### DEEP Mode

**Use for**: Architecture analysis, multi-step planning, root cause investigation, strategic reasoning, complex code analysis.

**Configuration**:
```
think: true
num_ctx: 16384
num_predict: 2048
timeout: 90s
```

**Performance**: 30-60+ seconds (depends on model and request complexity).

**Environment Variables**:
```bash
HERMES_DEEP_THINK=true
HERMES_DEEP_NUM_CTX=16384
HERMES_DEEP_NUM_PREDICT=2048
```

### AUTO Mode

**Deterministic automatic routing** based on request characteristics:

| Indicator | Triggers |
|-----------|----------|
| **FAST** | "quick", "fast", "reply only", "briefly", "status check", "lookup", "simple" |
| **DEEP** | "analyze deeply", "full analysis", "debug this entire", "comprehensive", "root cause", "design the system", "investigate", "reason through" |

**Heuristics**:
- Fast keywords have highest priority (override deep indicators)
- Long message (>500 chars) + long conversation (>8 messages) → DEEP
- Audit/Systems/Projects mode + long conversation (>6 messages) → DEEP
- Default → FAST

---

## API Usage

### Health Check (No Auth Required)

```bash
curl http://localhost:3010/api/v1/hermes/health
```

**Response**:
```json
{
  "status": "online",
  "provider": "ollama",
  "model": "wise2:latest",
  "ollama": {
    "status": "online",
    "endpoint": "http://127.0.0.1:11434"
  },
  "profile": "fast",
  "context": 4096,
  "predictTokens": 1024,
  "think": false
}
```

### Chat Request (JWT Required)

```bash
curl -X POST http://localhost:3010/api/v1/hermes/chat \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Your question here",
    "mode": "executive",
    "profile": "fast",
    "messages": [
      {"role": "user", "content": "Previous message"},
      {"role": "assistant", "content": "Previous response"}
    ]
  }'
```

**Parameters**:
- `message` (required): User input (max 12,000 chars)
- `mode` (optional): `executive` | `audit` | `sales` | `projects` | `support` | `systems`
- `profile` (optional): `fast` | `deep` | `auto` (default: `auto`)
- `messages` (optional): Conversation history (last 10 kept)

**Response**:
```json
{
  "response": "The AI response",
  "mode": "executive",
  "model": "wise2:latest",
  "profile": "fast",
  "provider": "ollama",
  "durationMs": 8750,
  "sources": [],
  "evidenceStatus": "conversation-only"
}
```

---

## Environment Configuration

### Required Variables

```bash
# JWT authentication
JWT_SECRET=<generate-strong-secret>

# Model & Endpoint
OLLAMA_CHAT_MODEL=wise2:latest
HERMES_ENDPOINT=http://127.0.0.1:11434/api/chat
# OR for OpenAI-compatible endpoints:
# HERMES_ENDPOINT=http://localhost:8000/v1/chat/completions

# General timeout
HERMES_TIMEOUT_MS=90000
```

### Optional FAST Mode Tuning

```bash
HERMES_FAST_THINK=false
HERMES_FAST_NUM_CTX=4096
HERMES_FAST_NUM_PREDICT=1024
```

### Optional DEEP Mode Tuning

```bash
HERMES_DEEP_THINK=true
HERMES_DEEP_NUM_CTX=16384
HERMES_DEEP_NUM_PREDICT=2048
```

---

## Development & Testing

### Unit Tests

```bash
pnpm --filter @wise2/platform-api test hermes-generation.config.spec.ts
```

**Coverage**:
- Profile resolution (FAST, DEEP)
- AUTO classification heuristics
- Request body building (Ollama native vs OpenAI-compatible)
- Environment variable parsing

### Manual Testing

**1. Health Check**:
```bash
curl http://localhost:3010/api/v1/hermes/health | jq
```

**2. Create Test User**:
```bash
TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test-'$(date +%s)'@example.com","password":"TestPass123!"}' | jq -r '.accessToken')

echo "Token: $TOKEN"
```

**3. Test FAST Mode**:
```bash
curl -s -X POST http://localhost:3010/api/v1/hermes/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Quick status check. Reply: FAST","profile":"fast"}' | jq
```

**4. Test DEEP Mode**:
```bash
curl -s -X POST http://localhost:3010/api/v1/hermes/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Investigate root cause. Reply: DEEP","profile":"deep"}' | jq
```

**5. Test AUTO Mode**:
```bash
curl -s -X POST http://localhost:3010/api/v1/hermes/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What time is it? Reply: AUTO","profile":"auto"}' | jq
```

---

## Performance Benchmarks

Baseline measurements on warm Ollama instance:

| Profile | Message | Duration | Model | Notes |
|---------|---------|----------|-------|-------|
| FAST | "Reply: FAST ONLINE" | ~8-12s | wise2:latest | No thinking, 4K context |
| DEEP | "Reply: DEEP ONLINE" | ~30-60s | wise2:latest | With thinking, 16K context |
| AUTO (fast path) | Short simple query | ~8-12s | wise2:latest | Auto-routed to FAST |

**Factors affecting latency**:
- Model warm-up (first request is slower)
- Response length
- System load
- Context window size
- Thinking enabled (DEEP mode)

---

## Known Issues & Limitations

### DEEP Mode Timeout

DEEP mode with complex requests may exceed the 90-second timeout. Solutions:

1. **Increase timeout** (adjust `HERMES_TIMEOUT_MS`):
   ```bash
   HERMES_TIMEOUT_MS=120000  # 2 minutes
   ```

2. **Reduce context** (smaller DEEP context):
   ```bash
   HERMES_DEEP_NUM_CTX=8192
   ```

3. **Reduce prediction length**:
   ```bash
   HERMES_DEEP_NUM_PREDICT=1024
   ```

### OpenAI-Compatible Endpoints

Ollama-native parameters (`think`, `options.num_ctx`, `options.num_predict`) are **not supported** on OpenAI-compatible endpoints. Hermes automatically detects and uses appropriate parameter sets for each provider.

### Model Availability

If the configured model is not available in Ollama, the health endpoint will show "offline" status. Ensure the model exists:

```bash
curl http://localhost:11434/api/tags | jq .models
```

---

## Troubleshooting

### "Hermes inference unavailable: connection failed"

**Cause**: Ollama is not running or not reachable.

**Solution**:
```bash
# Check Ollama status
curl http://127.0.0.1:11434/api/tags

# Start Ollama (macOS):
ollama serve

# Start Ollama (Docker):
docker run -d -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
ollama pull wise2:latest
```

### "Hermes inference returned no response"

**Cause**: Model generated empty response or parsing failed.

**Solution**:
1. Verify model loads: `curl http://127.0.0.1:11434/api/tags`
2. Test model directly: `curl -X POST http://127.0.0.1:11434/api/chat -d '...'`
3. Reduce context or increase timeout

### Requests timeout

**Cause**: Response generation exceeds `HERMES_TIMEOUT_MS`.

**Solution**:
1. Increase timeout (see DEEP Mode Timeout section)
2. Use FAST mode for time-sensitive requests
3. Reduce context size
4. Ensure Ollama has sufficient resources

### "Invalid credentials" on health check

The health endpoint doesn't require auth. If you're getting 401:

1. Check route is `/v1/hermes/health` (no auth decorator)
2. Check nginx routing if behind proxy
3. Verify JWT_SECRET matches signing key

---

## Architecture Decisions

### Why wise2:latest?

Measured benchmarks (2026-08-23):
- wise2:latest: 6.46s (BEST)
- qwen3.5:4b: 15.87s
- wise2-fast:latest: 53-203s (cold start issues)

Despite "fast" in the name, benchmarks show wise2:latest is actually fastest. Model names can be misleading; always measure.

### Why Ollama-first?

1. **Local execution**: No cloud costs, no data leaving the machine
2. **Privacy**: Sensitive business conversations stay local
3. **No vendor lock-in**: Easy to switch models
4. **Offline capability**: Works without internet
5. **Cost**: Runs on modest hardware (8GB+ RAM)

### Why separate FAST/DEEP modes?

One-size-fits-all settings waste resources (over-configuring for rare complex tasks) or frustrate users (under-configuring for common interactions). Adaptive configuration delivers:

1. **Better UX**: Responsive everyday experience
2. **Cost efficiency**: Right-sized resources per task
3. **Observability**: Easy to measure mode effectiveness
4. **Tuning flexibility**: Optimize independently by use case

### Why AUTO over manual routing?

Automatic classification:
1. **Transparent**: Users get good defaults without configuration
2. **Lightweight**: No LLM call needed (heuristics only)
3. **Predictable**: Deterministic logic (no randomness)
4. **Overrideable**: Users can still specify profile explicitly

---

## Future Enhancements

- [ ] **Streaming responses** (POST `/hermes/chat/stream`)
- [ ] **Model switching** (configure alternative models per profile)
- [ ] **Cost tracking** (log token usage per profile)
- [ ] **A/B testing** (measure profile performance differences)
- [ ] **Fine-tuned AUTO classifier** (learn from user feedback)
- [ ] **Caching** (cache responses to common questions)
- [ ] **Rate limiting** (prevent abuse of expensive DEEP mode)

---

## References

- [Ollama Documentation](https://github.com/ollama/ollama)
- [WISE² Platform API](./API.md)
- [WISE² Architecture](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)

---

**For questions or issues, contact**: dwise03@gmail.com
