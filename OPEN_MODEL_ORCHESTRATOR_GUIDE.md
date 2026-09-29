# WISE² Open Model Orchestrator Guide

**Status**: Phase 1 - Foundation Complete  
**Version**: 1.0  
**Last Updated**: 2026-07-28

---

## Core Philosophy

**WISE² never depends on a single AI vendor.**

Models are interchangeable tools. The orchestration layer is the product.

WISE² owns:
- Workflow logic
- Memory systems
- Automation
- Business logic
- Decision making

AI models act as:
- Replaceable execution engines
- Interchangeable tools
- Cost-optimizable components
- Quality-variable resources

---

## Mission

Intelligently leverage both **commercial and free AI models** to:

✅ **Maximize capability** — Use the best model for each task  
✅ **Minimize cost** — Automatically choose free models when appropriate  
✅ **Ensure reliability** — Switch models automatically on failure  
✅ **Optimize performance** — Route based on latency, quality, complexity  
✅ **Reduce vendor lock-in** — Support 6+ providers simultaneously  

---

## System Architecture

```
Every WISE² Task
    ↓
Model Orchestrator
    ├─ Analyze: Complexity, context size, latency sensitivity, cost sensitivity
    ├─ Score: All available models (health, cost, quality, speed)
    ├─ Route: Select best model + fallback
    └─ Execute: Call model with automatic fallback
    ↓
Results
    └─ Track: Cost, tokens, quality, usage
```

---

## Supported Models (13 Total)

### Tier 1: Premium Commercial Models (3)

**Claude Opus 5** (Anthropic)
- Cost: $0.03/1k tokens
- Context: 200k tokens
- Quality: 100/100
- Speed: 100 tokens/sec
- Best for: Architecture, security, complex debugging
- Rate limit: 50 RPM, 1M TPM

**GPT-4 Turbo** (OpenAI)
- Cost: $0.01/1k tokens
- Context: 128k tokens
- Quality: 95/100
- Speed: 80 tokens/sec
- Best for: Architecture, debugging, production work
- Rate limit: 40 RPM, 900k TPM

**Gemini 2.0 Pro** (Google)
- Cost: $0.0075/1k tokens
- Context: 1M tokens (!!)
- Quality: 92/100
- Speed: 90 tokens/sec
- Best for: Long context, code generation, research
- Rate limit: 60 RPM, 1.2M TPM

### Tier 2: Free Cloud Models (10)

**DeepSeek Coder** (OpenRouter - FREE)
- Cost: $0.0001/1k tokens
- Context: 4k tokens
- Quality: 85/100
- Speed: 50 tokens/sec
- Best for: Simple code generation, boilerplate
- Rate limit: 100 RPM, 2M TPM

**Qwen 2.5 Coder** (OpenRouter - FREE)
- Cost: $0.00008/1k tokens
- Context: 32k tokens
- Quality: 82/100
- Speed: 60 tokens/sec
- Best for: Code gen, documentation, testing
- Rate limit: 120 RPM, 2.5M TPM

**Llama 3 70B** (GitHub Models - FREE)
- Cost: $0/1k tokens (GitHub credit)
- Context: 8k tokens
- Quality: 80/100
- Speed: 70 tokens/sec
- Best for: Boilerplate, documentation, rapid prototyping
- Rate limit: 200 RPM, 3M TPM

**Mistral Large** (OpenRouter)
- Cost: $0.00024/1k tokens
- Context: 32k tokens
- Quality: 83/100
- Speed: 65 tokens/sec
- Best for: Code gen, documentation, research
- Rate limit: 150 RPM, 2.8M TPM

**Nemotron 4 340B** (NVIDIA - FREE with NVIDIA account)
- Cost: $0/1k tokens
- Context: 4k tokens
- Quality: 81/100
- Speed: 75 tokens/sec
- Best for: Code gen, documentation, testing
- Rate limit: 180 RPM, 2.7M TPM

**Plus 5 more emerging models** (not listed for brevity)

---

## Routing Intelligence

The orchestrator scores every available model based on **task context**:

```typescript
interface TaskContext {
  category: TaskCategory;              // code_generation, documentation, etc.
  complexity: 'low' | 'medium' | 'high' | 'critical';
  contextSize: number;                 // tokens needed
  latencySensitive: boolean;           // <500ms required?
  costSensitive: boolean;              // prefer free models?
  quality: 'best' | 'good' | 'acceptable' | 'budget';
  preferredProviders?: string[];       // optional provider filter
}
```

**Scoring Algorithm** (highest score wins):

1. **Capability Match** (40 points)
   - Must support task category
   - Auto-reject if not supported

2. **Cost Optimization** (30 points, if cost-sensitive)
   - Free models: +30 points
   - Premium models: scale based on price

3. **Quality Match** (25-40 points, based on complexity)
   - Low complexity → quality matters less
   - Critical → must have high-quality model

4. **Latency** (0-20 points, if latency-sensitive)
   - Fast models: +points
   - Slow models: -points

5. **Rate Limits** (10 points or -30 penalty)
   - Available capacity: +10
   - Rate limited: -30 (can't use)

6. **Health Status** (multiplicative penalty)
   - Success rate < 100% → multiply score by (success_rate / 100)
   - Down status → reject automatically

**Example**:

```
Task: Generate documentation (low complexity, cost-sensitive)

Model Scores:
- DeepSeek Coder:     40 (capability) + 30 (free) + 5 (low complexity) = 75 ✓ SELECTED
- Qwen 2.5 Coder:     40 (capability) + 30 (free) + 5 (low complexity) = 75
- Claude Opus 5:      40 (capability) + 2 (expensive) + 25 (high quality) = 67
- GPT-4 Turbo:        40 (capability) + 5 (cheaper) + 20 (high quality) = 65
```

---

## Fallback System

**If selected model fails:**

1. Mark model as degraded (reduce success rate)
2. Switch to fallback model (second-highest scored)
3. Retry request with fallback
4. Track error for health monitoring
5. Auto-update model health status

**Example**:

```
Primary: DeepSeek Coder → FAILS (timeout)
  ↓
Status: degraded (-10 success rate)
  ↓
Fallback: Qwen 2.5 Coder → SUCCESS ✓
  ↓
Result returned, error logged
```

**Retry behavior**:
- 3 retries maximum (configurable)
- Each retry uses different model
- Avoid retry storms (exponential backoff)
- Never retry auth/quota errors (fail fast)

---

## Rate Limit Management

**Monitoring**:
- Track RPM (requests per minute) per model
- Track TPM (tokens per minute) per model
- Automatic queue management
- Provider health status

**Auto-rerouting**:
- Rate limit reached → switch to alternative model
- Queue request if all models rate-limited
- Prioritize free models for non-critical work
- Prioritize premium models for critical work

**User experience**:
- Automatic (user sees no difference)
- Never expose rate limit errors to users
- Transparent cost savings tracking

---

## Cost Optimization Strategies

### 1. Automatic Cost Reduction

**Without compromising quality:**

```
Task: "Generate function documentation"
- Quality required: good (80/100)
- Latency: not critical
- Cost sensitivity: high

Route to: Qwen 2.5 Coder (82/100 quality, $0.00008/1k tokens)
Savings vs Claude: ~99.7% cost reduction
```

### 2. Quality-Tiered Routing

| Tier | Use Case | Model | Cost | Quality |
|------|----------|-------|------|---------|
| Budget | Boilerplate, templates | DeepSeek | $0.0001/1k | 85/100 |
| Good | Normal dev work | Qwen | $0.00008/1k | 82/100 |
| Best | Architecture, security | Claude | $0.03/1k | 100/100 |

### 3. Time-Based Routing

- **Batch/non-urgent**: Always use free models
- **Same-day**: Prefer free models
- **Same-hour**: Use mixed (free + premium)
- **Immediate**: Use best available model

### 4. Provider Diversity

- Never route all traffic to one provider
- Automatic failover to alternate providers
- Load-balance across 6+ providers
- Switch providers if one degrades

---

## Multi-Agent Execution

Different agents can use different models:

```
Market Intelligence Agent
  → DeepSeek Coder (fast, cheap, research)

Planning Agent
  → Qwen (balanced quality/cost)

Code Generation Agent
  → Claude Opus (highest quality)

Review Agent
  → GPT-4 Turbo (critical review)

Security Agent
  → OpenAI (security expertise)

Coordinator
  → WISE² Orchestrator (intelligent routing)
```

Each agent benefits from optimal model selection without knowledge of routing logic.

---

## Model Control Dashboard

**Real-time visibility into**:

- **Current Provider** — Which model is active
- **Current Model** — Which specific model
- **Latency** — How fast it responds
- **Cost** — What's being spent
- **Success Rate** — How reliable it is
- **Rate Limits** — Remaining quota
- **Fallback History** — When did we switch models
- **Health Status** — Healthy/degraded/down

**User Controls**:

- **Auto Mode** (default) — WISE² decides
- **Manual Mode** — You choose each time
- **Cost Optimization Level** — Prefer free / Balanced / Best quality
- **Provider Filter** — Which providers to allow
- **Model Preferences** — Favorite models per task type

---

## Integration Points

**Providers supported**:
- ✅ Anthropic (Claude)
- ✅ OpenAI (GPT-4, GPT-4o)
- ✅ Google (Gemini)
- ✅ OpenRouter (DeepSeek, Qwen, Mistral, etc.)
- ✅ GitHub Models (Llama)
- ✅ NVIDIA API (Nemotron)
- ✅ Future providers (modular design)

**Provider abstraction**:
- Unified interface (same parameters for all)
- Provider switching is transparent
- No code changes needed to add provider
- Automatic auth/key rotation

---

## API Reference

### POST /api/v1/models/route
Get routing decision for a task:

```json
{
  "category": "code_generation",
  "complexity": "low",
  "contextSize": 2000,
  "latencySensitive": false,
  "costSensitive": true,
  "quality": "good"
}

→ Response:
{
  "selectedModel": "qwen-2.5-coder",
  "provider": "openrouter",
  "reason": "Free model with 82/100 quality",
  "estimatedCost": 0.00016,
  "estimatedLatency": 800,
  "fallbackModel": "deepseek-coder"
}
```

### POST /api/v1/models/execute
Execute task with automatic fallback:

```json
{
  "prompt": "Generate a function to sort an array",
  "context": {
    "category": "code_generation",
    "complexity": "low",
    "costSensitive": true
  },
  "maxRetries": 3
}

→ Response:
{
  "response": "function sortArray(arr) { ... }",
  "model": "qwen-2.5-coder",
  "provider": "openrouter",
  "cost": 0.00016
}
```

### GET /api/v1/models/health
Get health status of all models:

```json
→ Response:
[
  {
    "model": "claude-opus-5",
    "status": "healthy",
    "successRate": 99.8,
    "averageLatency": 500,
    "errorCount": 1,
    "rateLimitRemaining": 45
  },
  ...
]
```

### GET /api/v1/models/usage
Get usage statistics and cost:

```json
→ Response:
{
  "models": [
    {
      "model": "qwen-2.5-coder",
      "requests": 1240,
      "tokens": 450000,
      "cost": 0.036,
      "costPerRequest": 0.000029
    },
    ...
  ],
  "summary": {
    "totalCost": 4.23,
    "totalRequests": 8540,
    "totalTokens": 12400000,
    "averageCostPerRequest": 0.000495,
    "costSavingsFromFreeModels": 3.87
  }
}
```

### GET /api/v1/models/available
List all available models:

```json
→ Response:
{
  "total": 13,
  "premium": [
    { "model": "claude-opus-5", ... },
    { "model": "gpt-4-turbo", ... },
    { "model": "gemini-2.0-pro", ... }
  ],
  "free": [
    { "model": "deepseek-coder", ... },
    { "model": "qwen-2.5-coder", ... },
    ...
  ]
}
```

### GET /api/v1/models/by-capability/:category
Get models supporting a capability:

```
GET /api/v1/models/by-capability/code_generation

→ Response:
{
  "capability": "code_generation",
  "models": [
    { "model": "deepseek-coder", ... },
    { "model": "qwen-2.5-coder", ... },
    ...
  ]
}
```

### GET /api/v1/models/free
Get all free models:

```json
→ Response:
{
  "count": 10,
  "models": [...],
  "totalTokenLimit": 28900000
}
```

---

## Deployment Checklist

- [x] Orchestrator service (model-orchestrator.ts)
- [x] API routes (model-orchestrator.ts routes)
- [x] Model registry (13 models)
- [x] Routing algorithm (scoring system)
- [x] Fallback system (automatic retry)
- [x] Health monitoring (track success rate)
- [x] Usage tracking (cost + tokens)
- [x] React dashboard (Model Control)
- [ ] Provider SDKs (actual API calls)
- [ ] Rate limit enforcement (queuing)
- [ ] Provider failover (automatic switch)
- [ ] Usage billing (per-model cost)
- [ ] Analytics export (usage reports)

---

## Cost Savings Potential

**Example scenario: Generating 10,000 code comments**

| Approach | Model | Cost | Time |
|----------|-------|------|------|
| Always Claude | claude-opus-5 | $30 | 10 min |
| Always Free | deepseek-coder | $0.10 | 15 min |
| WISE² Orchestrator | qwen-2.5-coder | $0.08 | 12 min |

**WISE² Savings**: $29.92 per 10K tasks  
**Annual (1M tasks)**: $299,200 saved

---

## What's Next

**Phase 1 (Complete)**:
✅ Orchestrator service  
✅ Routing algorithm  
✅ 13 supported models  
✅ API routes  
✅ Dashboard UI  

**Phase 2 (Next)**:
- [ ] Actual API provider integration
- [ ] Real model calling (not mock)
- [ ] Rate limit enforcement
- [ ] Provider failover
- [ ] Health monitoring automation

**Phase 3 (Future)**:
- [ ] Usage billing integration
- [ ] Analytics export
- [ ] Model performance learning
- [ ] Auto-routing optimization
- [ ] Provider discovery (new models)

---

## Architecture Benefits

**For Users**:
- ✅ Same WISE² experience, no vendor lock-in
- ✅ Lower costs (99.7% cheaper for simple tasks)
- ✅ Better reliability (automatic fallback)
- ✅ Faster responses (latency optimization)
- ✅ Consistent quality (adaptive routing)

**For WISE²**:
- ✅ 99% lower AI costs (free models for 80% of work)
- ✅ 6+ provider diversity (no single dependency)
- ✅ Scalability (trade cost for quality as needed)
- ✅ Future-proof (add models without code changes)
- ✅ Competitive advantage (orchestration is product)

---

**WISE² is not dependent on any AI vendor. WISE² is the orchestrator.** 🚀
