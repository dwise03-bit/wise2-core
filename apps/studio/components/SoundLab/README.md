# Suno Music Generation Components

Professional audio production UI suite for WISE² Studio. Build complete music generation interfaces with these production-grade React components.

## Components Overview

### 1. SunoPromptBuilder
Advanced form for creating music generation prompts with fine-grained control.

**Features:**
- Large textarea for detailed prompt input (500 character limit)
- 50+ genre dropdown (Pop, Electronic, Hip-Hop, Classical, Jazz, etc.)
- 6 mood selector radio buttons (Happy, Sad, Energetic, Calm, Dark, Uplifting)
- Tempo slider (40-200 BPM, step 5)
- Duration buttons (10s, 30s, 60s)
- AI voice dropdown (12+ voices: Bella, Marco, Skye, etc.)
- Vocal/Instrumental toggle
- Key/Scale selector (C-B, Major/Minor)
- Loading state with spinner
- Pro tips panel with best practices

**Props:**
```typescript
interface SunoPromptBuilderProps {
  onGenerate: (params: SunoGenerationParams) => Promise<void>;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
import { SunoPromptBuilder } from '@/components/SoundLab';

export function MyComponent() {
  const handleGenerate = async (params) => {
    console.log('Generating with params:', params);
    // Call your API
  };

  return (
    <SunoPromptBuilder 
      onGenerate={handleGenerate}
      isLoading={false}
    />
  );
}
```

### 2. SunoGenerationQueue
Real-time queue and progress tracking for music generations.

**Features:**
- Current generation display with progress bar
- ETA countdown
- Generation settings summary (genre, mood, tempo, duration, voice)
- Queue list showing pending generations
- Recent generations (up to 10)
- Expandable details with tags and metadata
- Status badges (Queued, Generating, Completed, Failed)
- Retry button for failed generations
- Play count and file size metrics
- Empty state guidance

**Props:**
```typescript
interface SunoGenerationQueueProps {
  queue: SunoQueueItem[];
  currentGeneration?: SunoGeneration;
  recentGenerations: SunoGeneration[];
  onRetry?: (generationId: string) => void;
}
```

**Usage:**
```tsx
import { SunoGenerationQueue } from '@/components/SoundLab';

export function QueuePanel() {
  const { queue, currentGeneration, generations } = useYourState();

  return (
    <SunoGenerationQueue
      queue={queue}
      currentGeneration={currentGeneration}
      recentGenerations={generations}
      onRetry={handleRetry}
    />
  );
}
```

### 3. SunoLibrary
Searchable library of all generated music with filtering and export options.

**Features:**
- Dual view modes: grid and list
- Full-text search by prompt
- Multi-filter system:
  - Genre filter (by available genres)
  - Mood filter (Happy, Sad, Energetic, etc.)
  - Duration filter (10s, 30s, 60s)
  - Status filter (Queued, Generating, Completed, Failed)
  - Favorites only toggle
- Star/favorite toggle per track
- Expandable details with metadata
- "Add to SoundLab" button for clips
- "Export as ZIP" for bulk downloads
- Playable waveform visualization
- Responsive grid (1-3 columns depending on screen)
- Empty state with search tips

**Props:**
```typescript
interface SunoLibraryProps {
  generations: SunoGeneration[];
  onAddToSoundLab?: (generation: SunoGeneration) => void;
  onExport?: (generation: SunoGeneration, format: 'mp3' | 'wav' | 'flac') => Promise<void>;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
import { SunoLibrary } from '@/components/SoundLab';

export function LibraryPage() {
  const { generations } = useYourState();

  const handleExport = async (generation, format) => {
    await fetch(`/api/export`, {
      method: 'POST',
      body: JSON.stringify({ generationId: generation.id, format })
    });
  };

  return (
    <SunoLibrary
      generations={generations}
      onAddToSoundLab={handleAddToSoundLab}
      onExport={handleExport}
    />
  );
}
```

### 4. SunoTrackPreview
Detailed track preview with playback controls and metadata.

**Features:**
- Play/pause controls
- Waveform visualization with click-to-seek
- Progress bar with time display (current/total)
- Volume slider (0-100%)
- Reset button to rewind to start
- Metadata display:
  - Duration
  - Bitrate
  - File size
  - Play count
- Generation settings summary:
  - Genre, Mood, Tempo, Voice, Key/Scale, Vocal Type
- Multi-format export (MP3, WAV, FLAC) with loading states
- "Add to SoundLab" button
- "Regenerate" button to retry with same settings
- Status badge
- Status-dependent action visibility
- Hidden audio element for playback control

**Props:**
```typescript
interface SunoTrackPreviewProps {
  generation: SunoGeneration;
  onRegenerate?: (generation: SunoGeneration) => void;
  onExport?: (format: 'mp3' | 'wav' | 'flac') => Promise<void>;
  onAddToSoundLab?: () => void;
}
```

**Usage:**
```tsx
import { SunoTrackPreview } from '@/components/SoundLab';

export function PreviewPage({ generationId }) {
  const generation = useGetGeneration(generationId);

  const handleExport = async (format) => {
    const response = await fetch(`/api/export/${generationId}`, {
      method: 'POST',
      body: JSON.stringify({ format })
    });
    
    const blob = await response.blob();
    // Trigger download...
  };

  return (
    <SunoTrackPreview
      generation={generation}
      onExport={handleExport}
      onRegenerate={handleRegenerate}
      onAddToSoundLab={handleAdd}
    />
  );
}
```

## Type Definitions

All types are defined in `/apps/studio/types/suno.ts`:

```typescript
// Generation parameters
interface SunoGenerationParams {
  prompt: string;
  genre: SunoGenre;
  mood: SunoMood;
  tempo: number; // 40-200 BPM
  duration: number; // 10, 30, or 60
  voice: SunoVoice;
  vocalType: 'Vocal' | 'Instrumental';
  key: SunoKey;
  scale: 'Major' | 'Minor';
}

// Complete generation record
interface SunoGeneration {
  id: string;
  params: SunoGenerationParams;
  status: GenerationStatus; // Queued, Generating, Completed, Failed
  createdAt: Date;
  completedAt?: Date;
  audioUrl?: string;
  waveformData?: number[];
  duration: number;
  bitrate: string;
  fileSize: string;
  tags: string[];
  isFavorite: boolean;
  playCount: number;
  exportedFormats: ('mp3' | 'wav' | 'flac')[];
}
```

## Custom Hook

The `useSunoMusicGeneration` hook provides complete state management:

```typescript
import { useSunoMusicGeneration } from '@/hooks/useSunoMusicGeneration';

export function MyComponent() {
  const {
    generations,
    queue,
    currentGeneration,
    isLoading,
    error,
    generate,
    exportGeneration,
    retryGeneration,
    toggleFavorite,
    deleteGeneration,
    addToSoundLab,
  } = useSunoMusicGeneration({
    onGenerationStart: (gen) => console.log('Started:', gen),
    onGenerationComplete: (gen) => console.log('Done:', gen),
    onGenerationError: (err) => console.error('Error:', err),
    autoPolling: true,
    pollingInterval: 2000,
  });

  return (
    // Use hook state and actions here
  );
}
```

## Complete Integration Example

See `SunoIntegrationExample.tsx` for a fully working example that combines all components with tab navigation, state management, and complete API integration.

```typescript
import { SunoIntegrationExample } from '@/components/SoundLab/SunoIntegrationExample';

export default function Page() {
  return <SunoIntegrationExample />;
}
```

## Design System

All components use the WISE² design system:

- **Dark theme**: `bg-studio-bg` (#050505)
- **Surfaces**: `bg-studio-panel` (#0a0a0a)
- **Accent color**: `text-wise-accent` (#39FF14 neon green)
- **Text colors**:
  - Primary: `text-wise-text-primary` (white)
  - Secondary: `text-wise-text-secondary` (#C9CED6)
  - Muted: `text-wise-text-muted` (#8D98A5)
- **Borders**: `border-wise-medium` (12% white opacity)
- **Animations**: Framer Motion with smooth transitions
- **Glassmorphism**: Backdrop blur with semi-transparent backgrounds

## Features Summary

| Feature | Builder | Queue | Library | Preview |
|---------|---------|-------|---------|---------|
| Prompt input | ✅ | — | — | — |
| Genre selection | ✅ | — | ✅ | ✅ |
| Mood selector | ✅ | — | ✅ | ✅ |
| Tempo control | ✅ | — | — | ✅ |
| Duration selector | ✅ | — | ✅ | ✅ |
| Voice picker | ✅ | — | — | ✅ |
| Real-time progress | — | ✅ | — | — |
| Queue management | — | ✅ | — | — |
| Search/filtering | — | — | ✅ | — |
| Favorites | — | — | ✅ | — |
| Playback controls | — | — | — | ✅ |
| Waveform viz | — | — | ✅ | ✅ |
| Export formats | — | — | ✅ | ✅ |
| Add to SoundLab | — | — | ✅ | ✅ |

## API Endpoints Expected

These components expect the following API endpoints:

```
POST /api/suno/generate
POST /api/suno/export/{generationId}
GET /api/suno/status/{generationId}
GET /api/suno/generations
POST /api/soundlab/add-clip
```

## Performance Notes

- Components use React.memo and motion.AnimatePresence for optimized renders
- Waveform data is precomputed and cached
- Virtualization not needed (typical <100 generations)
- All state updates are memoized callbacks
- Polling intervals configurable for rate limiting

## Accessibility

- Semantic HTML with proper labels
- ARIA attributes where needed
- Keyboard navigation support
- High contrast colors (AA WCAG compliant)
- Loading states announced to screen readers
- Focus management in modals

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

- react: ^18.3.1
- framer-motion: ^11.0.3
- lucide-react: ^0.312.0
- TypeScript: ^5.3.3

No additional dependencies required beyond what's already in `@wise2/studio`.
