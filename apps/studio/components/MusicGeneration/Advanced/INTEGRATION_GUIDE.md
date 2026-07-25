# Advanced Music Generation Features - Integration Guide

## Overview

The Advanced Music Generation suite provides professional-grade composition tools:

1. **ContinuationPanel** - Extend completed tracks by 30 seconds with seamless blending
2. **RemixInterface** - Create multiple versions with A/B comparison and voting
3. **StyleTransfer** - Apply musical style from one track to new content
4. **StemSeparation** - Split tracks into 8 individual stems for remixing

## Component APIs

### ContinuationPanel

```tsx
<ContinuationPanel
  tracks={generatedTracks}
  onContinue={async (trackId, description) => {
    // Call your continuation generation API
    const response = await fetch('/api/music/continue', {
      method: 'POST',
      body: JSON.stringify({
        trackId,
        additionalDescription: description,
      }),
    });
    return response.json();
  }}
  isGenerating={isGenerating}
  onGenerationComplete={(track) => {
    // Handle newly continued track
  }}
/>
```

**Props:**
- `tracks`: `GeneratedTrack[]` - Available tracks to extend
- `onContinue`: `(trackId: string, description: string) => Promise<GeneratedTrack>` - Continuation handler
- `isGenerating?`: `boolean` - Global generation state
- `onGenerationComplete?`: `(track: GeneratedTrack) => void` - Callback when complete

**Features:**
- Maintains musical coherence with smooth transitions
- Optional description guides continuation direction
- Shows progress and extended duration
- Tracks continued versions with easy access

---

### RemixInterface

```tsx
<RemixInterface
  tracks={generatedTracks}
  onRemix={async (trackId, modifiedPrompt) => {
    // Call your remix generation API
    const response = await fetch('/api/music/remix', {
      method: 'POST',
      body: JSON.stringify({
        trackId,
        newPrompt: modifiedPrompt,
      }),
    });
    return response.json();
  }}
  isGenerating={isGenerating}
  onGenerationComplete={(track) => {
    // Handle new remix version
  }}
/>
```

**Props:**
- `tracks`: `GeneratedTrack[]` - Available tracks to remix
- `onRemix`: `(trackId: string, modifiedPrompt: string) => Promise<GeneratedTrack>` - Remix handler
- `isGenerating?`: `boolean` - Global generation state
- `onGenerationComplete?`: `(track: GeneratedTrack) => void` - Callback when complete

**Features:**
- Keep original style, change mood (happier, sadder, energetic, calmer)
- Modify prompt while maintaining consistency
- A/B comparison side-by-side
- Vote on favorite versions
- Version history with creation dates

**Mood Modifications:**
- `keep` - No mood change
- `happier` - More uplifting and positive
- `sadder` - More melancholic and introspective
- `energetic` - More dynamic and powerful
- `calmer` - More relaxed and soothing

---

### StyleTransfer

```tsx
<StyleTransfer
  tracks={generatedTracks}
  onStyleTransfer={async (sourceTrackId, targetPrompt) => {
    // Call your style transfer API
    const response = await fetch('/api/music/style-transfer', {
      method: 'POST',
      body: JSON.stringify({
        sourceTrackId,
        targetPrompt,
      }),
    });
    return response.json();
  }}
  isGenerating={isGenerating}
  onGenerationComplete={(track) => {
    // Handle new track with transferred style
  }}
/>
```

**Props:**
- `tracks`: `GeneratedTrack[]` - Available tracks (source styles)
- `onStyleTransfer`: `(sourceTrackId: string, targetPrompt: string) => Promise<GeneratedTrack>` - Style transfer handler
- `isGenerating?`: `boolean` - Global generation state
- `onGenerationComplete?`: `(track: GeneratedTrack) => void` - Callback when complete

**Features:**
- Two-column layout: Source (style) | Target (content)
- Automatic style profile extraction
- Advanced options:
  - **Style Preservation Slider (0-100%)**
    - 0-40%: Creative (can deviate from style)
    - 40-70%: Balanced (moderate preservation)
    - 70-90%: Strict (closely follows style)
    - 90-100%: Exact (maintains all characteristics)

**What Gets Preserved at Different Levels:**
- **50%+**: Instrumentation & timbre
- **65%+**: Tempo & rhythm pattern
- **80%+**: Structural formula
- **90%+**: Exact mood characteristics

---

### StemSeparation

```tsx
<StemSeparation
  tracks={generatedTracks}
  onSeparateSteams={async (trackId) => {
    // Call your stem separation API
    const response = await fetch('/api/music/separate-stems', {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    });
    return response.json(); // Returns StemTrack[]
  }}
  isProcessing={isProcessing}
/>
```

**Props:**
- `tracks`: `GeneratedTrack[]` - Available tracks to separate
- `onSeparateSteams`: `(trackId: string) => Promise<StemTrack[]>` - Separation handler
- `isProcessing?`: `boolean` - Global processing state

**Stem Types Extracted:**
1. **Vocals** 🎤 - Lead and backing vocals
2. **Drums** 🥁 - Kick, snare, hi-hat, percussion
3. **Bass** 🎸 - Bass guitar and sub bass
4. **Melody** 🎹 - Lead melody instruments
5. **Strings** 🎻 - Strings and pads
6. **Brass** 🎺 - Brass and horns
7. **Synths** ⚡ - Synths and electronic elements
8. **Ambience** 🌊 - Atmospheric and background

**Features:**
- Queue management with progress tracking
- Real-time status updates (queued, processing, complete, failed)
- Individual stem download buttons
- Stem controls: Volume, Pan (L/C/R), Dry/Wet
- "Open in Sound Lab" button for immediate remixing
- Job history and expansion for details

**StemTrack Interface:**
```typescript
interface StemTrack {
  id: string;
  name: 'vocals' | 'drums' | 'bass' | 'synths' | 'instruments' | 'effects' | 'ambience';
  url?: string;
  waveformData?: number[];
  volume: number;      // 0-1
  pan: number;        // -1 (left) to 1 (right)
  isDry: boolean;
}
```

---

## Complete Integration Example

```tsx
'use client';

import React, { useState } from 'react';
import { useAIMusicEnhanced } from '@/hooks/useAIMusicEnhanced';
import {
  ContinuationPanel,
  RemixInterface,
  StyleTransfer,
  StemSeparation,
} from '@/components/MusicGeneration/Advanced';
import { motion } from 'framer-motion';

export function AdvancedMusicStudio() {
  const music = useAIMusicEnhanced();
  const [activeTab, setActiveTab] = useState<
    'continuation' | 'remix' | 'style-transfer' | 'stem-separation'
  >('continuation');

  const tabs = [
    { id: 'continuation', label: '🎵 Continue' },
    { id: 'remix', label: '🎛️ Remix' },
    { id: 'style-transfer', label: '🎨 Style Transfer' },
    { id: 'stem-separation', label: '🎚️ Stems' },
  ] as const;

  return (
    <motion.div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-wise-primary text-white'
                : 'bg-wise-surface text-wise-text-primary hover:bg-wise-surface-secondary'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Active Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {activeTab === 'continuation' && (
          <ContinuationPanel
            tracks={music.library.tracks}
            onContinue={async (trackId, description) => {
              // Implementation
              const response = await fetch('/api/music/continue', {
                method: 'POST',
                body: JSON.stringify({ trackId, description }),
              });
              return response.json();
            }}
            isGenerating={music.isGenerating}
            onGenerationComplete={(track) => {
              // Add to library
              music.library.tracks.push(track);
            }}
          />
        )}

        {activeTab === 'remix' && (
          <RemixInterface
            tracks={music.library.tracks}
            onRemix={async (trackId, modifiedPrompt) => {
              const response = await fetch('/api/music/remix', {
                method: 'POST',
                body: JSON.stringify({ trackId, prompt: modifiedPrompt }),
              });
              return response.json();
            }}
            isGenerating={music.isGenerating}
            onGenerationComplete={(track) => {
              music.library.tracks.push(track);
            }}
          />
        )}

        {activeTab === 'style-transfer' && (
          <StyleTransfer
            tracks={music.library.tracks}
            onStyleTransfer={async (sourceTrackId, targetPrompt) => {
              const response = await fetch('/api/music/style-transfer', {
                method: 'POST',
                body: JSON.stringify({
                  sourceTrackId,
                  targetPrompt,
                }),
              });
              return response.json();
            }}
            isGenerating={music.isGenerating}
            onGenerationComplete={(track) => {
              music.library.tracks.push(track);
            }}
          />
        )}

        {activeTab === 'stem-separation' && (
          <StemSeparation
            tracks={music.library.tracks}
            onSeparateSteams={async (trackId) => {
              const response = await fetch('/api/music/separate-stems', {
                method: 'POST',
                body: JSON.stringify({ trackId }),
              });
              return response.json();
            }}
            isProcessing={music.isGenerating}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
```

---

## Backend API Examples

### Continuation Endpoint

```typescript
// POST /api/music/continue
{
  trackId: string;
  additionalDescription?: string;
}

// Returns: GeneratedTrack (full track with extended duration)
```

### Remix Endpoint

```typescript
// POST /api/music/remix
{
  trackId: string;
  prompt: string; // Modified prompt (may include mood tags)
}

// Returns: GeneratedTrack (new version with same ID prefix)
```

### Style Transfer Endpoint

```typescript
// POST /api/music/style-transfer
{
  sourceTrackId: string;
  targetPrompt: string;
}

// Returns: GeneratedTrack (target content with source style)
```

### Stem Separation Endpoint

```typescript
// POST /api/music/separate-stems
{
  trackId: string;
}

// Returns: StemTrack[]
// [
//   { id, name: 'vocals', url, volume, pan, ... },
//   { id, name: 'drums', url, volume, pan, ... },
//   ...
// ]
```

---

## Styling & Theming

All components use WISE² design tokens:

```css
/* Primary Colors */
--wise-primary: #00d4ff;
--wise-primary-active: #00a8cc;

/* Surface Colors */
--wise-surface: #1a1a2e;
--wise-surface-secondary: #16213e;

/* Accent Colors */
--wise-accent-green: #00ff88;
--wise-accent-red: #ff4757;

/* Text Colors */
--wise-text-primary: #ffffff;
--wise-text-muted: #a0aec0;
```

Components are fully responsive and support light/dark themes automatically.

---

## Error Handling

Each component includes error boundaries:

```tsx
// Catch errors during generation
try {
  const result = await onContinue(trackId, description);
} catch (error) {
  // Error displayed in component with user-friendly message
}

// Component shows:
// - Red error banner with message
// - Progress reset to 0
// - Buttons remain enabled for retry
```

---

## Performance Considerations

- **Memory**: Tracks stored in component state (consider pagination for large libraries)
- **Network**: Each generation is a separate API call (consider request debouncing)
- **Progress**: Updates every 500-700ms to balance UX and performance
- **Rendering**: Uses `AnimatePresence` for smooth enter/exit animations

---

## Accessibility

- ✓ ARIA labels on all interactive elements
- ✓ Keyboard navigation support (Tab, Enter, Arrow keys)
- ✓ Color contrast meets WCAG AA standards
- ✓ Progress indicators for long operations
- ✓ Error messages clearly visible and readable

---

## Future Enhancements

Potential additions to the Advanced suite:

1. **Batch Operations** - Process multiple tracks simultaneously
2. **Scheduled Generation** - Queue jobs for off-peak times
3. **Collaborative Features** - Share stems and versions with team
4. **ML Model Fine-tuning** - Train on user preferences
5. **Audio Analysis** - Visual waveform editing with markers
6. **Export Presets** - Save and reuse export configurations
7. **Version Diffing** - Visual comparison of remix versions
8. **Stem Blending** - Real-time remix with slider controls
