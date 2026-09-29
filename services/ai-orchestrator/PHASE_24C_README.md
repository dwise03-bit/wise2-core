# WISE² Phase 24C: Free Model Adaptive Intelligence

## Overview

Phase 24C implements **FREE-FIRST AI model routing** for Hermes and Second Brain. WISE² can now:

1. **Auto-discover** available AI models (local Ollama, cloud providers)
2. **Dynamically route** requests to the best available free model
3. **Automatically fallback** if the primary model fails
4. **Prevent surprise costs** with strict FREE-FIRST policy
5. **Track health** and disable broken models

## Architecture

```
User Request → Hermes Router
  ↓
Task Classification (coding/reasoning/general/rag/fast)
  ↓
Model Registry Query
  ↓
Dynamic Scoring
  ↓
Route to Best FREE Model
  ↓
Execute with Fallback Chain
  ↓
Record Performance
```

## Components

### ModelRegistry (`src/models/ModelRegistry.ts`)

Discovers and tracks available models.

**Responsibilities:**
- Queries Ollama for available models
- Registers model capabilities (coding, reasoning, speed, etc.)
- Tracks performance metrics (success rate, latency)
- Implements circuit breaker (disable after 3 failures)
- Persists registry to disk

**Example:**
```typescript
const registry = new ModelRegistry();
await registry.initialize();

const freeModels = registry.getAvailableFreeModels();
const stats = registry.getStats();
```

### DynamicModelRouter (`src/models/DynamicModelRouter.ts`)

Selects the best model for a given task.

**Scoring factors:**
- Task alignment (0.3 weight)
- Capability match (0.2 weight)
- Success rate (0.2 weight)
- Latency preference (0.15 weight)
- Context efficiency (0.15 weight)

**Example:**
```typescript
const router = new DynamicModelRouter(registry, 'FREE-FIRST');

const routing = router.route({
  task: 'coding',
  contextSize: 2000,
  requiresStructuredOutput: true,
});

console.log(routing.primary.displayName); // "Qwen 2.5 Coder"
console.log(routing.fallbacks.map(m => m.displayName)); // ["Llama 3", "Mistral"]
console.log(routing.costEstimate); // 0 (all free models)
```

### HermesAdaptiveAgent (`src/hermes/HermesAdaptiveAgent.ts`)

Main agent combining registry, router, and execution.

**Features:**
- Task intent classification
- Model execution with error handling
- Automatic fallback on failure
- Response validation
- Performance recording

**Example:**
```typescript
const agent = new HermesAdaptiveAgent(registry, router);

const response = await agent.process({
  query: 'Write a Python function to sort an array',
  priority: 'quality',
});

console.log(response.model); // "qwen2.5-coder:7b"
console.log(response.fallbackUsed); // false
console.log(response.cost); // 0
```

## API Endpoints

### GET `/api/v1/hermes/adaptive/models`
List all available models.

```bash
curl http://localhost:3000/api/v1/hermes/adaptive/models
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 4,
      "available": 4,
      "free": 4,
      "local": 4,
      "paid": 0
    },
    "models": [
      {
        "name": "qwen2.5-coder:7b",
        "displayName": "Qwen 2.5 Coder",
        "available": true,
        "free": true,
        "local": true,
        "capabilities": {
          "coding": 9,
          "reasoning": 8,
          "speed": 7
        },
        "preferredTasks": ["coding", "technical", "reasoning"]
      }
    ]
  }
}
```

### POST `/api/v1/hermes/adaptive/process`
Process a request with adaptive model selection.

```bash
curl -X POST http://localhost:3000/api/v1/hermes/adaptive/process \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Write a Python function to sort an array",
    "priority": "quality"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Here is a Python function...",
    "model": "qwen2.5-coder:7b",
    "modelDisplayName": "Qwen 2.5 Coder",
    "confidence": 0.92,
    "latencyMs": 450,
    "cost": 0,
    "fallbackUsed": false
  }
}
```

### GET `/api/v1/hermes/adaptive/health`
Check health of all models.

```bash
curl http://localhost:3000/api/v1/hermes/adaptive/health
```

### GET `/api/v1/hermes/adaptive/stats`
Get performance statistics.

```bash
curl http://localhost:3000/api/v1/hermes/adaptive/stats
```

### POST `/api/v1/hermes/adaptive/fallback-test`
Test fallback mechanism (admin only).

```bash
curl -X POST http://localhost:3000/api/v1/hermes/adaptive/fallback-test \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "qwen2.5-coder:7b",
    "testDuration": 5000
  }'
```

## Cost Policy

Configuration: `config/WISE2_AI_COST_POLICY.json`

**Default Mode: FREE-FIRST**
1. LOCAL models (Ollama) → Cost: $0
2. FREE-TIER models → Cost: $0
3. PAID providers → **DISABLED** (requires explicit approval)

**Safety Features:**
- Circuit breaker prevents cascading failures
- Cost tracking for audit trail
- No silent cost increases
- Fallback chain ensures high availability

## Model Roles

| Role | Model | Reason |
|------|-------|--------|
| CODING | qwen2.5-coder:7b | Specialized for code tasks |
| REASONING | llama3:latest | Strong multi-step logic |
| FAST | gemma4:e2b | Lowest latency |
| KNOWLEDGE | qwen3.5:latest | General knowledge tasks |
| FALLBACK | Any in chain | Rotation based on score |

## Acceptance Criteria

### ✅ Model Discovery
- [x] Auto-detect Ollama models on startup
- [x] Discover model capabilities
- [x] Persist registry for fast restarts
- [x] Re-enable models that recover

### ✅ Dynamic Routing
- [x] Classify task intent (coding/reasoning/general/rag/fast)
- [x] Score models based on task + capabilities
- [x] Select best available free model
- [x] Provide fallback chain (up to 3 models)

### ✅ Cost Guard
- [x] Enforce FREE-FIRST policy
- [x] Prevent paid APIs without approval
- [x] Track estimated costs
- [x] Warn on unexpected costs

### ✅ Health & Fallback
- [x] Track success/failure per model
- [x] Implement circuit breaker (3 failures → disable)
- [x] Auto-fallback on model failure
- [x] Record performance metrics

### ✅ Offline Operation
- [x] Support local models only (no internet required)
- [x] Graceful degradation if inference unavailable
- [x] Command Center remains operational

### ✅ Testing
- [x] Run acceptance test suite
- [x] Verify no cost incurred
- [x] Test fallback mechanism
- [x] Generate Phase 24C report

## Running Tests

```bash
# Run acceptance tests
npm test -- HermesAdaptiveAgent.acceptance.test.ts

# Run with coverage
npm test -- --coverage HermesAdaptiveAgent.acceptance.test.ts

# Run specific test
npm test -- --testNamePattern="should route coding task"
```

## Configuration

### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-... # Optional: for paid Claude fallback
OPENAI_API_KEY=sk-...    # Optional: for paid OpenAI fallback
GOOGLE_API_KEY=...       # Optional: for paid Gemini fallback
OLLAMA_API_URL=http://localhost:11434  # Local model inference
```

### Model Registry Path
```typescript
const registry = new ModelRegistry('./config/model-registry.json');
```

## Monitoring & Observability

### Health Check Endpoint
```bash
curl http://localhost:3000/api/v1/hermes/adaptive/health
```

### Model Performance Tracking
```bash
curl http://localhost:3000/api/v1/hermes/adaptive/stats
```

### Log Format
```
[INFO] Routed general to Qwen 2.5 Coder (score: 0.92, cost: $0)
[WARN] Llama 3 failed: timeout. Retrying with Gemma 4
[ERROR] All models failed. Last error: connection refused
```

## Future Enhancements

### 1. Auto-Promotion
When a new Ollama model appears:
- Benchmark against existing models
- Auto-test on acceptance criteria
- Promote to production if passing

### 2. Remote Free Tiers
Integrate cloud free tiers as secondary fallback:
- Claude API free tier (if available)
- OpenAI API free tier (if available)
- Gemini API free tier

### 3. Privacy Routing
Sensitive data (credentials, auth tokens) → LOCAL only
Public queries → can route to any approved model

### 4. Context Optimization
Smaller models need disciplined context:
- Second Brain: Top-K relevant entries only
- Conversation: Summary + recent messages
- Automatic context truncation

## Troubleshooting

### No Models Found
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Verify Ollama URL in code
OLLAMA_API_URL=http://localhost:11434
```

### Model Disabled (Circuit Breaker)
```bash
# Check model status
curl http://localhost:3000/api/v1/hermes/adaptive/models

# Look for "available": false
# Model will auto-recover after successful health check
```

### High Latency
```bash
# Check model performance
curl http://localhost:3000/api/v1/hermes/adaptive/stats

# For faster responses, use "fast" task type
# or reduce context size
```

### Fallback Not Triggering
```bash
# Test fallback explicitly
curl -X POST http://localhost:3000/api/v1/hermes/adaptive/fallback-test \
  -H "Content-Type: application/json" \
  -d '{"modelName": "qwen2.5-coder:7b", "testDuration": 5000}'
```

## Implementation Notes

**Why FREE-FIRST?**
- Zero operational costs
- Full control (local data)
- Instant availability
- No API rate limits
- Developer friendly

**Why Ollama?**
- Supports many model formats
- Easy to run locally
- Active community
- Free and open source

**Why Adaptive Routing?**
- Different tasks need different models
- Automatic fallback for reliability
- Cost optimization without sacrificing quality
- Future-proof (easy to add new models)

## Contact & Support

**Owner**: dwise (dwise03@gmail.com)  
**Status**: Phase 24C - Production Ready ✅  
**Last Updated**: 2026-07-27
