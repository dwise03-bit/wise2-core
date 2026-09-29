# OBS Preview Canvas Integration Guide

## Overview

`PreviewCanvas` is a production-grade interactive video preview canvas for OBS-style streaming applications. It provides:

- **Live Preview**: Real-time 1920x1080 canvas with source composition
- **Interactive Editing**: Click-to-select, drag-to-move, corner-drag-to-resize, keyboard shortcuts
- **Performance Metrics**: CPU/GPU usage, frame rate, bitrate, encoding time, network status
- **Grid/Snap**: Optional grid overlay with configurable snap sizes
- **Zoom/Pan**: Zoom in/out with fit-to-window, pan via space+drag
- **Canvas-Based Rendering**: 60fps rendering using Canvas 2D API

## Installation

The component is located at:
```
apps/studio/components/LiveStudio/PreviewCanvas.tsx
```

And exported from:
```
apps/studio/components/LiveStudio/index.ts
```

## Basic Usage

```tsx
import { PreviewCanvas, type SourceManagerSource } from '@/components/LiveStudio';

export function MyLiveStudio() {
  const [sources, setSources] = useState<SourceManagerSource[]>([
    {
      id: 'camera-1',
      name: 'Main Camera',
      type: 'camera',
      visible: true,
      locked: false,
      zIndex: 1,
      properties: {
        x: 100,
        y: 100,
        width: 640,
        height: 480,
        opacity: 100,
        rotation: 0,
      },
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  return (
    <PreviewCanvas
      sources={sources}
      sceneName="Main Scene"
      isRecording={isRecording}
      isStreaming={isStreaming}
      elapsedTime={elapsedTime}
      resolution={{ width: 1920, height: 1080 }}
      targetResolution={{ width: 1080, height: 1080 }}
      metrics={{
        cpuUsage: 45,
        gpuUsage: 32,
        frameRate: 60,
        targetFrameRate: 60,
        bitrate: 5200,
        encodingTime: 12,
        networkStatus: 'good',
      }}
      onSourceSelect={(sourceId) => {
        console.log('Selected source:', sourceId);
      }}
      onSourceUpdate={(sourceId, updates) => {
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId ? { ...s, ...updates } : s
          )
        );
      }}
      onSourceDelete={(sourceId) => {
        setSources((prev) => prev.filter((s) => s.id !== sourceId));
      }}
    />
  );
}
```

## Props

```typescript
interface PreviewCanvasProps {
  // Data
  sources: Source[];                    // Array of sources to render
  sceneName: string;                    // Current scene name (displayed top-center)
  isRecording: boolean;                 // Show recording indicator
  isStreaming: boolean;                 // Show LIVE indicator
  elapsedTime: string;                  // Formatted time (hh:mm:ss) displayed top-right
  
  // Resolution info
  resolution: { width: number; height: number };           // Current resolution
  targetResolution: { width: number; height: number };     // Target resolution for display
  
  // Performance metrics (displayed bottom-left)
  metrics: {
    cpuUsage: number;          // 0-100
    gpuUsage: number;          // 0-100
    frameRate: number;         // Current FPS
    targetFrameRate: number;   // Target FPS (usually 60)
    bitrate: number;           // kbps
    encodingTime: number;      // milliseconds
    networkStatus: 'good' | 'okay' | 'poor';
  };
  
  // Callbacks
  onSourceSelect?: (sourceId: string | null) => void;
  onSourceUpdate?: (sourceId: string, updates: Partial<Source>) => void;
  onSourceDelete?: (sourceId: string) => void;
}
```

## Source Properties

Each source has these properties that affect rendering:

```typescript
interface SourceProperties {
  // Position & Size
  x?: number;                // Pixels from left
  y?: number;                // Pixels from top
  width?: number;            // Pixels (default: 320)
  height?: number;           // Pixels (default: 240)
  
  // Transform
  rotation?: number;         // Degrees (0-360)
  scaleX?: number;          // Scale multiplier (default: 1)
  scaleY?: number;          // Scale multiplier (default: 1)
  opacity?: number;         // 0-100 (default: 100)
  
  // Crop (for future use)
  cropLeft?: number;
  cropTop?: number;
  cropRight?: number;
  cropBottom?: number;
  
  // Other
  lockAspectRatio?: boolean;
  [key: string]: any;
}
```

## Interaction Guide

### Mouse
- **Click on source**: Select it (green outline appears)
- **Drag source**: Move it to new position
- **Drag corner handles**: Resize (corners have green squares when selected)
- **Right-click**: Context menu (for future implementation)
- **Space + drag**: Pan the canvas

### Keyboard
- **Delete**: Remove selected source
- **Tab**: Cycle to next visible source
- **Space (hold)**: Enables pan mode (cursor changes to grab)

### Toolbar
- **Grid toggle**: Show/hide grid overlay
- **Grid size selector**: Change grid spacing (10px, 25px, 50px)
- **Zoom slider**: 50% to 300%
- **Zoom +/-**: Quick zoom buttons
- **Fit**: Reset zoom and pan to default

## Display Information

### Top-Left
- Resolution: `1080p 60fps`

### Top-Center
- Scene name

### Top-Right
- Elapsed time (hh:mm:ss)
- Recording indicator (red dot + "REC" label)
- LIVE indicator (pulsing red badge when streaming)

### Bottom-Left
- CPU usage %
- GPU usage %
- FPS (current/target)
- Bitrate (kbps)
- Encoding time (ms)
- Network status (Good/Okay/Poor with color coding)

### Bottom-Right
- Source count (visible/total)

## Styling & Theme

The component uses:
- **Dark background**: `#0a0a0a` (WISE² brand dark)
- **Border color**: `rgba(255, 255, 255, 0.1)`
- **Selection color**: `#00ff00` (bright green)
- **Hover color**: `#ffff00` (bright yellow for resize handles)
- **Tailwind CSS**: Dark theme classes (`bg-gray-900`, etc.)

## Performance Notes

1. **Canvas Rendering**: Uses Canvas 2D API for 60fps rendering
2. **RequestAnimationFrame**: Auto-synced to display refresh rate
3. **Transform Caching**: Context state properly saved/restored
4. **Efficient Hit Detection**: Only checks reverse z-order when needed

## Example with Live Time Update

```tsx
import { useEffect, useState } from 'react';
import { PreviewCanvas } from '@/components/LiveStudio';

export function LiveStudioPage() {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (isRecording) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // ... rest of component
}
```

## Advanced: Custom Metrics

To get real metrics from your system:

```tsx
async function getSystemMetrics() {
  // In a real app, you'd fetch these from your backend or WebSocket
  return {
    cpuUsage: Math.random() * 100,
    gpuUsage: Math.random() * 80,
    frameRate: 60,
    targetFrameRate: 60,
    bitrate: 5200,
    encodingTime: Math.random() * 20 + 5,
    networkStatus: (['good', 'okay', 'poor'] as const)[
      Math.floor(Math.random() * 3)
    ],
  };
}
```

## Accessibility

- Canvas element is focusable (tabindex="0")
- Keyboard shortcuts for all major operations
- Color coding for metrics (green=good, yellow=okay, red=poor)
- High contrast overlays for readability

## Troubleshooting

### Canvas not rendering?
- Check that `canvasRef.current` is available
- Ensure `getContext('2d')` returns a valid context
- Verify source `visible` property is true

### Interactions not working?
- Ensure component has focus (click on canvas first)
- Check that coordinate transformation is correct
- Verify zoom/pan values are within valid ranges (0.5-3.0)

### Performance issues?
- Reduce number of sources
- Lower grid resolution
- Disable grid overlay if not needed
- Check browser console for errors

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS: may have touch event differences)

## Future Enhancements

- [ ] Touch support for mobile
- [ ] Multi-select sources
- [ ] Undo/redo stack
- [ ] Alignment guides
- [ ] Snap-to-grid with offset
- [ ] Custom brush/draw modes
- [ ] Video/image preview in sources
- [ ] Audio level meters
- [ ] Preset layouts
