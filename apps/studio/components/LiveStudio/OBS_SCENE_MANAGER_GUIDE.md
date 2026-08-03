# OBS Scene & Source Management System - Complete Guide

## Overview

This guide covers the complete OBS scene and source management system built for the WISE² Live Studio application. The system provides a production-ready interface for managing broadcast scenes, sources, and live preview.

---

## Architecture

### Component Hierarchy

```
PreviewUI (Main Layout & Orchestrator)
├── SceneManager (Left Sidebar)
│   ├── Scene List (draggable, reorderable)
│   ├── New Scene Dialog
│   ├── Transition Settings Panel
│   └── Context Menus (rename, duplicate, delete)
│
├── PreviewCanvas (Center - Live Preview)
│   ├── Source Compositing
│   ├── Real-time Updates
│   ├── FPS/Resolution Overlay
│   └── Fullscreen Mode
│
└── SourceManager (Right Sidebar)
    ├── AddSourceModal
    │   ├── Source Type Selector
    │   ├── Display Capture Config
    │   ├── Camera Config
    │   ├── Audio Input Config
    │   ├── Browser Source Config
    │   ├── Media File Config
    │   ├── Text Config
    │   └── Audio File Config
    │
    ├── Source List
    ├── Visibility Toggles (eye icons)
    ├── Z-order Management (drag to reorder)
    ├── Context Menus (delete, duplicate, reset)
    └── SourcePropertiesPanel
        ├── Position (X, Y)
        ├── Size (Width, Height)
        ├── Transform (Rotation, Scale, Opacity)
        ├── Crop (Left, Top, Right, Bottom)
        ├── Rendering (Scale Filter, Blend Mode, Bounds)
        └── Source-Specific Settings
```

---

## Components

### 1. PreviewUI

**Main orchestrator component that brings together all OBS functionality**

```tsx
import { PreviewUI } from '@/components/LiveStudio';

export default function Page() {
  return (
    <PreviewUI
      canvasWidth={1920}
      canvasHeight={1080}
      showFps={true}
      editable={true}
      onStreamToggle={(isActive) => console.log('Stream:', isActive)}
    />
  );
}
```

**Features:**
- Three-column desktop layout (scenes, preview, sources)
- Mobile-responsive tabbed interface
- Fullscreen preview mode
- Collapsible panels
- Real-time source updates

**Props:**
```typescript
interface PreviewUIProps {
  scenes?: Scene[];                    // Initial scenes
  onScenesChange?: (scenes) => void;  // Callback on changes
  canvasWidth?: number;                // Default: 1280
  canvasHeight?: number;               // Default: 720
  initialSceneId?: string;             // Active scene on load
  showFps?: boolean;                   // Show FPS counter
  editable?: boolean;                  // Allow editing
  onStreamToggle?: (isActive) => void; // Stream control callback
}
```

---

### 2. SceneManager

**Manages scenes, transitions, and scene templates**

```tsx
import { SceneManager, type Scene } from '@/components/LiveStudio';

export default function Page() {
  const [scenes, setScenes] = useState<Scene[]>([]);

  return (
    <SceneManager
      scenes={scenes}
      selectedSceneId="scene-1"
      onScenesChange={setScenes}
      onSceneSelect={(id) => console.log('Selected:', id)}
    />
  );
}
```

**Features:**
- Drag-to-reorder scenes
- Add scenes with templates (blank, gaming, talk-show, music production, podcast, streaming)
- Scene visibility toggle
- Transition settings per scene (type: cut/fade/slide/stinger, duration: 0-2000ms)
- Right-click context menu (rename, duplicate, delete, hotkey)
- Double-click to activate
- Scene metadata (created date, modified date, resolution)

**Scene Object:**
```typescript
interface Scene {
  id: string;
  name: string;
  active: boolean;
  visible: boolean;
  transitionType: 'cut' | 'fade' | 'slide' | 'stinger';
  transitionDuration: number;        // ms (0-2000)
  stingerVideoId?: string;           // For stinger transitions
  sources: SceneSource[];            // Sources in this scene
  hotkey?: string;                   // Keyboard shortcut
  createdAt: Date;
  modifiedAt: Date;
  resolution?: { width: number; height: number };
}
```

---

### 3. SourceManager

**Manages sources within the active scene**

```tsx
import { SourceManager, type Source } from '@/components/LiveStudio';

export default function Page() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <SourceManager
      sources={sources}
      selectedSourceId={selectedId}
      canvasWidth={1920}
      canvasHeight={1080}
      onSourcesChange={setSources}
      onSourceSelect={setSelectedId}
    />
  );
}
```

**Features:**
- Add sources (integrated AddSourceModal)
- Drag to reorder z-order (stacking)
- Toggle visibility (eye icon)
- Lock/unlock sources
- Right-click context menu (delete, duplicate, rename, reset transform)
- Source properties panel (expandable)
- Real-time property updates

**Source Object:**
```typescript
interface Source {
  id: string;
  name: string;
  type: 'display' | 'camera' | 'browser' | 'audio-input' 
      | 'audio-file' | 'media-file' | 'text' | 'image';
  visible: boolean;
  locked: boolean;
  zIndex: number;
  properties: {
    // Transform
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    opacity?: number;

    // Crop
    cropLeft?: number;
    cropTop?: number;
    cropRight?: number;
    cropBottom?: number;

    // Rendering
    scaleFilter?: 'bilinear' | 'lanczos' | 'nearest';
    blendMode?: 'normal' | 'add' | 'subtract' | 'screen' | 'multiply';
    boundsMode?: 'none' | 'scale_to_size' | 'stretch_to_size';

    // Type-specific
    device?: string;
    url?: string;
    volume?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    filePath?: string;
    lockAspectRatio?: boolean;
  };
}
```

---

### 4. AddSourceModal

**Comprehensive source type selector with configuration**

```tsx
import { AddSourceModal } from '@/components/LiveStudio';

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Add Source</button>
      <AddSourceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={(source) => console.log('Added:', source)}
        existingSourceCount={5}
      />
    </>
  );
}
```

**Source Types:**

1. **Display Capture** - Screen, monitor, or window
   - Capture Type (entire screen, specific monitor, application window)
   - Show Cursor toggle

2. **Camera/Webcam** - Built-in or USB camera
   - Device selector
   - Resolution (1080p, 720p, VGA)
   - Frame rate (30/60 FPS)

3. **Audio Input** - Microphone or audio device
   - Device selector (built-in mic, USB mic, line-in)
   - Volume (0-100%)
   - Mute on start toggle

4. **Browser Source** - Web page, HTML, widget
   - URL input
   - Width/Height (px)
   - Refresh on focus toggle

5. **Media File** - Video, image, GIF
   - File type selector
   - Loop toggle
   - Playback speed

6. **Text Source** - Static or dynamic text
   - Text content
   - Font size
   - Text color picker
   - Font family selector

7. **Audio File** - Music, Suno tracks
   - Audio source (local, Suno, URL stream)
   - Volume (0-100%)
   - Loop toggle

---

### 5. PreviewCanvas

**Live preview with real-time source compositing**

```tsx
import { PreviewCanvas } from '@/components/LiveStudio';

export default function Page() {
  return (
    <PreviewCanvas
      sources={sourceList}
      width={1920}
      height={1080}
      showMetrics={true}
    />
  );
}
```

**Features:**
- Real-time source compositing
- FPS counter and resolution overlay
- Source selection by clicking on canvas
- Aspect ratio preservation
- Performance optimized rendering

---

## Usage Examples

### Complete Integration Example

```tsx
'use client';

import React, { useState } from 'react';
import { PreviewUI } from '@/components/LiveStudio';

export default function LiveStudioPage() {
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <PreviewUI
      canvasWidth={1920}
      canvasHeight={1080}
      showFps={true}
      editable={true}
      onStreamToggle={(active) => {
        setIsStreaming(active);
        console.log('Stream:', active ? 'Started' : 'Stopped');
      }}
    />
  );
}
```

### Custom Scene Setup

```tsx
import { SceneManager, SourceManager, PreviewCanvas, type Scene } from '@/components/LiveStudio';

const initialScenes: Scene[] = [
  {
    id: 'scene-intro',
    name: 'Intro',
    active: true,
    visible: true,
    transitionType: 'fade',
    transitionDuration: 500,
    sources: [
      {
        id: 'source-logo',
        name: 'Logo',
        type: 'image',
        visible: true,
      },
    ],
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: 'scene-main',
    name: 'Main',
    active: false,
    visible: true,
    transitionType: 'cut',
    transitionDuration: 0,
    sources: [
      {
        id: 'source-camera',
        name: 'Camera',
        type: 'camera',
        visible: true,
      },
      {
        id: 'source-chat',
        name: 'Chat Overlay',
        type: 'browser',
        visible: true,
      },
    ],
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

export default function Page() {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [activeSceneId, setActiveSceneId] = useState('scene-intro');

  return (
    <div className="grid grid-cols-[300px_1fr_350px] gap-4 p-4">
      <SceneManager
        scenes={scenes}
        selectedSceneId={activeSceneId}
        onScenesChange={setScenes}
        onSceneSelect={setActiveSceneId}
      />
      
      <div className="flex items-center justify-center bg-black rounded">
        <PreviewCanvas
          sources={scenes.find(s => s.id === activeSceneId)?.sources || []}
          width={1920}
          height={1080}
          showMetrics={true}
        />
      </div>

      <SourceManager
        sources={[]}
        selectedSourceId={null}
        onSourcesChange={() => {}}
        onSourceSelect={() => {}}
        canvasWidth={1920}
        canvasHeight={1080}
      />
    </div>
  );
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **ESC** | Exit fullscreen preview |
| **Double-click** scene | Activate scene |
| **Right-click** scene/source | Context menu |
| **Drag** scene/source | Reorder z-order |
| **Spacebar** | (Reserved for stream toggle) |

---

## Styling & Theming

All components use the WISE² design system:
- `wise-surface-primary` - Main background
- `wise-surface-secondary` - Secondary backgrounds
- `wise-text-primary` - Primary text
- `wise-text-secondary` - Secondary text
- `wise-text-muted` - Muted text
- `wise-accent` - Primary accent color
- `wise-medium` - Border color
- `studio-input` - Input background
- `studio-raised` - Raised panel background

### Custom Styling Example

```tsx
<style>
  :root {
    --wise-accent: #6366f1; /* Indigo */
    --wise-surface-primary: #0f172a; /* Slate */
    --wise-surface-secondary: #1e293b;
  }
</style>
```

---

## Performance Considerations

1. **Source Limits**: Optimal performance with 10-15 sources per scene
2. **Resolution**: 1920x1080 @ 60 FPS is standard; 4K may require optimization
3. **Preview Updates**: Real-time updates throttled to 30 FPS for efficiency
4. **Memory**: Large media files should be loaded asynchronously

---

## Advanced Features

### Custom Transition Effects

```tsx
const customTransitions = [
  { type: 'cut', duration: 0 },
  { type: 'fade', duration: 300 },
  { type: 'slide', duration: 500 },
  { type: 'stinger', duration: 2000, videoId: 'stinger-1' },
];
```

### Source Hotkeys

Assign keyboard shortcuts to activate scenes:

```tsx
// In SceneManager
const handleHotkey = (e: KeyboardEvent) => {
  const sceneId = hotkeyMap[e.key];
  if (sceneId) {
    onSceneSelect(sceneId);
  }
};
```

### Multi-Scene Transitions

Chain scene transitions for complex sequences:

```tsx
const transitionSequence = [
  { sceneId: 'scene-1', delay: 0 },
  { sceneId: 'scene-2', delay: 3000 },
  { sceneId: 'scene-3', delay: 6000 },
];
```

---

## Troubleshooting

### Preview Not Updating
- Verify `onSourcesChange` callback is properly wired
- Check browser console for errors
- Ensure sources have valid IDs

### Scenes Not Persisting
- Implement localStorage or API persistence in `onScenesChange`
- Verify scene data structure matches interface

### Performance Issues
- Reduce number of sources per scene
- Lower preview resolution for testing
- Profile with Chrome DevTools

---

## Future Enhancements

- [ ] Scene recording
- [ ] Automatic scene switching (timed sequences)
- [ ] Audio level monitoring
- [ ] Source synchronization (multi-device)
- [ ] Virtual camera output
- [ ] Streaming integration (RTMP, WHIP)
- [ ] Replay buffer management
- [ ] Analytics dashboard

---

## API Reference

See individual component files for detailed JSDoc comments:
- `SceneManager.tsx` - Scene CRUD and management
- `SourceManager.tsx` - Source CRUD and layering
- `AddSourceModal.tsx` - Source type configuration
- `PreviewCanvas.tsx` - Canvas rendering
- `PreviewUI.tsx` - Main orchestrator

---

**Version**: 2.0  
**Last Updated**: 2026-07-24  
**Status**: Production Ready
