# OBS Components Implementation Guide

## Quick Start

### 1. Import Components

```typescript
import { LiveStudioIntegration } from '@/components/LiveStudio';
// Or individual components:
import { OBSSceneManager, OBSSourceManager, OBSPreviewCanvas } from '@/components/LiveStudio';
```

### 2. Use the Full Integration

```typescript
'use client';

import { LiveStudioIntegration } from '@/components/LiveStudio';

export default function StreamPage() {
  return <LiveStudioIntegration />;
}
```

### 3. Custom Integration

```typescript
'use client';

import { useState } from 'react';
import { OBSSceneManager, OBSSourceManager, OBSPreviewCanvas, OBSStreamControl, OBSStreamStats } from '@/components/LiveStudio';

export default function CustomStream() {
  const [scenes, setScenes] = useState([]);
  const [sources, setSources] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="flex gap-4">
      <OBSSceneManager 
        scenes={scenes}
        onSceneAdd={() => { /* ... */ }}
        // ... other props
      />
      <OBSPreviewCanvas 
        sources={sources}
        resolution="1920x1080"
        fps={60}
        isLive={isStreaming}
      />
      <OBSSourceManager 
        sources={sources}
        selectedSourceId={null}
        onSourceAdd={() => { /* ... */ }}
        // ... other props
      />
    </div>
  );
}
```

## Dependencies

Required packages (should already be installed):
- `react` - Component framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling

Install if missing:
```bash
npm install framer-motion lucide-react
```

## Configuration

### Custom Colors

Edit component Tailwind classes to match your theme:

```typescript
// In OBSSceneManager.tsx (line ~120)
className="bg-blue-600 hover:bg-blue-700" // Change these colors
```

Available color scales:
- Primary: `blue-*` (active, selection)
- Success: `green-*` (good status, sources)
- Danger: `red-*` (live, delete)
- Warning: `yellow-*`, `orange-*` (warnings)

### Resolution Presets

Edit in `OBSStreamControl.tsx`:
```typescript
<option value="480p">480p (854x480)</option>
<option value="720p">720p (1280x720)</option>
<option value="1080p">1080p (1920x1080)</option>
<option value="4k">4K (3840x2160)</option>
```

### Bitrate Recommendations

Edit in `OBSStreamControl.tsx`:
```typescript
const resolutionBitrates: Record<Resolution, Record<FPS, { auto: number; min: number; max: number }>> = {
  '480p': { 30: { auto: 1000, min: 500, max: 2500 }, ... },
  '720p': { 30: { auto: 2500, min: 1500, max: 5000 }, ... },
  // Adjust these values for your streaming service
};
```

## State Management Patterns

### Adding a New Scene

```typescript
const handleSceneAdd = () => {
  const newScene: Scene = {
    id: `scene-${Date.now()}`,
    name: `Scene ${scenes.length + 1}`,
    active: false,
    transition: 'fade',
    transitionDuration: 300,
  };
  setScenes([...scenes, newScene]);
};
```

### Adding a New Source

```typescript
const handleSourceAdd = () => {
  const newSource: Source = {
    id: `source-${Date.now()}`,
    name: 'New Source',
    type: 'camera', // or 'browser', 'screen', etc.
    visible: true,
    zIndex: Math.max(...sources.map(s => s.zIndex), 0) + 1,
    properties: {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 100,
    },
  };
  setSources([...sources, newSource]);
};
```

### Switching Active Scene

```typescript
const handleSceneSelect = (id: string) => {
  setScenes(prev =>
    prev.map(s => ({ ...s, active: s.id === id }))
  );
  // Optionally apply transition here
  applySceneTransition(scenes.find(s => s.id === id));
};
```

## Connecting to Real Streaming Backend

### Replace Mock Stats

```typescript
// In LiveStudioIntegration.tsx (line ~270)
const [stats, setStats] = useState<StreamStatsData>({
  viewers: 1234, // Replace with real data
  bitrate: 5.2,
  // ...
});

// Update with real-time stream data
useEffect(() => {
  const unsubscribe = streamEngine.subscribe('stats', (newStats) => {
    setStats(newStats);
  });
  return unsubscribe;
}, []);
```

### Implement Stream Start/Stop

```typescript
const handleStartStream = async (config: StreamConfig) => {
  try {
    await streamEngine.startStream({
      platform: config.platform,
      streamKey: config.streamKey,
      resolution: config.resolution,
      fps: config.fps,
      bitrate: config.bitrate,
      encoder: config.encoder,
    });
    setIsStreaming(true);
  } catch (error) {
    setConnectionError(error.message);
  }
};

const handleStopStream = async () => {
  await streamEngine.stopStream();
  setIsStreaming(false);
};
```

### Connect to OBS WebSocket API

```typescript
// Example using obs-websocket-js
import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

// Connect
await obs.connect('ws://localhost:4444', 'password');

// Get scenes
const { scenes } = await obs.call('GetSceneList');

// Switch scene
await obs.call('SetCurrentProgramScene', { 
  sceneName: 'Main' 
});

// Listen to stats
obs.on('StudioModeStateChanged', (data) => {
  // Update stats
});
```

## Custom Styling Examples

### Change Accent Color

```typescript
// Change from blue to purple
className="bg-purple-600 hover:bg-purple-700 border border-purple-500"
```

### Make Compact Layout

Add to component styles:
```typescript
className="p-2 sm:p-3" // Reduce padding
className="gap-2 sm:gap-3" // Reduce gaps
className="text-xs sm:text-sm" // Smaller text
```

### Dark Mode Adjustments

```typescript
// Add to tailwind config
theme: {
  extend: {
    colors: {
      'stream-bg': 'var(--color-stream-bg)',
      'stream-accent': 'var(--color-stream-accent)',
    }
  }
}
```

## Performance Optimization

### Memoization

```typescript
import { memo, useCallback } from 'react';

const SceneRow = memo(({ scene, onSelect }) => (
  // Scene row JSX
), (prev, next) => prev.scene.id === next.scene.id);

const handleSceneSelect = useCallback((id) => {
  setActiveSceneId(id);
}, []);
```

### Virtual Scrolling (for large source lists)

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={sources.length}
  itemSize={60}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* Source row */}
    </div>
  )}
</FixedSizeList>
```

### Lazy Loading Stats

```typescript
const handleStartStream = useCallback(async (config) => {
  setIsStreaming(true);
  
  // Start stats polling with throttle
  const unsubscribe = throttle(
    () => streamEngine.getStats(),
    1000 // Update every 1 second max
  );
  
  return () => unsubscribe();
}, []);
```

## Testing

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { OBSSceneManager } from './OBSSceneManager';

describe('OBSSceneManager', () => {
  it('should add a scene', () => {
    const onSceneAdd = jest.fn();
    render(
      <OBSSceneManager
        scenes={[]}
        onSceneAdd={onSceneAdd}
        // ... other props
      />
    );
    
    fireEvent.click(screen.getByText('Add Scene'));
    expect(onSceneAdd).toHaveBeenCalled();
  });

  it('should select scene on click', () => {
    const onSceneSelect = jest.fn();
    const scenes = [{ id: '1', name: 'Main', active: false, ... }];
    
    render(
      <OBSSceneManager
        scenes={scenes}
        onSceneSelect={onSceneSelect}
        // ... other props
      />
    );
    
    fireEvent.click(screen.getByText('Main'));
    expect(onSceneSelect).toHaveBeenCalledWith('1');
  });
});
```

## Keyboard Shortcuts Implementation

Add to `LiveStudioIntegration.tsx`:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Spacebar + number = quick scene switch
    if (e.code === 'Space' && /^Digit\d$/.test(e.key)) {
      const sceneIndex = parseInt(e.key) - 1;
      if (sceneIndex < scenes.length) {
        handleSceneSelect(scenes[sceneIndex].id);
      }
    }
    
    // Ctrl+S = Start/Stop stream
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
      e.preventDefault();
      isStreaming ? handleStopStream() : handleStartStream({});
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [scenes, isStreaming]);
```

## Troubleshooting

### Components not rendering
- Check imports are correct: `from '@/components/LiveStudio'`
- Verify parent is `'use client'`
- Ensure Tailwind/Framer Motion are installed

### Drag-and-drop not working
- Check `draggable` attribute is set
- Verify `onDragStart`, `onDragOver`, `onDrop` handlers
- Ensure state updates trigger re-render

### Styles not applying
- Clear Tailwind cache: `rm -rf .next`
- Verify tailwind.config.js includes component paths
- Check class names spelling (Tailwind is case-sensitive)

### Stats not updating
- Check interval is running: `setInterval(...)` in handler
- Verify stats object structure matches interface
- Check for state update batching issues

## Next Steps

1. **Connect Real Streaming:** Integrate with OBS WebSocket or streaming backend
2. **Add Overlays:** Implement text, logo, chat overlays as sources
3. **Recording:** Add local/cloud recording options
4. **Effects:** Implement filters and effects on sources
5. **Alerts:** Add chat/donation alerts from Twitch/YouTube APIs
6. **Multi-Bitrate:** Support adaptive bitrate streaming
7. **Cloud Backup:** Save scenes/sources to database
8. **Spectating:** Add ability to spectate other streamers
