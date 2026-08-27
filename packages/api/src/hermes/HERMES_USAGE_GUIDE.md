# Hermes Image Orchestrator — Usage Guide

## Overview

Hermes is a provider-neutral image generation system with **locked asset preservation**. It allows you to:

- Generate images with AI
- Preserve specific elements exactly (locked assets)
- Allow controlled modifications (editable assets)
- Generate entirely new content (new assets)
- Track generation metadata and provider info

## Access Points

### 1. Web UI (Recommended)

**Location**: `/hermes` dashboard page

**Features**:
- Interactive form for image generation requests
- Asset reference management with visual preview
- Real-time result display with image preview
- Status tracking and error handling

**Steps**:
1. Navigate to **🎨 Hermes** in the dashboard sidebar
2. Enter your generation instruction
3. (Optional) Add asset references:
   - **Locked** (🔒): Elements to preserve exactly
   - **Editable** (✏️): Elements that can be modified
   - **New** (✨): Elements to generate fresh
4. Select aspect ratio (1:1, 16:9, etc.)
5. Click **Generate Image**
6. View results in the right panel

### 2. Discord Command

**Command**: `/image`

**Options**:
- `instruction` (required): Detailed description of what to generate
- `aspect-ratio` (optional): Aspect ratio for the output image

**Example**:
```
/image instruction:Transform the Knight Wing animation into a viral ad. Lock vehicle design, enhance lighting instruction:30s MP4 format
```

**Result**: Image posted to `#images` channel with details

### 3. REST API

**Endpoint**: `POST /v1/hermes/image`

**Authentication**: JWT Bearer token required

**Request Body**:
```json
{
  "instruction": "Generate a product photo with enhanced lighting",
  "references": [
    {
      "id": "product-base",
      "url": "https://example.com/product.jpg",
      "role": "LOCKED",
      "kind": "product-photo"
    },
    {
      "id": "background",
      "url": "https://example.com/bg.jpg",
      "role": "EDITABLE",
      "kind": "photo"
    }
  ],
  "aspectRatio": "1:1"
}
```

**Response**:
```json
{
  "imageUrl": "https://hermes-cdn.example.com/abc123.jpg",
  "provider": "openai",
  "preservedReferenceIds": ["product-base"],
  "preservationGuaranteed": true,
  "jobId": "job_123456"
}
```

## Asset Roles

### 🔒 Locked (LOCKED)

**Purpose**: Preserve critical elements exactly

**Use cases**:
- Logo or brand elements
- Specific product models
- Critical character features
- Architectural details

**Guarantee**: System validates that locked assets are preserved or fails the generation

**Example**:
```
- ID: "brand-logo"
- Role: LOCKED
- Kind: brand-asset
- URL: https://cdn.example.com/logo.png
```

### ✏️ Editable (EDITABLE)

**Purpose**: Allow controlled modifications

**Use cases**:
- Lighting/color/contrast
- Background details
- Secondary elements
- Enhanced effects

**Guarantee**: Asset will be included but can be modified by the provider

**Example**:
```
- ID: "background"
- Role: EDITABLE
- Kind: photo
- URL: https://cdn.example.com/bg.jpg
```

### ✨ New (NEW)

**Purpose**: Generate entirely new content

**Use cases**:
- Additional elements to add
- Generated scenes or effects
- New composition layers

**Guarantee**: Provider creates fresh content matching the instruction

**Example**:
```
- ID: "lighting-effects"
- Role: NEW
- Kind: effect
```

## Instruction Guidelines

### Structure

```
[TASK DESCRIPTION]
[LOCKED ELEMENTS - what must be preserved]
[EDITABLE ELEMENTS - what can be modified]
[OUTPUT SPECS - format, size, resolution]
```

### Example Instruction

```
Transform the tactical vehicle animation into a viral ad.

LOCKED ELEMENTS (preserve exactly):
- Tactical vehicle silhouette and design
- Operator character positioning
- NYC skyline backdrop

EDITABLE ENHANCEMENTS (add for impact):
- Dynamic motion graphics and camera movements
- Cinematic lighting effects
- Particle effects (neon sparks, glitches)
- Professional color grading

OUTPUT SPECS:
- Format: MP4 (h264)
- Resolution: 1080×1080 (square)
- Duration: 30 seconds @ 30 fps
```

## Error Handling

### Common Issues

**"Backend is not configured"**
- Ensure environment variables are set:
  - `HERMES_IMAGE_ENDPOINT`: API endpoint URL
  - `HERMES_IMAGE_API_KEY`: Provider API key

**"Locked asset preservation failed"**
- Generation completed but validation failed
- Regenerate with simpler locked constraints
- Review the instruction for conflicting requirements

**"Invalid image URL"**
- Check that asset URLs are accessible
- Ensure CORS headers allow cross-origin access
- Test URLs directly in browser

## Environment Setup

### Required Variables

```bash
# Provider Configuration
HERMES_IMAGE_ENDPOINT=https://api.provider.com/v1/image
HERMES_IMAGE_API_KEY=sk_live_xxxxx
HERMES_IMAGE_PROVIDER=openai  # or other provider

# Timeout (milliseconds)
HERMES_IMAGE_TIMEOUT_MS=120000

# Discord Integration
DISCORD_WEBHOOK_IMAGES=https://discord.com/api/webhooks/...
DISCORD_DEFAULT_HERMES_USER_ID=user_123
```

### Local Development

```bash
# Copy example configuration
cp services/api/.env.example services/api/.env

# Edit with your values
nano services/api/.env

# Start API service
npm run dev --workspace=@wise2/api
```

## API Architecture

### Request Flow

```
1. User submits request (Web UI / Discord / API)
   ↓
2. HermesController validates input
   ↓
3. ImageOrchestratorService processes:
   a. ImagePromptService: Build detailed prompt
   b. ImageProviderService: Call backend provider
   c. ImageValidatorService: Validate locked assets
   ↓
4. Response returned with metadata
   ↓
5. Discord integration (if Discord channel specified)
   ↓
6. Result delivered to user
```

### Services

**ImageOrchestratorService**: Main orchestration logic
- Coordinates between all services
- Manages request/response lifecycle
- Handles error recovery

**ImagePromptService**: Prompt composition
- Structures instruction with locked/editable sections
- Formats for provider API
- Includes preservation constraints

**ImageProviderService**: Backend communication
- HTTP client to image generation provider
- Handles timeouts and retries
- Parses provider responses

**ImageValidatorService**: Locked asset validation
- Verifies locked assets preserved
- Checks response metadata
- Returns preservation guarantee status

## Advanced Usage

### Batch Processing

For processing multiple requests, use the REST API:

```typescript
const requests = [
  { instruction: "...", references: [...], aspectRatio: "1:1" },
  { instruction: "...", references: [...], aspectRatio: "16:9" },
];

for (const req of requests) {
  const response = await fetch('/api/v1/hermes/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const result = await response.json();
  console.log('Job:', result.jobId, 'Status:', result.status);
}
```

### Custom Providers

To add a new image provider:

1. Create provider adapter in `ImageProviderService`
2. Set `HERMES_IMAGE_PROVIDER` environment variable
3. Implement required response format:
   ```json
   {
     "imageUrl": "string",
     "provider": "string",
     "preservedReferenceIds": ["string"],
     "preservationGuaranteed": boolean
   }
   ```

## Monitoring & Debugging

### Logs

Check API logs for request details:

```bash
tail -f logs/hermes.log
```

### Test Generation

Quick test via API:

```bash
curl -X POST http://localhost:3000/api/v1/hermes/image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "instruction": "Generate a test image",
    "references": [],
    "aspectRatio": "1:1"
  }'
```

## Performance

### Timeouts

Default: 120 seconds (2 minutes)

Configure via `HERMES_IMAGE_TIMEOUT_MS` environment variable

### Concurrency

- Web UI: Single request at a time
- Discord: Queued per server
- REST API: No limits (depends on provider)

## Security

### API Keys

- Never commit `.env` files
- Rotate keys regularly
- Use environment variables only
- Restrict Discord webhook URLs

### Asset URLs

- CORS headers must allow access
- Validate URLs before processing
- Consider CDN caching for assets

## Troubleshooting

### Generation takes too long

1. Check network connectivity
2. Verify `HERMES_IMAGE_ENDPOINT` is correct
3. Increase `HERMES_IMAGE_TIMEOUT_MS`
4. Try simpler instruction

### Locked assets not preserved

1. Ensure instruction is clear about preservation
2. Simplify locked constraints
3. Test with fewer locked assets
4. Check provider logs for details

### Discord integration not working

1. Verify webhook URL is correct
2. Check Discord server permissions
3. Ensure `#images` channel exists
4. Review Discord bot scopes

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review API logs
3. Test with curl/Postman
4. Contact infrastructure team
