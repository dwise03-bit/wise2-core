# Sound Lab: Music Generation + DAW Integration Guide

## Overview

Sound Lab is now a complete music production environment that seamlessly integrates AI music generation with professional audio editing, mixing, and effects processing.

### Key Features

✅ **Music Generation** — Generate clips with Suno AI  
✅ **Timeline Editor** — Visual clip arrangement with drag-and-drop  
✅ **Professional Mixer** — Per-track volume, pan, mute/solo  
✅ **Effects Chain** — EQ, Reverb, Delay, Compression, Distortion  
✅ **Undo/Redo** — Full history across all operations  
✅ **Mixed Media** — Generated (blue) + Recorded (green) clips in one timeline  

---

## Architecture

### Component Structure

```
SoundLabEnhanced (Main Container)
├── useClips Hook (Clip Management)
│   ├── addClip() — Add recorded/imported clips
│   ├── addGeneratedClip() — Add generated audio with metadata
│   ├── updateClip() — Update clip properties
│   ├── moveClip() — Reposition clips
│   ├── trimClipStart/End() — Edit clip boundaries
│   └── setFadeIn/Out() — Apply fades
│
├── useClipEffects Hook (Effects & Mixing)
│   ├── initializeChain() — Create effects chain per clip
│   ├── addEffect() — Insert effect (EQ, Reverb, etc.)
│   ├── updateEffect() — Modify effect parameters
│   ├── setVolume() — Clip volume 0-1
│   ├── setPan() — Clip pan -1 to +1
│   └── toggleMute() — Mute/unmute clip
│
├── useClipInteraction Hook (Drag/Select)
│   ├── handleClipMouseDown() — Start drag
│   └── recordClipCreation() — Add to undo/redo history
│
└── Tabs (Timeline | Generation | Mixer | Effects)
    ├── Timeline Tab — View/arrange clips
    ├── Generation Tab — Create new music with Suno
    ├── Mixer Tab — Professional channel strips
    └── Effects Tab — Manage effects chains per clip
```

### Data Flow

```
1. User generates music in Generation Tab
   ↓
2. Suno API returns completed audio file
   ↓
3. Audio converted to AudioBuffer
   ↓
4. Clip created with metadata (source: 'generated', sunoMetadata)
   ↓
5. Effects chain initialized for clip
   ↓
6. Clip added to timeline (blue badge)
   ↓
7. Effects and mixer settings apply during playback/export
```

---

## Hook API Reference

### useClips

Manages all audio clips (recorded and generated).

```typescript
// Add a recorded/imported clip
const clipId = clips.addClip(
  trackId: string,
  audioBuffer: AudioBuffer,
  name?: string,
  startTime?: number
): string;

// Add a generated clip with Suno metadata
const clipId = clips.addGeneratedClip(
  trackId: string,
  audioBuffer: AudioBuffer,
  sunoGeneration: SunoGeneration,
  name?: string,
  startTime?: number
): string;

// Update clip properties
clips.updateClip(clipId, {
  name?: string;
  startTime?: number;
  displayStart?: number; // trim start
  displayEnd?: number;   // trim end
  fadeIn?: number;
  fadeOut?: number;
  isSelected?: boolean;
});

// Get clip data
const clip = clips.getSelectedClip();
const allClips = clips.getClips(); // Returns Map<string, ClipData>
const clipsForTrack = clips.getClipsForTrack(trackId);

// Modify clips
clips.moveClip(clipId, newStartTime);
clips.trimClipStart(clipId, trimStart);
clips.trimClipEnd(clipId, trimEnd);
clips.setFadeIn(clipId, duration);
clips.setFadeOut(clipId, duration);
clips.duplicateClip(clipId, offsetSeconds);
clips.splitClip(clipId, splitTime);
clips.removeClip(clipId);
```

### useClipEffects

Manages effects chains and mixing per clip.

```typescript
// Initialize effects chain for a clip
effects.initializeChain(clipId, trackId);

// Get clip's effects chain
const chain = effects.getChain(clipId);
// Returns: { clipId, trackId, volume, pan, effects[], isMuted }

// Add effect to chain
const effectId = effects.addEffect(
  clipId,
  'eq' | 'reverb' | 'delay' | 'compression' | 'distortion',
  params?: { lowGain?, midGain?, highGain?, ... }
): string;

// Modify effect parameters
effects.updateEffect(clipId, effectId, {
  lowGain?: 0,    // EQ: dB
  wet?: 0.5,      // Reverb: 0-1
  time?: 500,     // Delay: ms
  threshold?: -20, // Compression: dB
  drive?: 0.3,    // Distortion: 0-1
});

// Toggle effect on/off
effects.toggleEffect(clipId, effectId);

// Remove effect
effects.removeEffect(clipId, effectId);

// Clip mixing
effects.setVolume(clipId, 0.8);      // 0-1
effects.setPan(clipId, -0.5);        // -1 to +1
effects.toggleMute(clipId);

// History
effects.undo();
effects.redo();
const info = effects.getHistoryInfo();
// { canUndo: bool, canRedo: bool, historyLength, currentIndex }
```

---

## UI Implementation Examples

### Generating Music

```typescript
// User fills form → SunoPromptBuilder
const handleGenerate = async (params: SunoGenerationParams) => {
  const response = await fetch('/api/suno/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  
  const generation = await response.json();
  
  // Poll for completion
  pollGenerationStatus(generation.id);
  
  // When complete:
  await addGeneratedClipToTimeline(generation);
  setActiveTab('timeline'); // Switch to see result
};
```

### Adding Effects to Generated Clip

```typescript
// Initialize effects chain
effects.initializeChain(clipId, trackId);

// Add EQ
const eqId = effects.addEffect(clipId, 'eq', {
  lowGain: 3,      // Boost bass
  midGain: 0,
  highGain: 2,     // Add brightness
});

// Add reverb
const reverbId = effects.addEffect(clipId, 'reverb', {
  wet: 0.3,
  decay: 3,
});

// Adjust volume
effects.setVolume(clipId, 0.9);

// Playback applies all effects
await playback.playClip(clipId);
```

### Mixing Generated + Recorded

```typescript
// Timeline has:
// - Generated clip (blue) at 0:00-2:30
// - Recorded vocal (green) at 0:45-2:30

// Set volumes for balance
effects.setVolume(generatedClipId, 0.8);
effects.setVolume(recordedClipId, 0.9);

// Pan for stereo width
effects.setPan(generatedClipId, -0.3);   // Left
effects.setPan(recordedClipId, 0.3);     // Right

// Add reverb to both
effects.addEffect(generatedClipId, 'reverb', { wet: 0.2, decay: 2 });
effects.addEffect(recordedClipId, 'reverb', { wet: 0.2, decay: 2 });

// Export mix (undo/redo supported)
await handleExport();
```

---

## Visual Design

### Timeline Tab

- **Generated Clips** — Blue background, border, and "Generated" badge
- **Recorded Clips** — Green background, border, and duration info
- **Playhead** — Red vertical line showing current position
- **Transport** — Play, Stop, Undo, Redo, Export buttons

### Generation Tab

- **SunoPromptBuilder** — Genre, mood, description fields
- **SunoGenerationQueue** — Real-time progress
- **Completed List** — "Ready to Add" section with Add button

### Mixer Tab

- **Channel Strips** — Volume fader, pan knob, peak meter
- **Mute/Solo** — Per-track controls
- **Master Fader** — Overall output level

### Effects Tab

- **Effect Chains** — Per-clip effect list
- **Add Effect** — Button to insert EQ, Reverb, Delay, etc.
- **Effect Controls** — Enable/disable, remove, parameter sliders

---

## Undo/Redo System

Both `useClipInteraction` and `useClipEffects` maintain independent history:

```typescript
// Clip edits (move, trim, select, create, delete)
interaction.undo();  // Revert last clip edit
interaction.redo();  // Reapply last edit

// Effects edits (add effect, change params, volume, pan)
effects.undo();      // Revert last effect change
effects.redo();      // Reapply effect change

// Both support keyboard shortcuts
// Cmd+Z / Ctrl+Z → undo()
// Cmd+Shift+Z / Ctrl+Shift+Z → redo()
```

---

## Playback & Export

### During Playback

1. Clip audio loaded from `audioBuffer`
2. Effects chain applied (EQ → Reverb → Delay → Compression)
3. Volume & pan applied
4. Mute check
5. Output to master channel

### On Export

1. All tracks mixed together
2. Master volume applied
3. File encoded (MP3/WAV/OGG)
4. Downloaded or saved to S3

---

## Integration Checklist

### Core ✅
- [x] useClips hook with addGeneratedClip
- [x] useClipEffects hook with full chain support
- [x] SoundLabEnhanced main component
- [x] Timeline tab with clip visualization
- [x] Generation tab with Suno integration
- [x] Mixer tab with channel strips
- [x] Effects tab with per-clip chains

### UI/UX ✅
- [x] Tab navigation (Timeline | Generate | Mixer | Effects)
- [x] Visual distinction (blue=generated, green=recorded)
- [x] Clip metadata badges (source, effect count)
- [x] Transport controls (Play, Stop, Undo, Redo)
- [x] Status bar with real-time updates

### Features ✅
- [x] Add generated clips to timeline
- [x] Mix generated + recorded tracks
- [x] Apply effects to any clip type
- [x] Full undo/redo across all operations
- [x] Professional mixer with faders

### Testing 🔄
- [ ] Generate music and add to timeline
- [ ] Apply effects to generated clips
- [ ] Mix generated + recorded tracks
- [ ] Undo/redo all operations
- [ ] Export final mix
- [ ] Test on mobile/tablet

---

## File Locations

```
apps/studio/
├── hooks/
│   ├── useClips.ts              (Clip management)
│   ├── useClipEffects.ts        (Effects & mixing) — NEW
│   ├── useClipInteraction.ts    (Drag, select, history)
│   ├── useClipPlayback.ts       (Playback)
│   └── useSunoClipPlayback.ts   (Generated audio playback)
│
├── components/SoundLab/
│   ├── SoundLabEnhanced.tsx     (Main container) — NEW
│   ├── SoundLabWithSuno.tsx     (Previous version)
│   ├── Timeline.tsx             (Timeline display)
│   ├── Mixer.tsx                (Mixer UI)
│   ├── SunoPromptBuilder.tsx    (Generation form)
│   ├── SunoGenerationQueue.tsx  (Queue display)
│   └── index.ts                 (Exports)
│
└── components/
    └── StudioPages.tsx          (SoundLabPage uses SoundLabEnhanced)
```

---

## Next Steps

1. **Test Generation** — Ensure music generates and loads correctly
2. **Refine UI** — Adjust colors, sizes, spacing
3. **Add Preset Effects** — Templates for common setups (Vocal, Beat, etc.)
4. **WAV Export** — Implement lossless export
5. **Performance** — Optimize large timelines (100+ clips)
6. **Mobile** — Adapt for tablet/mobile screens

---

## API Endpoints Required

```
POST /api/suno/generate
  Body: { prompt, genre, mood, duration }
  Returns: { id, status, audioUrl, params, ... }

GET /api/suno/status/:generationId
  Returns: { id, status, audioUrl, params, error, ... }
```

See `apps/studio/app/api/suno/` for implementation.
