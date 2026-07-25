'use client';

import React, { useState } from 'react';
import { PreviewUI } from './PreviewUI';
import { type Scene } from './SceneManager';

/**
 * ============================================================================
 * PREVIEW UI EXAMPLE - QUICK START
 * ============================================================================
 *
 * Complete working example of the OBS Scene & Source Management system.
 * Copy this to your pages to get started immediately.
 */

export function PreviewUIExample() {
  // Example scenes with predefined sources
  const exampleScenes: Scene[] = [
    {
      id: 'scene-main',
      name: 'Main',
      active: true,
      visible: true,
      transitionType: 'fade',
      transitionDuration: 300,
      sources: [
        {
          id: 'source-camera',
          name: 'Webcam',
          type: 'camera',
          visible: true,
        },
        {
          id: 'source-screen',
          name: 'Screen Share',
          type: 'display',
          visible: true,
        },
      ],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'scene-breakroom',
      name: 'Breakroom',
      active: false,
      visible: true,
      transitionType: 'cut',
      transitionDuration: 0,
      sources: [
        {
          id: 'source-bg-image',
          name: 'Background',
          type: 'image',
          visible: true,
        },
        {
          id: 'source-text-overlay',
          name: 'Text Overlay',
          type: 'text',
          visible: true,
        },
      ],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: 'scene-end',
      name: 'End Card',
      active: false,
      visible: true,
      transitionType: 'fade',
      transitionDuration: 500,
      sources: [
        {
          id: 'source-endcard',
          name: 'End Card',
          type: 'image',
          visible: true,
        },
      ],
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  // State management
  const [scenes, setScenes] = useState<Scene[]>(exampleScenes);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState({
    viewers: 0,
    bitrate: 0,
    fps: 0,
  });

  // Handle scene changes
  const handleScenesChange = (newScenes: Scene[]) => {
    console.log('Scenes updated:', newScenes);
    setScenes(newScenes);
    // TODO: Persist to database or localStorage
  };

  // Handle stream toggle
  const handleStreamToggle = (isActive: boolean) => {
    console.log('Stream toggled:', isActive);
    setIsStreaming(isActive);

    if (isActive) {
      // Simulate stream start
      console.log('Stream started at', new Date().toLocaleTimeString());
      // TODO: Connect to actual streaming service
    } else {
      console.log('Stream stopped at', new Date().toLocaleTimeString());
    }
  };

  return (
    <div className="w-full">
      {/* Status Bar (Optional) */}
      <div className="bg-wise-surface-secondary border-b border-wise-medium px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span className="text-sm font-semibold text-wise-text-primary">
              {isStreaming ? 'STREAMING' : 'Offline'}
            </span>
          </div>

          {isStreaming && (
            <>
              <div className="text-xs text-wise-text-muted">
                Viewers: {streamStats.viewers}
              </div>
              <div className="text-xs text-wise-text-muted">
                {streamStats.bitrate} Mbps
              </div>
              <div className="text-xs text-wise-text-muted">
                {streamStats.fps} FPS
              </div>
            </>
          )}
        </div>

        {/* Start/Stop Stream Button */}
        <button
          onClick={() => handleStreamToggle(!isStreaming)}
          className={`px-6 py-2 rounded font-semibold text-sm transition ${
            isStreaming
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </button>
      </div>

      {/* Main OBS Interface */}
      <PreviewUI
        scenes={scenes}
        onScenesChange={handleScenesChange}
        canvasWidth={1920}
        canvasHeight={1080}
        initialSceneId="scene-main"
        showFps={true}
        editable={true}
        onStreamToggle={handleStreamToggle}
      />

      {/* Debug Info (Remove in production) */}
      <div className="fixed bottom-4 right-4 bg-wise-surface-secondary border border-wise-medium rounded p-3 text-xs text-wise-text-muted max-w-xs">
        <div className="font-semibold mb-2">Debug Info</div>
        <div>Scenes: {scenes.length}</div>
        <div>Active: {scenes.find((s) => s.active)?.name || 'None'}</div>
        <div>Streaming: {isStreaming ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * MINIMAL EXAMPLE - JUST THE PREVIEW UI
 * ============================================================================
 *
 * Use this for the simplest setup:
 */

export function MinimalPreviewUIExample() {
  return (
    <PreviewUI
      canvasWidth={1920}
      canvasHeight={1080}
      showFps={true}
      editable={true}
    />
  );
}

/**
 * ============================================================================
 * CUSTOMIZED EXAMPLE - WITH LOCAL STORAGE PERSISTENCE
 * ============================================================================
 *
 * Persist scenes to browser localStorage:
 */

export function PersistentPreviewUIExample() {
  const STORAGE_KEY = 'obs-scenes';

  const [scenes, setScenes] = useState<Scene[]>(() => {
    // Load from localStorage on first render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [];
  });

  const handleScenesChange = (newScenes: Scene[]) => {
    setScenes(newScenes);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScenes));
      console.log('Scenes saved to localStorage');
    }
  };

  return (
    <div>
      <PreviewUI
        scenes={scenes}
        onScenesChange={handleScenesChange}
        canvasWidth={1920}
        canvasHeight={1080}
      />
    </div>
  );
}

/**
 * ============================================================================
 * RESPONSIVE EXAMPLE - MOBILE FIRST
 * ============================================================================
 *
 * Automatically adapts to mobile/tablet layouts:
 */

export function ResponsivePreviewUIExample() {
  const [canvasSize, setCanvasSize] = useState({
    width: 1920,
    height: 1080,
  });

  React.useEffect(() => {
    const handleResize = () => {
      // Adjust canvas size based on viewport
      if (window.innerWidth < 768) {
        setCanvasSize({ width: 960, height: 540 });
      } else if (window.innerWidth < 1280) {
        setCanvasSize({ width: 1280, height: 720 });
      } else {
        setCanvasSize({ width: 1920, height: 1080 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PreviewUI
      canvasWidth={canvasSize.width}
      canvasHeight={canvasSize.height}
      showFps={true}
    />
  );
}

/**
 * ============================================================================
 * STREAMING EXAMPLE - WITH API INTEGRATION
 * ============================================================================
 *
 * Integrate with your streaming backend:
 */

export function StreamingPreviewUIExample() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState('');

  const handleStreamToggle = async (isActive: boolean) => {
    try {
      if (isActive) {
        // Start stream via API
        const response = await fetch('/api/stream/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamKey }),
        });

        if (response.ok) {
          setIsStreaming(true);
          console.log('Stream started successfully');
        }
      } else {
        // Stop stream via API
        const response = await fetch('/api/stream/stop', {
          method: 'POST',
        });

        if (response.ok) {
          setIsStreaming(false);
          console.log('Stream stopped successfully');
        }
      }
    } catch (error) {
      console.error('Stream toggle error:', error);
    }
  };

  return (
    <div>
      <PreviewUI
        canvasWidth={1920}
        canvasHeight={1080}
        showFps={true}
        onStreamToggle={handleStreamToggle}
      />
    </div>
  );
}

export default PreviewUIExample;
