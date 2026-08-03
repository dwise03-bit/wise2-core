# Music Generation Prompt Builder - Integration Guide

Complete guide for integrating the Music Generation Prompt Builder into WISE² Creative Studio.

## Quick Start (5 minutes)

### 1. Import Component

```typescript
import { MusicGenerationPromptBuilder } from '@/components/MusicGeneration';

export default function SoundLabPage() {
  return <MusicGenerationPromptBuilder />;
}
```

### 2. Verify API Endpoint

The component expects `/api/suno/generate` endpoint. Verify it exists:

```bash
curl -X POST http://localhost:3005/api/suno/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"text-to-song","description":"test"}'
```

### 3. Test Generation

Fill form and click "Generate" button. Check browser console for request/response.

---

## Full Integration Steps

### Step 1: Set Up API Endpoint

Create/update `/apps/api/src/routes/suno.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { generateMusic } from '../services/sunoService';

const router = Router();

interface GenerationRequest {
  mode: 'text-to-song';
  description: string;
  genres: string[];
  mood: string;
  tempo: number;
  instruments: string[];
  duration: number;
  customVoiceId?: string;
  key: string;
  scale: string;
  intensity: number;
  variants: number;
  quality: 'standard' | 'high' | 'ultra';
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const payload: GenerationRequest = req.body;

    // Validate required fields
    if (!payload.description || !payload.genres?.length) {
      return res.status(400).json({
        error: 'Missing required fields: description, genres',
      });
    }

    // Map quality to Suno API parameters
    const qualityMap = {
      standard: { model: 'chirp-v3', version: '1' },
      high: { model: 'chirp-v3', version: '2' },
      ultra: { model: 'chirp-v3', version: '3' },
    };

    // Build Suno prompt
    const sunoPrompt = buildSunoPrompt({
      description: payload.description,
      genres: payload.genres,
      mood: payload.mood,
      tempo: payload.tempo,
      instruments: payload.instruments,
      key: payload.key,
      scale: payload.scale,
      intensity: payload.intensity,
    });

    // Call Suno API
    const result = await generateMusic({
      prompt: sunoPrompt,
      tags: payload.genres.join(', '),
      duration: payload.duration,
      quality: qualityMap[payload.quality],
      variants: payload.variants,
    });

    // Save to database
    const track = await db.GeneratedTrack.create({
      title: `${payload.genres[0]} - ${new Date().toLocaleTimeString()}`,
      description: payload.description,
      genre: payload.genres[0],
      mood: payload.mood,
      tempo: payload.tempo,
      duration: payload.duration,
      instruments: payload.instruments,
      key: payload.key,
      scale: payload.scale,
      sunoId: result.id,
      status: 'generating',
      userId: req.user?.id,
    });

    res.json({
      success: true,
      trackId: track.id,
      sunoId: result.id,
      status: 'generating',
      estimatedTime: estimateTime(payload.quality, payload.duration),
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Generation failed',
    });
  }
});

export default router;
```

### Step 2: Register Route in Main App

In `/apps/api/src/main.ts`:

```typescript
import sunoRouter from './routes/suno';

app.use('/api/suno', sunoRouter);
```

### Step 3: Set Up Database Schema

Using Prisma in `/packages/db/schema.prisma`:

```prisma
model GeneratedTrack {
  id        String    @id @default(cuid())
  title     String
  description String?
  genre     String
  mood      String
  tempo     Int
  duration  Int
  instruments String[]
  key       String
  scale     String
  sunoId    String    @unique
  status    String    @default("generating") // generating, complete, failed
  progress  Int       @default(0)
  audioUrl  String?
  waveform  String?   // JSON array as string
  isFavorite Boolean  @default(false)
  tags      String[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  userId    String
  user      User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([sunoId])
}
```

Run migration:

```bash
cd packages/db
npx prisma migrate dev --name add_generated_tracks
```

### Step 4: Add Music Library Integration

In `/apps/studio/hooks/useAIMusicEnhanced.ts`, add handler:

```typescript
const handleGenerationComplete = useCallback(async (trackId: string) => {
  try {
    const response = await fetch(`/api/suno/tracks/${trackId}`);
    const track = await response.json();

    // Add to library
    setLibrary(prev => ({
      ...prev,
      tracks: [track, ...prev.tracks],
    }));

    // Update UI
    setCurrentGeneration(track);
    setIsGenerating(false);
  } catch (error) {
    console.error('Failed to load track:', error);
  }
}, []);
```

### Step 5: Add Polling for Generation Status

Create `/apps/studio/services/trackPolling.ts`:

```typescript
export async function pollTrackStatus(
  trackId: string,
  maxAttempts = 120,
  interval = 2000
): Promise<GeneratedTrack> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/suno/tracks/${trackId}`);
        const track = await response.json();

        if (track.status === 'complete') {
          clearInterval(timer);
          resolve(track);
        } else if (track.status === 'failed') {
          clearInterval(timer);
          reject(new Error('Generation failed'));
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(timer);
          reject(new Error('Generation timeout'));
        }
      } catch (error) {
        clearInterval(timer);
        reject(error);
      }
    }, interval);
  });
}
```

### Step 6: Connect UI to Polling

Update PromptBuilder or use hook:

```typescript
import { pollTrackStatus } from '@/services/trackPolling';

const handleGenerate = async () => {
  const response = await fetch('/api/suno/generate', {
    method: 'POST',
    body: JSON.stringify(state),
  });

  const { trackId, sunoId } = await response.json();

  try {
    const completedTrack = await pollTrackStatus(trackId);
    // Track is complete, update UI
  } catch (error) {
    // Handle error
  }
};
```

---

## Data Flow Diagram

```
┌──────────────────────┐
│ Music Prompt Builder │
│   (React Component)  │
└──────────┬───────────┘
           │
           │ POST /api/suno/generate
           ▼
┌──────────────────────┐
│   API Endpoint       │
│  (Express/NestJS)    │
└──────────┬───────────┘
           │
           │ Validate & Transform
           ▼
┌──────────────────────┐
│  Suno.com API        │
│  (Generation Model)  │
└──────────┬───────────┘
           │
           │ Audio Generation
           ▼
┌──────────────────────┐
│   Cloud Storage      │
│  (Upload Audio)      │
└──────────┬───────────┘
           │
           │ Poll Status
           ▼
┌──────────────────────┐
│  Database            │
│  (Save Track Info)   │
└──────────┬───────────┘
           │
           │ Return to UI
           ▼
┌──────────────────────┐
│  Music Library       │
│  (Add to Playlist)   │
└──────────────────────┘
```

---

## Environment Variables

Add to `.env.local`:

```env
# Suno API
SUNO_API_KEY=your_suno_api_key
SUNO_API_BASE_URL=https://api.suno.com

# Generation Settings
MUSIC_GENERATION_TIMEOUT=300000
MUSIC_GENERATION_MAX_RETRIES=5
MUSIC_GENERATION_POLL_INTERVAL=2000

# Storage
AUDIO_STORAGE_BUCKET=wise2-audio-tracks
AUDIO_CDN_URL=https://cdn.wise2.net
```

---

## Component Customization

### Change Default Tempo

In `PromptBuilder.tsx`:

```typescript
const [state, setState] = useState<PromptBuilderState>({
  // ...
  tempo: 140, // Changed from 120
});
```

### Add Custom Genres

In `constants/musicGeneration.ts`:

```typescript
export const GENRE_CATEGORIES = {
  // Add your category
  'Experimental': ['Noise', 'Glitch', 'Generative'],
  // ... rest of categories
};
```

### Customize Voice List

In `PromptBuilder.tsx` or constants:

```typescript
const VOICES = [
  // Add your voice definitions
  {
    id: 'custom-voice-1',
    name: 'Custom Voice',
    gender: 'Male',
    accent: 'American',
    sample: '/samples/voices/custom.mp3',
  },
];
```

### Change Color Scheme

Update Tailwind theme in `apps/studio/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'wise-accent': '#FF00FF', // Change accent color
    },
  },
}
```

---

## API Response Handling

### Success Response

```json
{
  "success": true,
  "trackId": "track-uuid",
  "sunoId": "suno-id",
  "status": "generating",
  "estimatedTime": 60
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid description",
  "code": "VALIDATION_ERROR"
}
```

### Track Status Polling

GET `/api/suno/tracks/{trackId}`:

```json
{
  "id": "track-uuid",
  "sunoId": "suno-id",
  "status": "complete",
  "progress": 100,
  "audioUrl": "https://cdn.wise2.net/audio/track-uuid.mp3",
  "waveform": [0, 0.5, 0.8, ...],
  "title": "Electronic - 14:32:05",
  "genre": "Electronic",
  "mood": "energetic",
  "tempo": 128,
  "duration": 30,
  "instruments": ["synth", "drums", "bass"]
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Form validation works (try empty description)
- [ ] Genre search filters correctly
- [ ] Tap tempo detects BPM accurately
- [ ] localStorage auto-save persists state
- [ ] API request sends correct payload
- [ ] Progress bar updates smoothly
- [ ] Error handling shows appropriate messages
- [ ] Responsive design works on mobile (375px)
- [ ] Responsive design works on tablet (768px)
- [ ] Responsive design works on desktop (1280px)
- [ ] All animations are smooth (60fps)
- [ ] Voice preview audio plays
- [ ] Mood preview audio plays
- [ ] Advanced settings expand/collapse correctly

### Unit Tests

Create `components/MusicGeneration/__tests__/PromptBuilder.test.tsx`:

```typescript
describe('MusicGenerationPromptBuilder', () => {
  it('validates description is required', () => {
    // Test empty description validation
  });

  it('validates at least one genre required', () => {
    // Test genre validation
  });

  it('auto-saves state to localStorage', () => {
    // Test auto-save functionality
  });

  it('handles tap tempo correctly', () => {
    // Test tap tempo calculation
  });

  it('submits correct payload to API', async () => {
    // Test API submission
  });

  it('displays progress during generation', async () => {
    // Test progress bar updates
  });

  it('filters voices by gender and accent', () => {
    // Test voice filtering
  });
});
```

---

## Performance Optimization

### Code Splitting

Lazy load component:

```typescript
import dynamic from 'next/dynamic';

const MusicBuilder = dynamic(
  () => import('@/components/MusicGeneration'),
  { loading: () => <p>Loading...</p> }
);
```

### Image Optimization

Store genre icons/mood emojis as SVG:

```typescript
const MOOD_ICONS = {
  happy: <HappySVG />,
  sad: <SadSVG />,
  // ...
};
```

### State Normalization

Use normalized state for large voice/genre lists:

```typescript
// Before: genres as strings in array
const genres = ['Pop', 'Electronic', ...]; // 100+ items

// After: normalized with ID lookup
const genreIds = new Set(['genre-1', 'genre-2']);
const genreMap = { 'genre-1': { id, name: 'Pop', ... } };
```

---

## Deployment Checklist

- [ ] API endpoint is deployed and tested
- [ ] Database migrations are applied
- [ ] Environment variables are configured
- [ ] Suno API credentials are set
- [ ] Audio storage bucket is created
- [ ] CDN is configured for audio delivery
- [ ] Error logging is enabled
- [ ] Rate limiting is configured
- [ ] User authentication is required
- [ ] Audio files are validated before saving
- [ ] Old tracks are automatically pruned

---

## Troubleshooting

### Issue: "Generation failed"

**Solution**: Check API logs for Suno API errors. Verify API key and rate limits.

### Issue: Progress bar stuck at 95%

**Solution**: Increase poll timeout. Check `/api/suno/tracks/{trackId}` endpoint response.

### Issue: localStorage quota exceeded

**Solution**: Clear old tracks from localStorage or increase storage limit.

### Issue: Voices not loading

**Solution**: Check voice sample audio URLs. Verify CORS is enabled for audio CDN.

### Issue: Mobile layout broken

**Solution**: Test with `md:` and `lg:` breakpoints. Use Tailwind's responsive design patterns.

---

## Future Enhancements

1. **Lyric Sync**: Show lyrics synced to generated audio
2. **Remix Mode**: Combine multiple generated tracks
3. **Voice Cloning**: Upload voice samples for custom voices
4. **Prompt History**: Browse and reuse past prompts
5. **Social Sharing**: Share prompts and tracks with team
6. **A/B Testing**: Compare multiple variants side-by-side
7. **Live Preview**: Real-time MIDI preview while building prompt
8. **Marketplace**: Purchase/download community-created prompts

---

## Support & Documentation

- **Component README**: `components/MusicGeneration/README.md`
- **Hook Reference**: `hooks/useMusicPromptBuilder.ts`
- **Constants**: `constants/musicGeneration.ts`
- **Example Page**: `components/MusicGeneration/Example.tsx`
- **API Documentation**: See `/api/suno/README.md` (to be created)

---

**Last Updated**: 2026-07-24  
**Version**: 1.0.0  
**Maintainer**: WISE² Creative Studio Team
