# WISE² Free-First AI Creative Engine

The WISE² Creative Engine is an intelligent AI generation pipeline that automatically routes creation requests to the most cost-effective provider while maintaining quality standards.

## Philosophy

**FREE → LOCAL → FREE CLOUD → PREMIUM ONLY WHEN JUSTIFIED**

The system prioritizes:
1. **Local GPU (ComfyUI)** — Free, fast, unlimited
2. **Free Cloud Credits** (Kling, Hailuo, PixVerse) — Use before paid
3. **Paid Generation** — Only when quality threshold not met or explicitly requested

## Architecture

```
CreationRequest
    ↓
ModelRouter (Intelligent Provider Selection)
    ├─ Check provider compatibility
    ├─ Check online status
    ├─ Check available credits
    ├─ Rank by priority & cost
    └─ Select best option
        ↓
ProviderAdapter (Execute Generation)
    └─ Generate content via provider API
        ↓
QualityEvaluator (Validate Output)
    ├─ Check brand accuracy
    ├─ Evaluate prompt adherence
    ├─ Detect artifacts
    └─ Score commercial viability
        ↓
CreditWallet (Track Costs)
    ├─ Record actual cost
    ├─ Update credit balance
    └─ Calculate savings
        ↓
Result (Saved to Asset Library)
```

## Core Components

### Types (`src/types/index.ts`)

- `CreationRequest` — User's generation request
- `GenerationJob` — Complete job lifecycle (queued → complete/failed)
- `GenerationResult` — Single generated asset
- `QualityEvaluation` — Quality assessment scores
- `ProviderCredits` — Credit balance per provider
- `CreditWallet` — User's credit usage and cost tracking

### Provider Adapters (`src/adapters/`)

Each adapter implements `ProviderAdapter` interface:

```typescript
interface ProviderAdapter {
  generateImage(request): Promise<GenerationResult[]>;
  generateVideo(request): Promise<GenerationResult[]>;
  imageToVideo(request): Promise<GenerationResult[]>;
  getCredits(): Promise<ProviderCredits>;
  getStatus(): Promise<{online, rateLimitRemaining}>;
  estimateCost(request): Promise<number>;
}
```

**Available Adapters:**
- `ComfyUIAdapter` — Local SDXL image generation (free)
- `KlingAdapter` — Video generation (cinematic movement)
- `HailuoAdapter` — Photorealistic video (can be added)
- Extensible pattern for adding Hailuo, PixVerse, Pika, etc.

### Model Router (`src/routers/model-router.ts`)

Intelligently selects provider based on:
- **Compatibility** — Does provider support this generation type?
- **Availability** — Is provider online? Do we have credits?
- **Priority** — Local > free cloud > paid, ranked by quality tier
- **Cost** — Estimates actual cost for the request

```typescript
const router = new ModelRouter(logger);
router.registerAdapter(comfyuiAdapter);
router.registerAdapter(klingAdapter);

const selectedProvider = await router.selectProvider(request);
// → Automatically picked best option
```

### Quality Evaluator (`src/services/quality-evaluator.ts`)

Assesses generation quality:
- **Brand Accuracy** — Logos, colors, typography correctness
- **Prompt Adherence** — Does output match the request?
- **Photorealism** — How realistic is it?
- **Artifacts** — Glitches, distortions, errors
- **Commercial Viability** — Ready for production use?

Returns score 0-100. Configurable acceptance threshold (default: 70).

```typescript
const evaluator = new QualityEvaluator(logger, 70); // 70 = minimum score
const evaluation = await evaluator.evaluateGeneration(result, request);

if (evaluation.score < 70) {
  // Retry with different provider or escalate to premium
}
```

### Credit Wallet (`src/services/credit-wallet.ts`)

Tracks generation costs and credit usage:

```typescript
const wallet = new CreditWalletService(logger, store);

// Record generation
await wallet.recordGeneration(
  userId,
  request,
  provider,
  actualCost,
  success
);

// Check credit balance
const canGenerate = await wallet.canGenerate(
  userId,
  ProviderType.KLING,
  estimatedCost
);

// Get wallet status
const status = await wallet.getWalletStatus(userId);
// → {
//   totalFreeCredits: 42,
//   totalPaidCredits: 12.50,
//   monthlyCost: 12.50,
//   estimatedRetailValue: 156.75,
//   generationCount: 24,
//   successCount: 23
// }
```

### Creative Orchestrator (`src/services/creative-orchestrator.ts`)

Main orchestration engine that handles complete generation lifecycle:

1. Routes request to best provider
2. Generates content
3. Evaluates quality
4. Retries with fallback if needed
5. Tracks costs in wallet
6. Returns final result

```typescript
const orchestrator = new CreativeOrchestrator(
  logger,
  router,
  evaluator,
  creditWallet,
  jobStore,
  brandStore
);

const job = await orchestrator.orchestrateGeneration(request);
// → {
//   id: "job-123",
//   status: "complete",
//   provider: "kling",
//   qualityScore: 87,
//   results: [...],
//   actualCost: 0.05
// }
```

## Integration Guide

### 1. Add to Your Module

In `packages/api/src/app.module.ts`:

```typescript
import { CreativeModule } from './creative/creative.module';

@Module({
  imports: [
    // ... other modules
    CreativeModule,
  ],
})
export class AppModule {}
```

### 2. Set Up Environment Variables

```bash
# .env
COMFYUI_URL=http://localhost:8188
KLING_API_KEY=your-kling-key
HAILUO_API_KEY=your-hailuo-key
PIXVERSE_API_KEY=your-pixverse-key
OPENAI_API_KEY=your-openai-key
```

### 3. Register Providers

In `creative.service.ts` or a setup function:

```typescript
import {
  ModelRouter,
  ComfyUIAdapter,
  KlingAdapter,
} from '@wise2/creative-engine';

const router = new ModelRouter(logger);

// Always register local first (free)
router.registerAdapter(
  new ComfyUIAdapter(logger, process.env.COMFYUI_URL)
);

// Then cloud providers
router.registerAdapter(
  new KlingAdapter(logger, process.env.KLING_API_KEY)
);
```

### 4. Create Generation Request

```typescript
POST /api/v1/creative/generate
{
  "type": "video",
  "brand": "wise2-hvac",
  "prompt": "HVAC system diagnostics on a modern commercial building",
  "style": "cinematic",
  "duration": 30,
  "quality": "standard"
}

// Response
{
  "id": "job-abc123",
  "status": "queued",
  "progress": 0
}

// Poll for status
GET /api/v1/creative/generations/job-abc123
{
  "id": "job-abc123",
  "status": "complete",
  "provider": "kling",
  "qualityScore": 85,
  "resultsCount": 1,
  "estimatedCost": 0.05,
  "actualCost": 0.05
}
```

## Configuration

### Quality Threshold

```typescript
orchestrator.setQualityThreshold(75); // Require 75+ score before accepting
```

### Brand Assets

Link brand reference materials for quality evaluation:

```typescript
const brandAssets: BrandAssets = {
  brand: BrandProfile.WISE2_HVAC,
  logos: ['path/to/logo.png'],
  referenceImages: ['ref1.jpg', 'ref2.jpg'],
  colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  typography: 'Inter, -apple-system, sans-serif',
  approvedLayouts: [],
  productReferences: [],
  characterReferences: [],
};
```

## Adding a New Provider

1. Create adapter in `src/adapters/`:

```typescript
// src/adapters/hailuo.adapter.ts
import { BaseProviderAdapter } from './base.adapter';

export class HailuoAdapter extends BaseProviderAdapter {
  name = ProviderType.HAILUO;

  async generateVideo(request: VideoGenerationRequest) {
    // Implementation
  }

  // ... implement other required methods
}
```

2. Register in your setup:

```typescript
router.registerAdapter(
  new HailuoAdapter(logger, process.env.HAILUO_API_KEY)
);
```

3. It automatically integrates — no router changes needed!

## Monitoring & Debugging

### View Generation Status

```bash
# Via API
curl http://localhost:3000/api/v1/creative/generations/job-id

# Via Dashboard
http://localhost:3000/creative
```

### Check Provider Status

```typescript
const status = await klingAdapter.getStatus();
// {online: true, rateLimitRemaining: 95}

const credits = await klingAdapter.getCredits();
// {provider: 'kling', freeCredits: 50, paidCredits: 25}
```

### Review Generation History

View in Creative Dashboard → History tab, or query database.

## Best Practices

✅ **DO:**
- Set quality threshold based on use case
- Preload brand assets for accurate evaluation
- Monitor monthly costs in credit wallet
- Use draft quality for experimentation
- Cache successful generations

❌ **DON'T:**
- Generate premium quality for drafts
- Skip quality evaluation
- Leave failed generations in queue
- Assume free credits will cover all requests
- Hardcode provider API keys in code

## Cost Optimization

1. **Use local GPU first** — ComfyUI is unlimited and fast
2. **Batch generations** — Request multiple at once to use credits efficiently
3. **Start with draft quality** — Only use premium for final outputs
4. **Monitor monthly trends** — The credit wallet shows if paid tier saves money
5. **Set quality threshold appropriately** — Higher threshold = more retries = higher cost

## Troubleshooting

**"No available providers"**
- Ensure at least one adapter is registered
- Check provider status: `adapter.getStatus()`

**"Quality score below threshold"**
- Increase quality of input prompt
- Lower acceptance threshold if needed
- Try different generation type

**"Out of free credits"**
- Check Kling/Hailuo account for credit reset date
- Switch to local GPU (unlimited)
- Use paid tier if commercial project

**Generation taking too long**
- Check queue depth: `generationQueuePanel.length`
- Local GPU may be overloaded — wait or scale
- Cloud providers have rate limits

## Next Steps

- [ ] Implement Hailuo video adapter
- [ ] Add PixVerse and Pika adapters
- [ ] Build Discord slash commands for generation
- [ ] Create image upscaling pipeline
- [ ] Add video editing/post-production workflows
- [ ] Implement advanced caching layer
- [ ] Build metrics dashboard for cost analytics
