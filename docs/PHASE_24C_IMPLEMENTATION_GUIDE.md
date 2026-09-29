# Phase 24C Implementation Guide

## Overview

Phase 24C introduces **FREE-FIRST Adaptive AI Model Intelligence** to WISE². The system automatically:

- Discovers available AI models (Ollama, Claude, OpenAI, Gemini)
- Routes requests to the best free model for the task
- Falls back to alternative models if the primary fails
- Prevents unexpected AI costs with strict FREE-FIRST policy
- Tracks model health and disables broken models

**Status**: ✅ Production Ready  
**Last Updated**: 2026-07-27

## Files Added

### Core Services

```
services/ai-orchestrator/src/models/
├── ModelRegistry.ts              # Model discovery & tracking
└── DynamicModelRouter.ts         # Task-aware model selection

services/ai-orchestrator/src/hermes/
├── HermesAdaptiveAgent.ts        # Main agent with fallback
└── HermesAdaptiveAgent.acceptance.test.ts  # Acceptance tests

services/api/src/routes/
└── hermes-adaptive.ts            # REST API endpoints

config/
├── WISE2_AI_COST_POLICY.json     # Cost policy enforcement
└── model-registry.json           # Persistent model registry (auto-created)

scripts/
└── validate-phase24c.sh          # Validation script
```

### Documentation

```
services/ai-orchestrator/
├── PHASE_24C_README.md           # Complete technical reference
└── ../../docs/PHASE_24C_IMPLEMENTATION_GUIDE.md  # This file
```

## Quick Start

### 1. Ensure Ollama is Running

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Verify models
curl http://localhost:11434/api/tags
```

Expected output (examples):
- `qwen2.5-coder:7b` — Coding model
- `llama3:latest` — Reasoning model
- `gemma4:e2b` — Fast general model
- `qwen3.5:latest` — Knowledge model

### 2. Initialize Hermes Adaptive Services

In your API server startup:

```typescript
import { initializeHermes } from './routes/hermes-adaptive';

// After Express app is created
await initializeHermes();

// Register routes
app.use('/api/v1/hermes', hermesAdaptiveRouter);
```

### 3. Test Model Discovery

```bash
curl http://localhost:3000/api/v1/hermes/adaptive/models
```

Response shows all discovered models with capabilities.

### 4. Test Dynamic Routing

```bash
curl -X POST http://localhost:3000/api/v1/hermes/adaptive/process \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Write a Python function to sort an array",
    "priority": "quality"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "...",
    "model": "qwen2.5-coder:7b",
    "modelDisplayName": "Qwen 2.5 Coder",
    "confidence": 0.92,
    "latencyMs": 450,
    "cost": 0,
    "fallbackUsed": false
  }
}
```

## Architecture Deep Dive

### Model Registry

**Responsibilities:**
- Query Ollama for available models
- Register capabilities (coding, reasoning, speed, etc.)
- Track performance (success rate, latency, failures)
- Implement circuit breaker (disable after 3 consecutive failures)
- Persist registry to disk for fast restarts

**Example:**
```typescript
const registry = new ModelRegistry('./config/model-registry.json');
await registry.initialize(); // Auto-discovers Ollama models

// Query registry
const models = registry.getAllModels();
const freeModels = registry.getAvailableFreeModels();
const coders = registry.getModelsByTask('coding');

// Track performance
registry.recordSuccess('qwen2.5-coder:7b', 250); // 250ms latency
registry.recordFailure('llama3:latest');        // Mark failure

// Get statistics
const stats = registry.getStats();
```

### Dynamic Model Router

**Scoring Formula:**
```
score = (task_alignment × 0.3)
      + (capability_match × 0.2)
      + (success_rate × 0.2)
      + (latency_pref × 0.15)
      + (context_efficiency × 0.15)
```

**Task Types:**
- `coding` — Prefers models with high coding capability
- `reasoning` — Prefers reasoning capability
- `general` — Balanced across capabilities
- `rag` — Prefers knowledge capability
- `fast` — Prefers low latency

**Example:**
```typescript
const router = new DynamicModelRouter(registry, 'FREE-FIRST');

const routing = router.route({
  task: 'coding',
  contextSize: 2000,
  requiresStructuredOutput: false,
});

console.log(routing.primary.displayName);      // "Qwen 2.5 Coder"
console.log(routing.fallbacks[0].displayName); // "Llama 3"
console.log(routing.score);                    // 0.92
console.log(routing.costEstimate);             // 0 (free)
```

### Hermes Adaptive Agent

**Flow:**
```
1. Receive request
2. Classify intent (task type)
3. Estimate context size
4. Route to best model
5. Execute with fallback chain
6. Validate response
7. Record performance
8. Return result
```

**Example:**
```typescript
const agent = new HermesAdaptiveAgent(registry, router);

const response = await agent.process({
  query: 'Explain machine learning to a 5-year-old',
  context: { userLevel: 'beginner' },
  priority: 'quality',
});

console.log(response.model);           // "qwen2.5-coder:7b"
console.log(response.latencyMs);       // 350
console.log(response.fallbackUsed);    // false
console.log(response.cost);            // 0
```

## Cost Guard Policy

**File:** `config/WISE2_AI_COST_POLICY.json`

**Default Mode:** `FREE-FIRST`

**Priority Order:**
1. LOCAL (Ollama) — Cost: $0
2. FREE-TIER (cloud) — Cost: $0
3. PAID (disabled by default) — Cost: variable

**Safety Features:**
- Paid providers require explicit environment flag to enable
- Circuit breaker prevents cascading failures
- All routing decisions logged for audit
- Cost estimates provided with every response
- Fallback chain ensures high availability

**To Enable Paid Fallback (if needed):**
```bash
export ENABLE_PAID_FALLBACK=true
export ANTHROPIC_API_KEY=sk-...
```

## API Reference

### Models Endpoint
```
GET /api/v1/hermes/adaptive/models
```
List all discovered models with capabilities.

### Health Endpoint
```
GET /api/v1/hermes/adaptive/health
```
Check overall system health.

### Process Endpoint
```
POST /api/v1/hermes/adaptive/process
```
Process a request with adaptive model selection.

**Body:**
```json
{
  "query": "Your question here",
  "context": { "optional": "context" },
  "requiresStructuredOutput": false,
  "priority": "quality" // or "speed" or "cost"
}
```

### Stats Endpoint
```
GET /api/v1/hermes/adaptive/stats
```
Get performance statistics and model health.

### Fallback Test Endpoint
```
POST /api/v1/hermes/adaptive/fallback-test
```
Test fallback mechanism (admin only).

## Acceptance Testing

### Run Full Test Suite

```bash
npm test -- HermesAdaptiveAgent.acceptance.test.ts
```

### Manual Acceptance Checklist

- [ ] Model Discovery: `curl http://localhost:3000/api/v1/hermes/adaptive/models`
- [ ] Routing Works: `curl -X POST ... /process` returns model name
- [ ] Cost is Zero: All responses show `"cost": 0`
- [ ] Fallback Works: Disable model, system uses fallback
- [ ] Health Tracking: `curl ... /health` shows all models available
- [ ] No Paid Costs: Check logs, no unexpected API calls

### Phase 24C Report

Run the acceptance tests to generate:
```
=== WISE² PHASE 24C ACCEPTANCE REPORT ===
- Model Discovery: PASS
- Dynamic Routing: PASS
- Automatic Fallback: PASS
- Cost Guard: PASS
- Health Tracking: PASS
- Offline Capable: PASS
- Zero Cost: PASS
```

## Monitoring & Operations

### Health Check
```bash
curl http://localhost:3000/api/v1/hermes/adaptive/health
```

### Model Statistics
```bash
curl http://localhost:3000/api/v1/hermes/adaptive/stats
```

### Enable Model Debugging
```bash
# In code
const logger = pino({ level: 'debug' });
// Logs will show model selection reasoning
```

## Troubleshooting

### No Models Found
```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Check URL in config
grep OLLAMA_API_URL config/.env
```

### Model Disabled (Circuit Breaker)
A model is auto-disabled after 3 consecutive failures.
- It will auto-recover on successful health check
- Or wait 1 minute for next health check cycle

### Unexpected Fallback
Check logs to see why primary model failed:
```bash
grep "Model failed" logs/ai-routing.log
```

### High Latency
Some models are slower:
- Use `priority: "speed"` for fast responses
- Reduce context size
- Check system load on Ollama server

## Integration Examples

### Next.js Integration
```typescript
// pages/api/ask.ts
export default async function handler(req, res) {
  const response = await fetch('http://localhost:3000/api/v1/hermes/adaptive/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: req.body.query,
      priority: 'quality',
    }),
  });

  const data = await response.json();
  res.json(data);
}
```

### React Hook
```typescript
function useAdaptiveAI() {
  const [response, setResponse] = useState<HermesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (query: string) => {
    setLoading(true);
    const res = await fetch('/api/hermes/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, priority: 'quality' }),
    });
    const data = await res.json();
    setResponse(data.data);
    setLoading(false);
  };

  return { response, loading, ask };
}
```

## Performance Characteristics

### Latency (by Model)
- Gemma 4: ~300ms
- Mistral: ~500ms
- Qwen 2.5: ~600ms
- Llama 3: ~400ms

### Context Windows
- Qwen 2.5: 32K tokens
- Llama 3: 4K tokens
- Mistral: 8K tokens
- Gemma 4: 8K tokens

### Accuracy (by Task)
- Coding: Qwen 2.5 ⭐⭐⭐⭐⭐
- Reasoning: Llama 3 ⭐⭐⭐⭐
- Speed: Gemma 4 ⭐⭐⭐⭐⭐
- General: Mistral ⭐⭐⭐⭐

## Future Enhancements

### Q3 2026: Remote Free Tiers
Integrate cloud free tier models as fallback.

### Q3 2026: Context Auto-Optimization
Automatically reduce context for smaller models.

### Q4 2026: Model Fine-Tuning
Continuous improvement via A/B testing.

## Support

**Questions?** Open an issue or email dwise03@gmail.com  
**Found a bug?** Check logs in `data/logs/ai-routing.log`  
**Want to contribute?** See CONTRIBUTING.md

---

**Phase 24C Status**: ✅ Production Ready  
**Implementation Date**: 2026-07-27  
**Owner**: dwise (Lead Architect)
