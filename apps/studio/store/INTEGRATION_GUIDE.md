# Store Integration Guide

Complete guide for integrating Zustand stores into Creative Studio components.

## Setup

### 1. Install Dependencies

Already added to `apps/studio/package.json`:

```bash
pnpm install zustand
```

### 2. Add Provider Wrapper (Optional)

While not required (Zustand uses React context internally), you may want a provider for consistency:

```typescript
// app/providers.tsx
'use client';

import { ReactNode } from 'react';

export function StudioProviders({ children }: { children: ReactNode }) {
  // Stores initialize automatically with Zustand
  // This wrapper can be used for middleware or global setup
  return <>{children}</>;
}
```

```typescript
// app/layout.tsx
import { StudioProviders } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <StudioProviders>{children}</StudioProviders>
      </body>
    </html>
  );
}
```

### 3. Update TypeScript Paths (if needed)

Ensure `@/store` resolves correctly in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/store": ["./store/index.ts"]
    }
  }
}
```

---

## Component Integration

### Basic Hook Usage

```typescript
'use client';
import { useSunoStore } from '@/store';

export function MusicGenerator() {
  const {
    currentGeneration,
    submitGeneration,
    updateGenerationStatus,
  } = useSunoStore();

  const handleGenerate = async () => {
    await submitGeneration({
      mode: 'text-to-song',
      description: 'Upbeat pop track',
      genre: 'pop',
      mood: 'happy',
      tempo: 128,
      instruments: ['piano', 'drums'],
      duration: 30,
    });

    // Progress is updated via store, triggering re-render
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      <progress value={currentGeneration.progress} max={100} />
      <p>Status: {currentGeneration.status}</p>
    </div>
  );
}
```

### Using Selectors for Performance

```typescript
'use client';
import { useSunoStore, sunoSelectors } from '@/store';

export function TrackPreview() {
  // Only re-render when selectedTrack changes
  const selectedTrack = sunoSelectors.selectSelectedTrack();
  const isPlaying = sunoSelectors.selectIsPlaying();
  const { playTrack, pauseTrack } = useSunoStore();

  if (!selectedTrack) {
    return <p>No track selected</p>;
  }

  return (
    <div>
      <h3>{selectedTrack.title}</h3>
      <button onClick={() => isPlaying ? pauseTrack() : playTrack(selectedTrack)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

### Accessing Multiple Stores

```typescript
'use client';
import { useSunoStore, useObsStore } from '@/store';

export function MusicInStream() {
  const sunoStore = useSunoStore();
  const obsStore = useObsStore();

  const { selectedTrack } = sunoStore;
  const { activeSceneId } = obsStore;

  return (
    <div>
      {selectedTrack && <p>Playing: {selectedTrack.title}</p>}
      {activeSceneId && <p>Scene: {activeSceneId}</p>}
    </div>
  );
}
```

---

## Advanced Patterns

### 1. Listening to Specific State Changes

Use Zustand's subscription directly for advanced cases:

```typescript
'use client';
import { useEffect } from 'react';
import { useSunoStore } from '@/store';

export function GenerationMonitor() {
  useEffect(() => {
    const unsubscribe = useSunoStore.subscribe(
      (state) => state.currentGeneration.progress,
      (progress) => {
        console.log(`Progress: ${progress}%`);
        // Trigger custom logic (analytics, notifications, etc.)
      }
    );

    return unsubscribe;
  }, []);

  return <div>Monitoring generation...</div>;
}
```

### 2. Computed/Derived State

Create custom hooks for derived state:

```typescript
'use client';
import { useSunoStore } from '@/store';

export function useFavoriteTrackStats() {
  const favorites = useSunoStore((state) => state.favorites);
  const history = useSunoStore((state) => state.generationHistory);

  const favoriteTracks = history.filter((t) => favorites.includes(t.id));
  const avgTempo = favoriteTracks.length > 0
    ? favoriteTracks.reduce((sum, t) => sum + t.tempo, 0) / favoriteTracks.length
    : 0;

  return {
    count: favoriteTracks.length,
    tracks: favoriteTracks,
    avgTempo,
  };
}

// Usage
export function FavoriteStats() {
  const { count, avgTempo } = useFavoriteTrackStats();
  return <p>{count} favorites, avg tempo: {avgTempo.toFixed(0)} bpm</p>;
}
```

### 3. Cross-Store Side Effects

Coordinate state changes between stores:

```typescript
'use client';
import { useEffect } from 'react';
import { useSunoStore, useObsStore, useCreativeStudioStore } from '@/store';

export function StreamMusicSync() {
  const sunoStore = useSunoStore();
  const obsStore = useObsStore();
  const creativeStore = useCreativeStudioStore();

  // When user switches OBS scene, auto-play linked track
  useEffect(() => {
    const unsubscribe = obsStore.subscribe(
      (state) => state.activeSceneId,
      (sceneId) => {
        if (!sceneId) return;

        const linkedTrack = creativeStore.getLinkedTrackBySceneId(sceneId);
        if (linkedTrack?.autoPlayOnSceneSwitch) {
          const track = sunoStore.generationHistory.find(
            (t) => t.id === linkedTrack.sunoTrackId
          );
          if (track) sunoStore.playTrack(track);
        }
      }
    );

    return unsubscribe;
  }, [sunoStore, obsStore, creativeStore]);

  return null; // Just handles side effects
}
```

### 4. Batch Updates

Update multiple store values together:

```typescript
'use client';
import { useSunoStore } from '@/store';

export function useBatchUpdateTrack() {
  const {
    addToHistory,
    addToFavorites,
    createPlaylist,
    addToPlaylist,
  } = useSunoStore();

  const addTrackWithMetadata = (track: GeneratedTrack) => {
    // All updates happen atomically
    addToHistory(track);
    addToFavorites(track.id);

    const playlist = createPlaylist('Recent Favorites');
    addToPlaylist(playlist.id, track.id);
  };

  return { addTrackWithMetadata };
}
```

### 5. Async Operations with Loading State

```typescript
'use client';
import { useState } from 'react';
import { useSunoStore } from '@/store';
import type { GenerationParams } from '@/types/aimusic';

export function AsyncGenerationForm() {
  const { submitGeneration, setGenerationError } = useSunoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);

    try {
      await submitGeneration(params);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setGenerationError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Extract form data and call handleSubmit
    }}>
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
}
```

### 6. Persistent Forms with Store

```typescript
'use client';
import { useSunoStore } from '@/store';

export function PersistentGenerationForm() {
  const { currentGeneration, submitGeneration } = useSunoStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await submitGeneration({
      mode: 'text-to-song',
      description: formData.get('description') as string,
      genre: formData.get('genre') as string,
      mood: formData.get('mood') as string,
      tempo: parseInt(formData.get('tempo') as string),
      instruments: (formData.get('instruments') as string).split(','),
      duration: parseInt(formData.get('duration') as string),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="description"
        placeholder="Describe your track"
        defaultValue={currentGeneration.settings.description}
      />
      {/* More form fields */}
      <button type="submit">Generate</button>
    </form>
  );
}
```

---

## Testing

### Unit Testing with Zustand

```typescript
// __tests__/sunoStore.test.ts
import { useSunoStore } from '@/store';
import type { GeneratedTrack } from '@/types/aimusic';

describe('Suno Store', () => {
  beforeEach(() => {
    useSunoStore.getState().reset();
  });

  it('should add track to history', () => {
    const store = useSunoStore.getState();
    const mockTrack: GeneratedTrack = {
      id: 'test-1',
      type: 'song',
      genre: 'pop',
      mood: 'happy',
      tempo: 120,
      duration: 30,
      instruments: [],
      prompt: 'Test track',
      createdAt: new Date(),
      modifiedAt: new Date(),
      status: 'complete',
      progress: 100,
      isFavorite: false,
      tags: [],
    };

    store.addToHistory(mockTrack);

    expect(store.generationHistory).toHaveLength(1);
    expect(store.generationHistory[0].id).toBe('test-1');
  });

  it('should toggle favorite', () => {
    const store = useSunoStore.getState();
    
    store.addToFavorites('test-1');
    expect(store.isFavorite('test-1')).toBe(true);

    store.removeFromFavorites('test-1');
    expect(store.isFavorite('test-1')).toBe(false);
  });
});
```

### Component Testing

```typescript
// __tests__/MusicGenerator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MusicGenerator } from '@/components/MusicGenerator';
import { useSunoStore } from '@/store';

jest.mock('@/store');

describe('MusicGenerator', () => {
  it('should call submitGeneration on button click', () => {
    const mockSubmitGeneration = jest.fn();
    (useSunoStore as jest.Mock).mockReturnValue({
      currentGeneration: { status: 'idle', progress: 0, error: null },
      submitGeneration: mockSubmitGeneration,
    });

    render(<MusicGenerator />);
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    expect(mockSubmitGeneration).toHaveBeenCalled();
  });
});
```

---

## Performance Optimization Tips

### 1. Use Selectors Liberally

```typescript
// Good - Won't re-render unless selectedTrack changes
const selectedTrack = sunoSelectors.selectSelectedTrack();

// Avoid - Re-renders on any state change
const { selectedTrack } = useSunoStore();
```

### 2. Memoize Expensive Components

```typescript
'use client';
import { memo } from 'react';
import { sunoSelectors } from '@/store';

const TrackList = memo(() => {
  const history = sunoSelectors.selectHistory();
  return (
    <ul>
      {history.map((track) => (
        <li key={track.id}>{track.title}</li>
      ))}
    </ul>
  );
});
```

### 3. Avoid Derived State in Store

Keep stores as single sources of truth; compute derived state in components:

```typescript
// Good - Compute in component
const favTracks = sunoStore.generationHistory.filter((t) => t.isFavorite);

// Avoid - Redundant state in store
// Store should not duplicate generationHistory data
```

### 4. Lazy Load History

For large datasets, implement pagination:

```typescript
'use client';
import { useSunoStore } from '@/store';

export function HistoryList() {
  const history = useSunoStore((state) => state.generationHistory);
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);

  const paginatedHistory = history.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  return (
    <div>
      {paginatedHistory.map((track) => (
        <div key={track.id}>{track.title}</div>
      ))}
      <button onClick={() => setPage(page + 1)}>Load More</button>
    </div>
  );
}
```

---

## Debugging

### Enable Zustand DevTools

Stores already include `devtools` middleware. View state in Redux DevTools Extension:

1. Install Redux DevTools Extension (Chrome/Firefox)
2. Open DevTools
3. Go to Redux tab
4. Inspect store actions and state history

### Console Logging

```typescript
// Watch all state changes
useSunoStore.subscribe(console.log);

// Watch specific changes
useSunoStore.subscribe(
  (state) => state.generationHistory.length,
  (len) => console.log('History length changed to', len)
);

// Get current state
console.log(useSunoStore.getState());
```

### Common Issues

**Issue**: Component not re-rendering on state change
```typescript
// Wrong - No subscription
const state = useSunoStore.getState();

// Correct - Subscribes to changes
const state = useSunoStore((s) => s.someValue);
```

**Issue**: State not persisting
```typescript
// Persistence is enabled by default (localStorage)
// Clear it with:
localStorage.removeItem('suno-store');
localStorage.removeItem('obs-store');
localStorage.removeItem('creative-studio-store');
```

**Issue**: Memory leaks from subscriptions
```typescript
// Always unsubscribe
useEffect(() => {
  const unsubscribe = useSunoStore.subscribe(...);
  return unsubscribe; // Cleanup!
}, []);
```

---

## Migration from Context API (if applicable)

If migrating from React Context:

```typescript
// Old (Context API)
const { track } = useTrackContext();

// New (Zustand)
const track = sunoSelectors.selectSelectedTrack();

// Benefits:
// - No wrapper components needed
// - Better performance with selectors
// - Easier to test
// - Built-in devtools
```

---

## Next Steps

1. Start with simple hooks in components
2. Use selectors for optimization
3. Add listeners for side effects
4. Implement cross-store coordination
5. Test with provided test utilities
6. Monitor performance with DevTools

See [README.md](./README.md) for complete API reference.
