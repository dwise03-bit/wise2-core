# Scene Manager - Examples & Integration Guide

Complete examples for integrating the SceneManager component into your Live Studio application.

## Basic Usage

### Simple Integration

```tsx
'use client';

import { useState } from 'react';
import { SceneManager, type Scene } from './SceneManager';

export function LiveStudioPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-wise-medium px-6 py-4">
        <h1 className="text-2xl font-bold text-wise-text-primary">Live Studio</h1>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <SceneManager
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onScenesChange={setScenes}
          onSceneSelect={setSelectedSceneId}
        />
      </div>
    </div>
  );
}
```

## With OBS Integration

Sync scene changes with OBS WebSocket API:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SceneManager, type Scene } from './SceneManager';
import { useOBSConnection } from '@/hooks/useOBSConnection';

export function LiveStudioWithOBS() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const obs = useOBSConnection();

  // Load scenes from OBS on mount
  useEffect(() => {
    if (!obs.connected) return;

    const loadScenes = async () => {
      try {
        const obsScenes = await obs.getSceneList();
        
        const mappedScenes: Scene[] = obsScenes.map((obsScene, index) => ({
          id: obsScene.sceneName,
          name: obsScene.sceneName,
          active: obsScene.isActive || index === 0,
          visible: true,
          transitionType: 'fade',
          transitionDuration: 300,
          sources: (obsScene.sceneItems || []).map((item) => ({
            id: item.sourceId,
            name: item.sourceName,
            type: item.inputKind || 'unknown',
            visible: item.sceneItemEnabled,
          })),
          createdAt: new Date(),
          modifiedAt: new Date(),
          resolution: { width: 1920, height: 1080 },
        }));

        setScenes(mappedScenes);
        if (mappedScenes.length > 0) {
          setSelectedSceneId(mappedScenes[0].id);
        }
      } catch (error) {
        console.error('Failed to load OBS scenes:', error);
      }
    };

    loadScenes();
  }, [obs.connected]);

  // Handle scene changes
  const handleScenesChange = useCallback(
    async (updatedScenes: Scene[]) => {
      setScenes(updatedScenes);
      
      // Sync with OBS (example: reorder)
      if (obs.connected) {
        try {
          for (const scene of updatedScenes) {
            // OBS API calls to sync changes
            // await obs.updateSceneOrder(scene.id, index);
          }
        } catch (error) {
          console.error('Failed to sync scenes to OBS:', error);
        }
      }
    },
    [obs.connected]
  );

  // Handle scene selection
  const handleSceneSelect = useCallback(
    async (sceneId: string) => {
      setSelectedSceneId(sceneId);

      // Switch to selected scene in OBS
      if (obs.connected) {
        try {
          await obs.setCurrentScene(sceneId);
        } catch (error) {
          console.error('Failed to switch OBS scene:', error);
        }
      }
    },
    [obs.connected]
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-wise-medium px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-wise-text-primary">Live Studio</h1>
        <div className={`text-sm font-semibold ${
          obs.connected ? 'text-wise-accent-green' : 'text-wise-accent-red'
        }`}>
          {obs.connected ? '● Connected to OBS' : '○ Disconnected'}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <SceneManager
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onScenesChange={handleScenesChange}
          onSceneSelect={handleSceneSelect}
        />
      </div>
    </div>
  );
}
```

## With State Persistence

Save scenes to localStorage or backend:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SceneManager, type Scene } from './SceneManager';

const STORAGE_KEY = 'wise2_live_studio_scenes';

export function LiveStudioWithPersistence() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert string dates back to Date objects
        const scenes = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          modifiedAt: new Date(s.modifiedAt),
        }));
        setScenes(scenes);
        if (scenes.length > 0) {
          setSelectedSceneId(scenes[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load scenes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  const handleScenesChange = useCallback((updatedScenes: Scene[]) => {
    setScenes(updatedScenes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenes));
    } catch (error) {
      console.error('Failed to save scenes:', error);
    }
  }, []);

  const handleSceneSelect = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-wise-text-secondary">Loading scenes...</div>
      </div>
    );
  }

  return (
    <SceneManager
      scenes={scenes}
      selectedSceneId={selectedSceneId}
      onScenesChange={handleScenesChange}
      onSceneSelect={handleSceneSelect}
    />
  );
}
```

## With Zustand State Management

For larger applications using Zustand:

```tsx
// stores/liveStudio.ts
import { create } from 'zustand';
import type { Scene } from '@/components/LiveStudio/SceneManager';

interface LiveStudioStore {
  scenes: Scene[];
  selectedSceneId: string;
  setScenes: (scenes: Scene[]) => void;
  selectScene: (sceneId: string) => void;
  addScene: (scene: Scene) => void;
  deleteScene: (sceneId: string) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

export const useLiveStudio = create<LiveStudioStore>((set) => ({
  scenes: [],
  selectedSceneId: '',

  setScenes: (scenes) => set({ scenes }),

  selectScene: (sceneId) => set({ selectedSceneId: sceneId }),

  addScene: (scene) =>
    set((state) => ({
      scenes: [...state.scenes, scene],
    })),

  deleteScene: (sceneId) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== sceneId),
    })),

  updateScene: (sceneId, updates) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, ...updates, modifiedAt: new Date() } : s
      ),
    })),
}));
```

```tsx
// app/studio/page.tsx
'use client';

import { SceneManager } from '@/components/LiveStudio/SceneManager';
import { useLiveStudio } from '@/stores/liveStudio';

export default function StudioPage() {
  const { scenes, selectedSceneId, setScenes, selectScene } = useLiveStudio();

  return (
    <SceneManager
      scenes={scenes}
      selectedSceneId={selectedSceneId}
      onScenesChange={setScenes}
      onSceneSelect={selectScene}
    />
  );
}
```

## With Error Handling

```tsx
'use client';

import { useState, useCallback } from 'react';
import { SceneManager, type Scene } from './SceneManager';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function LiveStudioWithErrorHandling() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const { addError } = useErrorHandler();

  const handleScenesChange = useCallback(
    (updatedScenes: Scene[]) => {
      try {
        // Validate scenes
        if (updatedScenes.length === 0 && scenes.length > 0) {
          throw new Error('Cannot delete all scenes. Keep at least one scene.');
        }

        setScenes(updatedScenes);

        // Persist to backend
        persistScenes(updatedScenes).catch((error) => {
          addError({
            type: 'error',
            title: 'Save Failed',
            message: error.message,
            dismissible: true,
          });
        });
      } catch (error) {
        addError({
          type: 'error',
          title: 'Operation Failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          dismissible: true,
        });
      }
    },
    [scenes, addError]
  );

  const handleSceneSelect = useCallback(
    (sceneId: string) => {
      try {
        const scene = scenes.find((s) => s.id === sceneId);
        if (!scene) {
          throw new Error('Scene not found');
        }
        setSelectedSceneId(sceneId);
      } catch (error) {
        addError({
          type: 'error',
          title: 'Selection Failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          dismissible: true,
        });
      }
    },
    [scenes, addError]
  );

  return (
    <SceneManager
      scenes={scenes}
      selectedSceneId={selectedSceneId}
      onScenesChange={handleScenesChange}
      onSceneSelect={handleSceneSelect}
    />
  );
}

async function persistScenes(scenes: Scene[]) {
  const response = await fetch('/api/scenes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenes),
  });

  if (!response.ok) {
    throw new Error(`Failed to save scenes: ${response.statusText}`);
  }
}
```

## With Analytics

```tsx
'use client';

import { useState, useCallback } from 'react';
import { SceneManager, type Scene } from './SceneManager';
import { trackEvent } from '@/utils/analytics';

export function LiveStudioWithAnalytics() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');

  const handleScenesChange = useCallback((updatedScenes: Scene[]) => {
    // Track different operations
    const oldCount = scenes.length;
    const newCount = updatedScenes.length;

    if (newCount > oldCount) {
      trackEvent('scene_created', { count: newCount });
    } else if (newCount < oldCount) {
      trackEvent('scene_deleted', { count: newCount });
    }

    // Track if order changed
    const orderChanged = scenes.some(
      (s, i) => s.id !== updatedScenes[i]?.id
    );
    if (orderChanged) {
      trackEvent('scene_reordered');
    }

    setScenes(updatedScenes);
  }, [scenes]);

  const handleSceneSelect = useCallback((sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
      trackEvent('scene_selected', {
        sceneId,
        sceneName: scene.name,
        sourceCount: scene.sources.length,
      });
    }
    setSelectedSceneId(sceneId);
  }, [scenes]);

  return (
    <SceneManager
      scenes={scenes}
      selectedSceneId={selectedSceneId}
      onScenesChange={handleScenesChange}
      onSceneSelect={handleSceneSelect}
    />
  );
}
```

## Full Featured Example

Complete example with all features:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SceneManager, type Scene } from './SceneManager';
import { useOBSConnection } from '@/hooks/useOBSConnection';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLiveStudio } from '@/stores/liveStudio';

export function FullFeaturedLiveStudio() {
  const obs = useOBSConnection();
  const { addError, addNotification } = useErrorHandler();
  const { scenes, selectedSceneId, setScenes, selectScene } = useLiveStudio();

  // Load from OBS
  useEffect(() => {
    if (!obs.connected) return;

    const loadScenes = async () => {
      try {
        const obsScenes = await obs.getSceneList();
        const mapped: Scene[] = obsScenes.map((s, i) => ({
          id: s.sceneName,
          name: s.sceneName,
          active: s.isActive || i === 0,
          visible: true,
          transitionType: 'fade',
          transitionDuration: 300,
          sources: (s.sceneItems || []).map((item) => ({
            id: item.sourceId,
            name: item.sourceName,
            type: item.inputKind || 'unknown',
            visible: item.sceneItemEnabled,
          })),
          createdAt: new Date(),
          modifiedAt: new Date(),
          resolution: { width: 1920, height: 1080 },
        }));

        setScenes(mapped);
        if (mapped.length > 0) selectScene(mapped[0].id);
        addNotification({
          type: 'success',
          title: 'Scenes Loaded',
          message: `Loaded ${mapped.length} scenes from OBS`,
          dismissible: true,
        });
      } catch (error) {
        addError({
          type: 'error',
          title: 'Failed to Load Scenes',
          message: error instanceof Error ? error.message : 'Unknown error',
          dismissible: true,
        });
      }
    };

    loadScenes();
  }, [obs.connected, setScenes, selectScene, addError, addNotification]);

  const handleScenesChange = useCallback(
    async (updatedScenes: Scene[]) => {
      setScenes(updatedScenes);

      // Persist to backend
      try {
        await fetch('/api/scenes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedScenes),
        });

        // Save to localStorage as backup
        localStorage.setItem('wise2_scenes', JSON.stringify(updatedScenes));
      } catch (error) {
        console.error('Failed to persist scenes:', error);
      }
    },
    [setScenes]
  );

  const handleSceneSelect = useCallback(
    async (sceneId: string) => {
      selectScene(sceneId);

      // Switch in OBS
      if (obs.connected) {
        try {
          await obs.setCurrentScene(sceneId);
        } catch (error) {
          console.error('Failed to switch OBS scene:', error);
        }
      }
    },
    [selectScene, obs.connected]
  );

  return (
    <div className="h-screen flex flex-col bg-studio-bg">
      <header className="border-b border-wise-medium px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wise-text-primary">Live Studio</h1>
          <p className="text-sm text-wise-text-muted mt-1">
            {scenes.length} scenes configured
          </p>
        </div>
        <div className={`text-sm font-semibold flex items-center gap-2 ${
          obs.connected ? 'text-wise-accent-green' : 'text-wise-accent-red'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            obs.connected ? 'bg-wise-accent-green' : 'bg-wise-accent-red'
          } animate-pulse`} />
          {obs.connected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <SceneManager
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onScenesChange={handleScenesChange}
          onSceneSelect={handleSceneSelect}
        />
      </div>
    </div>
  );
}
```

## Testing Strategies

### Unit Testing with Vitest

```typescript
// SceneManager.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SceneManager, type Scene } from './SceneManager';

describe('SceneManager', () => {
  const mockScenes: Scene[] = [
    {
      id: 'scene-1',
      name: 'Intro',
      active: true,
      visible: true,
      transitionType: 'fade',
      transitionDuration: 300,
      sources: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  it('renders scene list', () => {
    const onSceneSelect = vi.fn();
    const onScenesChange = vi.fn();

    render(
      <SceneManager
        scenes={mockScenes}
        onSceneSelect={onSceneSelect}
        onScenesChange={onScenesChange}
      />
    );

    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('calls onSceneSelect when scene is clicked', () => {
    const onSceneSelect = vi.fn();
    const onScenesChange = vi.fn();

    render(
      <SceneManager
        scenes={mockScenes}
        onSceneSelect={onSceneSelect}
        onScenesChange={onScenesChange}
      />
    );

    fireEvent.click(screen.getByText('Intro'));
    expect(onSceneSelect).toHaveBeenCalledWith('scene-1');
  });

  // Add more tests...
});
```

## Browser DevTools Tips

- Use React DevTools to inspect scene state
- Use Network tab to monitor API calls
- Use Console to manually test scene operations
- Use Performance tab to profile animation performance

## Common Issues & Solutions

### Issue: Scenes not persisting after page reload
**Solution**: Implement localStorage or backend persistence (see examples above)

### Issue: OBS transition settings not syncing
**Solution**: Add OBS API calls in `handleScenesChange` callback

### Issue: Hotkey conflicts
**Solution**: Add validation to detect duplicate hotkeys before saving

### Issue: Lag when reordering many scenes
**Solution**: Enable React.memo on SceneListItem component for large lists
