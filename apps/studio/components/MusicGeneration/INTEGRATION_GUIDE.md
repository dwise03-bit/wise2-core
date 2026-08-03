# Generation Library Integration Guide

Complete guide for integrating the Music Generation Library component into the WISE² Studio app.

## Quick Start

### 1. Import the Component

```typescript
import GenerationLibrary from '@/components/MusicGeneration/GenerationLibrary';
import { GeneratedTrack } from '@/types/aimusic';
```

### 2. Add State Management

```typescript
const [generations, setGenerations] = useState<GeneratedTrack[]>([]);
const [currentGeneration, setCurrentGeneration] = useState<GeneratedTrack | null>(null);
```

### 3. Implement Callbacks

```typescript
const handlePlayGeneration = (track: GeneratedTrack) => {
  // Implement audio playback
};

const handleDeleteGeneration = (trackId: string) => {
  setGenerations(prev => prev.filter(g => g.id !== trackId));
};

// ... implement other callbacks
```

### 4. Render Component

```typescript
<GenerationLibrary
  generations={generations}
  onPlayGeneration={handlePlayGeneration}
  onDeleteGeneration={handleDeleteGeneration}
  onToggleFavorite={handleToggleFavorite}
  onRemixGeneration={handleRemixGeneration}
  onExportGeneration={handleExportGeneration}
  onAddToSoundLab={handleAddToSoundLab}
  isLoading={isLoading}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>
```

## Full Integration Example

### Page Component (app/studio/page.tsx)

```typescript
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GenerationLibrary from '@/components/MusicGeneration/GenerationLibrary';
import PromptBuilder from '@/components/MusicGeneration/PromptBuilder';
import { GeneratedTrack } from '@/types/aimusic';

type StudioTab = 'generate' | 'library' | 'soundlab';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>('generate');
  const [generations, setGenerations] = useState<GeneratedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch generations on mount
  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/generations');
      const data = await response.json();
      setGenerations(data.generations);
    } catch (error) {
      console.error('Failed to load generations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayGeneration = useCallback((track: GeneratedTrack) => {
    // Create audio player instance
    const audio = new Audio(track.url);
    audio.play().catch(err => console.error('Playback failed:', err));
  }, []);

  const handleDeleteGeneration = useCallback(async (trackId: string) => {
    try {
      await fetch(`/api/generations/${trackId}`, { method: 'DELETE' });
      setGenerations(prev => prev.filter(g => g.id !== trackId));
    } catch (error) {
      console.error('Failed to delete generation:', error);
    }
  }, []);

  const handleToggleFavorite = useCallback(async (trackId: string) => {
    try {
      const generation = generations.find(g => g.id === trackId);
      if (generation) {
        const response = await fetch(`/api/generations/${trackId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorite: !generation.isFavorite }),
        });
        const updated = await response.json();
        setGenerations(prev =>
          prev.map(g => (g.id === trackId ? updated : g))
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [generations]);

  const handleRemixGeneration = useCallback((trackId: string) => {
    const generation = generations.find(g => g.id === trackId);
    if (generation) {
      // Store remix context
      sessionStorage.setItem('remixSource', JSON.stringify(generation));
      // Switch to generate tab with pre-filled settings
      setActiveTab('generate');
    }
  }, [generations]);

  const handleExportGeneration = useCallback(
    (trackId: string, format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg') => {
      const generation = generations.find(g => g.id === trackId);
      if (generation && generation.url) {
        // Trigger download with format parameter
        const link = document.createElement('a');
        link.href = `${generation.url}?format=${format}`;
        link.download = `${generation.title || 'generation'}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [generations]
  );

  const handleAddToSoundLab = useCallback((trackId: string) => {
    const generation = generations.find(g => g.id === trackId);
    if (generation) {
      // Create clip and add to current project
      // Dispatch to your audio editor state
      // Then switch to Sound Lab tab
      setActiveTab('soundlab');
    }
  }, [generations]);

  const handleGenerationComplete = useCallback((newGeneration: GeneratedTrack) => {
    setGenerations(prev => [newGeneration, ...prev]);
  }, []);

  const handleLoadMore = useCallback(async () => {
    // Implement pagination
    setIsLoading(true);
    try {
      const offset = generations.length;
      const response = await fetch(`/api/generations?offset=${offset}&limit=50`);
      const data = await response.json();
      setGenerations(prev => [...prev, ...data.generations]);
    } catch (error) {
      console.error('Failed to load more generations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generations.length]);

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Top Navigation */}
      <nav className="flex items-center space-x-4 px-6 py-4 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'generate'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'library'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Library ({generations.length})
        </button>
        <button
          onClick={() => setActiveTab('soundlab')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'soundlab'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sound Lab
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'generate' && (
          <PromptBuilder onGenerationComplete={handleGenerationComplete} />
        )}
        {activeTab === 'library' && (
          <GenerationLibrary
            generations={generations}
            onPlayGeneration={handlePlayGeneration}
            onDeleteGeneration={handleDeleteGeneration}
            onToggleFavorite={handleToggleFavorite}
            onRemixGeneration={handleRemixGeneration}
            onExportGeneration={handleExportGeneration}
            onAddToSoundLab={handleAddToSoundLab}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={true}
          />
        )}
        {activeTab === 'soundlab' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Sound Lab Interface
          </div>
        )}
      </div>
    </div>
  );
}
```

## API Endpoints Required

The component expects these API routes to be available:

### Get Generations
```
GET /api/generations?offset=0&limit=50
```

Response:
```json
{
  "generations": [GeneratedTrack[]],
  "total": number,
  "hasMore": boolean
}
```

### Delete Generation
```
DELETE /api/generations/{trackId}
```

### Update Generation (Toggle Favorite)
```
PATCH /api/generations/{trackId}
{
  "isFavorite": boolean
}
```

### Export Generation
```
GET /api/generations/{trackId}/export?format=mp3
```

Returns audio file blob.

### Add to Sound Lab
```
POST /api/soundlab/clips
{
  "generationId": string,
  "projectId": string
}
```

## Callback Reference

### onPlayGeneration

```typescript
onPlayGeneration: (track: GeneratedTrack) => void
```

Called when user clicks play button or play icon. Implement audio playback here.

### onDeleteGeneration

```typescript
onDeleteGeneration: (trackId: string) => void
```

Called when user clicks delete button. Remove from state and optionally API.

### onToggleFavorite

```typescript
onToggleFavorite: (trackId: string) => void
```

Called when user clicks star/favorite button. Toggle `isFavorite` flag.

### onRemixGeneration

```typescript
onRemixGeneration: (trackId: string) => void
```

Called when user clicks remix button. Prepare to generate with same settings.

### onExportGeneration

```typescript
onExportGeneration: (trackId: string, format: ExportFormat) => void
```

Called when user selects export format. Download or convert track.

### onAddToSoundLab

```typescript
onAddToSoundLab: (trackId: string) => void
```

Called when user clicks "Add to Sound Lab". Convert generation to clip.

### onLoadMore

```typescript
onLoadMore: () => void
```

Called when user clicks "Load More" button. Fetch next page of generations.

## Styling & Theming

The component uses WISE² brand colors:

```css
/* Dark theme (default) */
--slate-950: #020617; /* Background */
--slate-900: #0f172a; /* Cards */
--slate-800: #1e293b; /* Borders */
--slate-700: #334155; /* Inactive */
--slate-400: #94a3b8; /* Text secondary */
--slate-300: #cbd5e1; /* Text tertiary */
--slate-200: #e2e8f0; /* Text light */

/* Accent colors */
--cyan-500: #06b6d4; /* Primary */
--blue-600: #2563eb; /* Secondary */
--green-400: #4ade80; /* Success */
--red-400: #f87171; /* Danger */
--yellow-400: #facc15; /* Warning */
```

To customize, override Tailwind CSS variables in globals.css:

```css
:root {
  --color-primary: #06b6d4;
  --color-primary-dark: #0891b2;
  --color-secondary: #2563eb;
}
```

## Performance Optimization

### 1. Memoization

Use `React.memo` for card components:

```typescript
const GenerationCard = React.memo(({ generation, ...props }) => {
  // Component implementation
});
```

### 2. Virtual Scrolling

For very large lists (1000+), implement virtual scrolling:

```typescript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={generations.length}
  itemSize={200}
>
  {({ index, style }) => (
    <div style={style}>
      <GenerationCard generation={generations[index]} />
    </div>
  )}
</List>
```

### 3. Lazy Loading Images

Use IntersectionObserver for lazy waveform generation:

```typescript
const observerRef = useRef<IntersectionObserver | null>(null);

useEffect(() => {
  observerRef.current = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Load waveform
      }
    });
  });
}, []);
```

## Accessibility Improvements

### 1. Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    onSelect();
  } else if (e.key === ' ') {
    e.preventDefault();
    onPlay();
  }
};
```

### 2. ARIA Labels

```typescript
<button
  aria-label="Play generation"
  aria-pressed={isPlaying}
  onClick={onPlay}
>
  <Play />
</button>
```

### 3. Focus Management

```typescript
const focusableRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isSelected && focusableRef.current) {
    focusableRef.current.focus();
  }
}, [isSelected]);
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import GenerationLibrary from './GenerationLibrary';

describe('GenerationLibrary', () => {
  it('renders generation cards', () => {
    const generations = [/* mock data */];
    render(
      <GenerationLibrary
        generations={generations}
        onPlayGeneration={jest.fn()}
        // ... other props
      />
    );

    expect(screen.getAllByRole('button')).toHaveLength(generations.length);
  });

  it('filters by search text', () => {
    // Test implementation
  });

  it('calls onPlayGeneration when play button clicked', () => {
    const onPlay = jest.fn();
    // Test implementation
  });
});
```

## Troubleshooting

### Cards not showing
- Check that `generations` array is populated
- Verify `GeneratedTrack` type matches expected structure
- Check browser console for errors

### Filters not working
- Ensure filter state is properly connected
- Check that genre/mood values match mock data
- Verify filter logic in useMemo

### Export not working
- Check API endpoint is accessible
- Verify export format is supported
- Check file CORS headers if using external storage

### Performance issues
- Implement virtual scrolling for large lists
- Reduce animation complexity
- Check for unnecessary re-renders with React DevTools Profiler

## Next Steps

1. Connect to real API endpoints
2. Implement audio player integration
3. Add batch operations (select multiple)
4. Create playlist functionality
5. Add sharing/collaboration features
6. Implement offline storage with IndexedDB
7. Add keyboard shortcuts
8. Create generation statistics dashboard

## Support

For issues or feature requests, check:
- Component source: `/apps/studio/components/MusicGeneration/GenerationLibrary.tsx`
- Example usage: `/apps/studio/components/MusicGeneration/GenerationLibraryExample.tsx`
- Types: `/apps/studio/types/aimusic.ts`
- Constants: `/apps/studio/constants/musicGeneration.ts`
