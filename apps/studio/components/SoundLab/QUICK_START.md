# Suno Components - Quick Start Guide

## File Structure

```
apps/studio/
├── components/SoundLab/
│   ├── SunoPromptBuilder.tsx          # Music prompt form with full controls
│   ├── SunoGenerationQueue.tsx        # Real-time queue & progress tracking
│   ├── SunoLibrary.tsx                # Searchable library with filtering
│   ├── SunoTrackPreview.tsx           # Track player with metadata
│   ├── SunoIntegrationExample.tsx     # Complete working example
│   ├── index.ts                       # Barrel export
│   ├── README.md                      # Full documentation
│   └── QUICK_START.md                 # This file
├── hooks/
│   └── useSunoMusicGeneration.ts      # State management hook
└── types/
    └── suno.ts                        # Type definitions
```

## 5-Minute Setup

### 1. Import Components

```tsx
import {
  SunoPromptBuilder,
  SunoGenerationQueue,
  SunoLibrary,
  SunoTrackPreview,
} from '@/components/SoundLab';
```

### 2. Use the Hook

```tsx
import { useSunoMusicGeneration } from '@/hooks/useSunoMusicGeneration';

export function MyPage() {
  const {
    generations,
    queue,
    currentGeneration,
    generate,
    exportGeneration,
  } = useSunoMusicGeneration({
    onGenerationComplete: (gen) => console.log('Done!', gen),
  });

  return (
    <>
      <SunoPromptBuilder onGenerate={generate} />
      <SunoGenerationQueue
        queue={queue}
        currentGeneration={currentGeneration}
        recentGenerations={generations}
      />
    </>
  );
}
```

### 3. Or Use the Complete Example

```tsx
import { SunoIntegrationExample } from '@/components/SoundLab/SunoIntegrationExample';

export default function Page() {
  return <SunoIntegrationExample />;
}
```

## Component Props at a Glance

### SunoPromptBuilder
```tsx
<SunoPromptBuilder
  onGenerate={async (params) => { /* Call API */ }}
  isLoading={false}
/>
```

### SunoGenerationQueue
```tsx
<SunoGenerationQueue
  queue={queue}                    // SunoQueueItem[]
  currentGeneration={current}      // SunoGeneration | undefined
  recentGenerations={recent}       // SunoGeneration[]
  onRetry={(id) => { /* Retry failed generation */ }}
/>
```

### SunoLibrary
```tsx
<SunoLibrary
  generations={allGenerations}     // SunoGeneration[]
  onAddToSoundLab={(gen) => {}}    // Add to clip library
  onExport={async (gen, fmt) => {}} // Export as mp3/wav/flac
  isLoading={false}
/>
```

### SunoTrackPreview
```tsx
<SunoTrackPreview
  generation={selectedTrack}       // SunoGeneration
  onRegenerate={(gen) => {}}       // Regenerate with same settings
  onExport={async (fmt) => {}}     // Export track
  onAddToSoundLab={() => {}}       // Add to SoundLab
/>
```

## Core Features

### SunoPromptBuilder
- 500-char prompt textarea
- 50+ genre dropdown
- 6 mood radio buttons
- 40-200 BPM tempo slider
- 10/30/60s duration buttons
- 12+ AI voice selector
- Vocal/Instrumental toggle
- Key/Scale selector
- Pro tips panel

### SunoGenerationQueue
- Current generation progress bar
- ETA countdown
- Recent generations list
- Status badges
- Retry failed generations
- Metadata display

### SunoLibrary
- Grid (3 columns) / List view toggle
- Full-text search by prompt
- Filter by: Genre, Mood, Duration, Status
- Favorites toggle
- Add to SoundLab
- Export (MP3/WAV/FLAC)
- Responsive, mobile-friendly

### SunoTrackPreview
- Play/Pause controls
- Interactive waveform (click to seek)
- Volume slider (0-100%)
- Time display (current/total)
- Metadata grid (duration, bitrate, file size, plays)
- Generation settings display
- Export buttons
- Regenerate button

## Styling

All components use WISE² design system:

```css
/* Dark theme colors */
--studio-bg: #050505              /* Page background */
--studio-panel: #0a0a0a           /* Card background */
--studio-input: #161616           /* Input background */
--studio-line: #262626            /* Border color */

/* Text colors */
--wise-text-primary: #FFFFFF      /* Main text */
--wise-text-secondary: #C9CED6    /* Secondary text */
--wise-text-muted: #8D98A5        /* Muted text */

/* Accent color (neon green) */
--wise-accent: #39FF14            /* Primary accent */
```

Components use:
- Framer Motion for smooth animations
- Glassmorphism cards with backdrop blur
- Lucide React icons
- Tailwind CSS for styling

## API Integration

Components expect these endpoints (implement as needed):

```typescript
// Start music generation
POST /api/suno/generate
Request: SunoGenerationParams
Response: { id: string }

// Check generation status
GET /api/suno/status/{generationId}
Response: { status, progress, audioUrl?, waveformData? }

// Export generation
POST /api/suno/export/{generationId}
Request: { format: 'mp3' | 'wav' | 'flac' }
Response: Blob (audio file)

// Load all generations
GET /api/suno/generations
Response: SunoGeneration[]

// Add generation to SoundLab as clip
POST /api/soundlab/add-clip
Request: { generationId, audioUrl, metadata }
Response: { clipId, ... }
```

## State Management Pattern

The `useSunoMusicGeneration` hook handles:

```tsx
const {
  // State
  generations,        // All generated tracks
  queue,             // Pending queue
  currentGeneration, // Now playing
  isLoading,         // Loading flag
  error,             // Error object

  // Actions
  generate,          // Start new generation
  exportGeneration,  // Export track
  retryGeneration,   // Retry failed track
  toggleFavorite,    // Star/unstar track
  deleteGeneration,  // Delete track
  addToSoundLab,     // Add to clip library
} = useSunoMusicGeneration({
  onGenerationStart: (gen) => {},
  onGenerationComplete: (gen) => {},
  onGenerationError: (err) => {},
  autoPolling: true,
  pollingInterval: 2000,
});
```

## Complete Page Example

```tsx
'use client';

import { useState } from 'react';
import { useSunoMusicGeneration } from '@/hooks/useSunoMusicGeneration';
import { SunoPromptBuilder, SunoGenerationQueue, SunoLibrary } from '@/components/SoundLab';

export default function Page() {
  const [tab, setTab] = useState<'create' | 'queue' | 'library'>('create');

  const {
    generations,
    queue,
    currentGeneration,
    isLoading,
    generate,
    exportGeneration,
  } = useSunoMusicGeneration();

  return (
    <div className="min-h-screen bg-studio-bg p-6">
      <h1 className="text-3xl font-bold mb-8">Suno Music Generator</h1>

      <div className="flex gap-4 mb-8">
        {['create', 'queue', 'library'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              tab === t
                ? 'bg-wise-accent text-studio-panel'
                : 'bg-studio-input text-wise-text-primary'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <SunoPromptBuilder onGenerate={generate} isLoading={isLoading} />
      )}

      {tab === 'queue' && (
        <SunoGenerationQueue
          queue={queue}
          currentGeneration={currentGeneration}
          recentGenerations={generations}
        />
      )}

      {tab === 'library' && (
        <SunoLibrary
          generations={generations}
          onExport={exportGeneration}
        />
      )}
    </div>
  );
}
```

## Common Tasks

### Generate Music
```tsx
const { generate } = useSunoMusicGeneration();

await generate({
  prompt: 'upbeat electronic dance track',
  genre: 'Electronic',
  mood: 'Energetic',
  tempo: 120,
  duration: 30,
  voice: 'Bella',
  vocalType: 'Vocal',
  key: 'C',
  scale: 'Major',
});
```

### Export a Track
```tsx
const { exportGeneration } = useSunoMusicGeneration();

await exportGeneration(generationId, 'mp3');
// File downloads automatically
```

### Add to SoundLab
```tsx
const { addToSoundLab } = useSunoMusicGeneration();

const clip = await addToSoundLab(generation);
console.log('Clip created:', clip);
```

### Retry Failed Generation
```tsx
const { retryGeneration } = useSunoMusicGeneration();

await retryGeneration(failedGenerationId);
// Same settings, new attempt
```

## Troubleshooting

### Components not rendering
- Ensure `/types/suno.ts` exists
- Check Tailwind config has WISE² colors
- Verify Framer Motion is installed

### API calls failing
- Implement the expected endpoints in your backend
- Check CORS headers if using different domain
- Log response in browser dev tools

### Styling looks off
- Verify dark theme is applied globally
- Check that studio-* and wise-* colors are in Tailwind config
- Ensure no conflicting CSS overrides

### Performance issues
- Reduce polling interval if not real-time critical
- Limit recent generations display (library shows last 10)
- Consider virtualizing long lists (not needed for <100 items)

## Next Steps

1. ✅ Copy components to your project
2. ✅ Implement the 4 API endpoints
3. ✅ Integrate with your state management (Redux, Zustand, etc.)
4. ✅ Customize colors if needed
5. ✅ Add error boundaries and toast notifications
6. ✅ Test on mobile devices
7. ✅ Add analytics tracking for user events

## Support

For detailed documentation, see `README.md` in this directory.

For complete working example, see `SunoIntegrationExample.tsx`.
