# Sound Labs: Building Your Own Music Generation Engine

**Status**: Suno removed ✅ | Ready for your generation backend 🚀

---

## Current Architecture

Sound Labs is now **engine-agnostic**. The system supports multiple backends:

### Database Schema (Updated)
```
SoundLabsProject:
  - generationEngine: 'musicgen' | 'ollama' | 'custom' | string
  - generationJobId: string (unique per job)
  - generationStatus: 'draft' | 'queued' | 'processing' | 'completed' | 'failed'
  - generationMetadata: JSON (engine-specific data)
  - generatedAudioUrl: string (final audio file URL)
  - generatedAt: timestamp
```

### API Endpoints (Ready)
- `POST /api/v1/sound-labs/me/projects/{id}/generate` — Start generation
  - Request: `{ lyrics, title, engine?, options? }`
  - Response: `{ jobId, status, engine, estimatedTime }`
  
- `GET /api/v1/sound-labs/me/projects/{id}/generate` — Poll status
  - Response: `{ status, audioUrl, engine, generatedAt }`

---

## Implementation Options

### Option 1: MusicGen (Recommended for MVP)
**What**: Meta's state-of-the-art text-to-music model  
**Pros**: High quality, open-source, can run locally or via API  
**Cons**: Requires GPU for good performance

#### Setup Steps:
1. **Via Hugging Face API** (Easiest)
   ```bash
   # Install dependencies
   npm install @huggingface/inference
   
   # Set environment variable
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

2. **Via Local Ollama** (Full control)
   ```bash
   # Start Ollama with music generation model
   ollama run musicgen:7b
   ```

3. **Implementation**:
   ```typescript
   // apps/website/app/api/v1/sound-labs/me/projects/[projectId]/generate/musicgen.ts
   
   import { HfInference } from '@huggingface/inference';
   
   const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
   
   export async function generateWithMusicGen(lyrics: string, title: string) {
     const audioBlob = await hf.textToAudio({
       model: 'facebook/musicgen-small', // or 'musicgen-medium', 'musicgen-large'
       inputs: `${title}. ${lyrics}`,
     });
     
     return audioBlob; // Upload to S3 or storage
   }
   ```

---

### Option 2: Local Ollama + Custom Model
**What**: Self-hosted AI inference server  
**Pros**: Full privacy, no API costs, customizable  
**Cons**: Requires ML expertise, slower than cloud

#### Setup:
1. Install Ollama (https://ollama.ai)
2. Deploy music generation model
3. Call via local endpoint

#### Implementation:
```typescript
// apps/website/app/api/v1/sound-labs/me/projects/[projectId]/generate/ollama.ts

export async function generateWithOllama(lyrics: string, title: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'musicgen',
      prompt: `${title}: ${lyrics}`,
      stream: false,
    }),
  });
  
  const data = await response.json();
  // Process audio output
  return data.response;
}
```

---

### Option 3: Your Custom ML Model
**What**: Train your own music generation model  
**Pros**: Branded sound, full control  
**Cons**: Requires ML expertise, expensive to train

#### Approach:
1. Collect/license music training data
2. Fine-tune existing model (MusicGen base)
3. Deploy via FastAPI or TorchServe
4. Call from Sound Labs

#### Reference Implementation:
```typescript
// apps/website/app/api/v1/sound-labs/me/projects/[projectId]/generate/custom.ts

export async function generateWithCustomModel(lyrics: string, title: string) {
  const response = await fetch(process.env.CUSTOM_MODEL_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.CUSTOM_MODEL_KEY}` },
    body: JSON.stringify({
      prompt: `${title}: ${lyrics}`,
      duration: 30, // seconds
      temperature: 0.7,
    }),
  });
  
  return await response.arrayBuffer();
}
```

---

### Option 4: Hybrid (Recommended for Production)
**What**: Start with MusicGen, migrate to custom model over time  
**Pros**: Quick MVP, long-term customization  
**Cons**: More complex setup

#### Phased Approach:
```
Phase 1 (Week 1): MusicGen via Hugging Face API
Phase 2 (Week 3): Local Ollama + MusicGen fallback
Phase 3 (Month 2): Train custom model
Phase 4 (Month 3): Deploy custom model with MusicGen fallback
```

---

## Implementation Checklist

### Phase 1: Choose Engine
- [ ] Decide: MusicGen, Ollama, Custom, or Hybrid
- [ ] Set up chosen backend
- [ ] Test generation locally

### Phase 2: Integrate with Sound Labs
- [ ] Create engine-specific implementation file
- [ ] Update `/generate` route to call your engine
- [ ] Add environment variables
- [ ] Test via API

### Phase 3: Add Storage
- [ ] Set up S3 or Cloud Storage for audio files
- [ ] Update `generatedAudioUrl` to point to storage
- [ ] Add cleanup/retention policy

### Phase 4: Optimize
- [ ] Add caching for repeated requests
- [ ] Implement rate limiting (N generations per user)
- [ ] Monitor generation times
- [ ] Add error handling & retries

### Phase 5: Deploy
- [ ] Update database migration
- [ ] Deploy to VPS
- [ ] Test end-to-end
- [ ] Monitor generation quality

---

## Quick Start: MusicGen via Hugging Face

```bash
# 1. Get Hugging Face API key
# Visit https://huggingface.co/settings/tokens

# 2. Set environment variable
echo "HUGGINGFACE_API_KEY=hf_your_token" >> /home/dwise/wise2-core/.env.production

# 3. Install dependencies
cd /home/dwise/wise2-core
pnpm add @huggingface/inference

# 4. Update generate route (see below)

# 5. Test
curl -X POST http://localhost:3010/api/v1/sound-labs/me/projects/{id}/generate \
  -H "Authorization: Bearer dev_token_test" \
  -H "Content-Type: application/json" \
  -d '{"lyrics":"I am a AI music generator","title":"AI Song","engine":"musicgen"}'
```

---

## Files to Update

### 1. Create Engine Implementation
```
apps/website/app/api/v1/sound-labs/me/projects/[projectId]/generate/engines/
├── musicgen.ts
├── ollama.ts
├── custom.ts
└── index.ts (router)
```

### 2. Update Generate Route
```
apps/website/app/api/v1/sound-labs/me/projects/[projectId]/generate/route.ts
```

### 3. Database Migration
```
packages/db/prisma/migrations/[timestamp]_update_soundlabs_generation_fields/migration.sql
```

### 4. Environment Variables
```
.env.production
MUSIC_GEN_ENGINE=musicgen  # or ollama, custom
HUGGINGFACE_API_KEY=hf_...  # if using MusicGen
CUSTOM_MODEL_ENDPOINT=...  # if using custom model
STORAGE_BUCKET=...  # for audio files
```

---

## Next Steps

1. **Choose your engine** (reply with your choice)
2. **I'll implement the full integration** for your selected backend
3. **Deploy and test** end-to-end

---

## Questions?

- **Cost**: MusicGen via Hugging Face = ~$0.01 per generation. Ollama = $0 (self-hosted).
- **Quality**: MusicGen-large is best quality. musicgen-small is 2x faster.
- **Training data**: Your own lyrics + music styles for custom model.
- **Timeline**: MusicGen integration = 1 day. Custom model = 1-2 months.

**Which engine would you like to implement first?**
