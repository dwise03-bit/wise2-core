# Hermes Image Orchestrator — Complete System Guide

## Quick Start

### 1. Via Web Dashboard

```
1. Open dashboard at /hermes
2. Enter image generation instruction
3. (Optional) Add locked/editable asset references
4. Click "Generate Image"
5. View results in right panel
```

### 2. Via Discord Bot

```
/image instruction:"Generate a product photo with enhanced lighting"
```

### 3. Via REST API

```bash
curl -X POST http://localhost:3000/api/v1/hermes/image \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instruction": "Generate product photo",
    "references": [],
    "aspectRatio": "1:1"
  }'
```

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Interfaces                   │
├──────────────────┬──────────────────┬──────────────────┐
│   Web UI         │  Discord Bot     │   REST API       │
│   (/hermes)      │  (/image cmd)    │  (POST /api)     │
└──────────┬───────┴────────┬─────────┴────────┬─────────┘
           │                │                  │
           └────────────────┴──────────────────┘
                            │
                    ┌───────▼────────┐
                    │ HermesController│
                    └────────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │  ImageOrchestratorService │
              └──┬──────────────┬─────┬───┘
                 │              │     │
      ┌──────────▼──┐  ┌────────▼──┐ ┌─▼─────────────┐
      │ ImagePrompt │  │ ImageProvider
      │ Service     │  │ Service      │
      │             │  │              │
      │ Constructs  │  │ HTTP client  │
      │ detailed    │  │ to backend   │
      │ prompts     │  │ provider     │
      └─────────────┘  └──────┬───────┘
                               │
              ┌────────────────▼──────────────┐
              │  External Image Provider      │
              │  (OpenAI, Stability, etc.)    │
              └───────────────────────────────┘
                               │
              ┌────────────────▼──────────────┐
              │  ImageValidatorService       │
              │                              │
              │  - Validate locked assets    │
              │  - Check preservation       │
              │  - Return guarantees        │
              └──────────────┬───────────────┘
                            │
           ┌────────────────┴─────────────┐
           │                              │
    ┌──────▼───────┐          ┌──────────▼─┐
    │ Return JSON  │          │   Discord  │
    │ Result       │          │ Integration│
    │              │          │            │
    │ To caller    │          │ Post result│
    │              │          │ to channel │
    └──────────────┘          └────────────┘
```

### Services

#### HermesController
- Entry point for all requests
- Validates input DTOs
- Enforces JWT authentication
- Delegates to orchestrator

#### ImageOrchestratorService
- Main business logic
- Coordinates services
- Handles error recovery
- Manages request lifecycle

#### ImagePromptService
- Constructs structured prompts
- Formats locked/editable sections
- Adds preservation constraints
- Optimizes for provider API

#### ImageProviderService
- HTTP adapter to backend
- Configurable endpoints/keys
- Timeout handling
- Response parsing

#### ImageValidatorService
- Verifies locked assets preserved
- Checks response metadata
- Validates aspect ratios
- Returns preservation guarantee

#### Discord Service
- Posts results to #images channel
- Formats rich embeds
- Handles image uploads
- Manages channel permissions

---

## Request Flow Example

### User submits: "Generate viral ad with locked vehicle"

```
User (Web UI)
    ↓
POST /api/v1/hermes/image
{
  "instruction": "Transform Knight Wing vehicle into viral ad...",
  "references": [
    {
      "id": "vehicle",
      "url": "https://cdn.../nightwing.png",
      "role": "LOCKED",
      "kind": "hardware"
    }
  ],
  "aspectRatio": "1:1"
}
    ↓
HermesController@Post('image')
    ├─ Validate JWT token ✓
    ├─ Parse request body ✓
    └─ Call orchestrator.generate(request)
    ↓
ImageOrchestratorService
    ├─ Create job ID: job_abc123
    ├─ Call promptService.build(request)
    │   ↓
    │   ImagePromptService
    │   ├─ Combine instruction + locked/editable sections
    │   ├─ Add: "MUST preserve asset ID: vehicle"
    │   └─ Return formatted prompt
    │
    ├─ Call providerService.generate(prompt, refs)
    │   ↓
    │   ImageProviderService
    │   ├─ HTTP POST to HERMES_IMAGE_ENDPOINT
    │   │  Headers: Authorization: Bearer $API_KEY
    │   │  Body: { prompt, references, aspectRatio }
    │   ├─ Wait up to 120 seconds
    │   └─ Parse response JSON
    │
    ├─ Call validatorService.validate(response, references)
    │   ↓
    │   ImageValidatorService
    │   ├─ Check: "vehicle" in preservedReferenceIds? ✓
    │   ├─ Check: preservationGuaranteed = true? ✓
    │   └─ Return { isValid: true, preservationGuaranteed: true }
    │
    └─ Return result to controller
    ↓
HermesController
    ├─ Format response
    ├─ (Optional) Call discord.sendImageResult(result)
    │   ↓
    │   Discord service posts to #images channel
    │
    └─ Return 200 OK with result JSON
    ↓
User (Web UI)
    ├─ Display generated image
    ├─ Show preservation status
    └─ Show provider metadata
```

---

## Asset Role System

### 🔒 Locked (LOCKED)

**Definition**: Element must be preserved exactly

**Validator checks**:
- Asset ID in `preservedReferenceIds`?
- Is `preservationGuaranteed = true`?

**When to use**:
- Brand logos and marks
- Critical product details
- Character identities
- Legal/compliance elements

**Example**:
```json
{
  "id": "knight-wing-logo",
  "url": "https://cdn.wisedefensellc.com/logo.svg",
  "role": "LOCKED",
  "kind": "brand-asset"
}
```

### ✏️ Editable (EDITABLE)

**Definition**: Element included but can be modified

**Validator checks**:
- Asset used in generation?
- Enhancement applied appropriately?

**When to use**:
- Background images
- Lighting/color schemes
- Secondary objects
- Enhancement candidates

**Example**:
```json
{
  "id": "background-skyline",
  "url": "https://cdn.example.com/nyc-bg.jpg",
  "role": "EDITABLE",
  "kind": "photo"
}
```

### ✨ New (NEW)

**Definition**: Generate entirely new content

**Validator checks**:
- Content created matches instruction?
- Quality meets standards?

**When to use**:
- Additional elements
- Generated effects
- Synthesized content
- Augmentations

**Example**:
```json
{
  "id": "motion-graphics",
  "url": null,
  "role": "NEW",
  "kind": "animation-frame"
}
```

---

## Configuration

### Environment Variables

```bash
# Image Provider Backend
HERMES_IMAGE_ENDPOINT=https://api.provider.com/v1/image
HERMES_IMAGE_API_KEY=sk_live_xxxxx
HERMES_IMAGE_PROVIDER=openai
HERMES_IMAGE_TIMEOUT_MS=120000

# Discord Integration
DISCORD_WEBHOOK_IMAGES=https://discord.com/api/webhooks/[id]/[token]
DISCORD_DEFAULT_HERMES_USER_ID=user_123456789

# Other Discord Webhooks
DISCORD_WEBHOOK_ALERTS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_BUILDS=https://discord.com/api/webhooks/...
DISCORD_WEBHOOK_DEPLOYS=https://discord.com/api/webhooks/...
```

### Local Development

```bash
# 1. Copy example env
cp services/api/.env.example services/api/.env

# 2. Add your credentials
HERMES_IMAGE_ENDPOINT=https://api.openai.com/v1/images/generations
HERMES_IMAGE_API_KEY=sk_...

# 3. Start development server
npm run dev --workspace=@wise2/api

# 4. Dashboard available at:
http://localhost:3001/hermes
```

---

## Monitoring

### Logs

API logs include all Hermes requests:

```bash
# Watch live logs
tail -f logs/api.log

# Filter Hermes requests
grep "Hermes\|image-generation" logs/api.log

# Check errors
grep "ERROR.*Hermes\|ERROR.*ImageProvider" logs/api.log
```

### Metrics to Track

- Requests per minute
- Average generation time
- Provider success rate
- Locked asset preservation rate
- Discord delivery success rate

### Debugging

**Test via curl**:
```bash
curl -X POST http://localhost:3000/api/v1/hermes/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instruction": "test",
    "references": [],
    "aspectRatio": "1:1"
  }'
```

**Check provider connectivity**:
```bash
curl -X POST $HERMES_IMAGE_ENDPOINT \
  -H "Authorization: Bearer $HERMES_IMAGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

---

## Use Cases

### 1. Marketing Asset Generation

**Instruction**:
```
Create a professional product photo for social media.

LOCKED ELEMENTS:
- Product design (preserve exact look)
- Brand colors (red and blue palette)

EDITABLE ELEMENTS:
- Lighting and shadows
- Background environment
- Camera angle

OUTPUT:
- 1080x1080 square format
- Social media optimized
```

### 2. Campaign Content

**Instruction**:
```
Generate viral ad animation for Knight Wing campaign.

LOCKED ELEMENTS:
- Tactical vehicle silhouette
- Operator character
- NYC skyline backdrop
- Red/blue neon theme

EDITABLE ELEMENTS:
- Motion graphics
- Dynamic lighting effects
- Particle effects

OUTPUT:
- 1080x1080 square
- 30 seconds
- Facebook/Instagram/TikTok format
```

### 3. Design Exploration

**Instruction**:
```
Create alternative designs for product packaging.

LOCKED ELEMENTS:
- Product name and logo
- Key product features

EDITABLE ELEMENTS:
- Color schemes
- Layout and composition
- Typography styles

OUTPUT:
- Multiple variations
- 3:2 aspect ratio
```

---

## Troubleshooting

### Generation Returns Generic Error

**Check list**:
1. Is API key valid? (`HERMES_IMAGE_API_KEY`)
2. Is endpoint URL correct? (`HERMES_IMAGE_ENDPOINT`)
3. Is network connectivity working?
4. Check API provider status page

### Locked Assets Not Preserved

**Analyze**:
1. Are locked constraints clear in instruction?
2. Are asset URLs accessible?
3. Are preservation requirements realistic?
4. Check provider logs for details

**Solution**:
- Simplify instruction
- Use fewer locked constraints
- Be explicit about preservation needs

### Discord Integration Not Working

**Check**:
1. Is webhook URL correct?
2. Does bot have channel permissions?
3. Is `#images` channel present?
4. Are channel IDs configured?

**Test Discord**:
```bash
curl -X POST $DISCORD_WEBHOOK_IMAGES \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test message from Hermes"
  }'
```

### Timeout Errors

**Solution**:
1. Increase `HERMES_IMAGE_TIMEOUT_MS` (e.g., to 180000)
2. Simplify instruction/references
3. Check provider API response times

---

## API Response Examples

### Success (200 OK)

```json
{
  "imageUrl": "https://hermes-cdn.example.com/gen_abc123.jpg",
  "provider": "openai",
  "preservedReferenceIds": ["knight-wing-logo", "vehicle"],
  "preservationGuaranteed": true,
  "jobId": "job_abc123456789"
}
```

### Locked Asset Failure (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Locked asset preservation failed: vehicle not in preserved references",
  "error": "BadRequestException"
}
```

### Configuration Error (500 Internal Server Error)

```json
{
  "statusCode": 500,
  "message": "Hermes image backend is not configured",
  "error": "InternalServerErrorException"
}
```

---

## Next Steps

### For Administrators

1. Configure `HERMES_IMAGE_ENDPOINT` and `HERMES_IMAGE_API_KEY`
2. Set up Discord webhook for `#images` channel
3. Test generation via Web UI
4. Monitor logs for errors

### For Users

1. Visit `/hermes` in dashboard
2. Follow the in-app guide
3. Start with simple instructions
4. Gradually add locked/editable assets

### For Developers

1. Review API architecture diagram
2. Study service implementations
3. Run integration tests
4. Extend with custom providers

---

## Support

For questions or issues:
1. Check `HERMES_USAGE_GUIDE.md` for detailed docs
2. Review troubleshooting section
3. Check API logs
4. Test with curl/Postman
5. Contact infrastructure team

**Documentation**: `packages/api/src/hermes/HERMES_USAGE_GUIDE.md`  
**Code**: `packages/api/src/hermes/`  
**Web UI**: `apps/dashboard/app/hermes/`  
**Discord**: `packages/api/src/discord/`
