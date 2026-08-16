'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { OBSSceneManager, type Scene } from './OBSSceneManager';
import { OBSSourceManager, type Source } from './OBSSourceManager';
import { OBSSourceProperties } from './OBSSourceProperties';
import { OBSPreviewCanvas } from './OBSPreviewCanvas';
import { OBSStreamControl } from './OBSStreamControl';
import { OBSStreamStats } from './OBSStreamStats';

interface StreamStatsData {
  viewers: number;
  bitrate: number;
  frameDrops: number;
  encodingTime: number;
  fps: number;
  cpuLoad: number;
  gpuLoad: number;
  memoryUsage: number;
  networkStatus: 'good' | 'okay' | 'poor';
  followers: number;
}

export function LiveStudioIntegration() {
  // Scene Management
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: 'scene-1',
      name: 'Main',
      active: true,
      transition: 'fade',
      transitionDuration: 300,
    },
    {
      id: 'scene-2',
      name: 'Breakroom',
      active: false,
      transition: 'cut',
      transitionDuration: 0,
    },
  ]);

  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id);

  // Source Management
  const [sources, setSources] = useState<Source[]>([
    {
      id: 'source-1',
      name: 'Main Camera',
      type: 'camera',
      visible: true,
      zIndex: 3,
      properties: {
        device: 'Built-in Camera',
        x: 0,
        y: 0,
        width: '1280px',
        height: '720px',
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 100,
      },
    },
    {
      id: 'source-2',
      name: 'Browser Source',
      type: 'browser',
      visible: true,
      zIndex: 2,
      properties: {
        url: 'https://example.com',
        x: 1280,
        y: 0,
        width: '640px',
        height: '720px',
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 100,
      },
    },
  ]);

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  // Stream State
  const [isStreaming, setIsStreaming] = useState(false);
  const [resolution, setResolution] = useState('1280x720');
  const [fps, setFps] = useState(60);

  // Mock Stats (in real implementation, would come from stream engine)
  const [stats, setStats] = useState<StreamStatsData>({
    viewers: 1234,
    bitrate: 5.2,
    frameDrops: 2,
    encodingTime: 15.3,
    fps: 60,
    cpuLoad: 42,
    gpuLoad: 35,
    memoryUsage: 58,
    networkStatus: 'good',
    followers: 23,
  });

  // Scene Management Handlers
  const handleSceneAdd = useCallback(() => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name: `Scene ${scenes.length + 1}`,
      active: false,
      transition: 'fade',
      transitionDuration: 300,
    };
    setScenes([...scenes, newScene]);
  }, [scenes]);

  const handleSceneDelete = useCallback((id: string) => {
    if (scenes.length <= 1) return; // Keep at least one scene
    const newScenes = scenes.filter((s) => s.id !== id);
    setScenes(newScenes);
    if (activeSceneId === id && newScenes.length > 0) {
      setActiveSceneId(newScenes[0].id);
    }
  }, [scenes, activeSceneId]);

  const handleSceneDuplicate = useCallback(
    (id: string) => {
      const scene = scenes.find((s) => s.id === id);
      if (!scene) return;
      const newScene: Scene = {
        ...scene,
        id: `scene-${Date.now()}`,
        name: `${scene.name} (Copy)`,
      };
      setScenes([...scenes, newScene]);
    },
    [scenes]
  );

  const handleSceneRename = useCallback(
    (id: string, name: string) => {
      setScenes(
        scenes.map((s) =>
          s.id === id ? { ...s, name } : s
        )
      );
    },
    [scenes]
  );

  const handleSceneSelect = useCallback((id: string) => {
    setScenes((prev) =>
      prev.map((s) => ({ ...s, active: s.id === id }))
    );
    setActiveSceneId(id);
  }, []);

  const handleSceneReorder = useCallback((newScenes: Scene[]) => {
    setScenes(newScenes);
  }, []);

  const handleTransitionChange = useCallback(
    (id: string, transition: string, duration: number) => {
      setScenes(
        scenes.map((s) =>
          s.id === id
            ? {
                ...s,
                transition: transition as Scene['transition'],
                transitionDuration: duration,
              }
            : s
        )
      );
    },
    [scenes]
  );

  // Source Management Handlers
  const handleSourceAdd = useCallback(() => {
    const sourceTypes: Source['type'][] = ['camera', 'browser', 'screen'];
    const type = sourceTypes[Math.floor(Math.random() * sourceTypes.length)];
    const newSource: Source = {
      id: `source-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Source`,
      type,
      visible: true,
      zIndex: Math.max(...sources.map((s) => s.zIndex), 0) + 1,
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
  }, [sources]);

  const handleSourceDelete = useCallback((id: string) => {
    setSources(sources.filter((s) => s.id !== id));
    if (selectedSourceId === id) {
      setSelectedSourceId(null);
    }
  }, [sources, selectedSourceId]);

  const handleSourceToggleVisibility = useCallback((id: string) => {
    setSources(
      sources.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      )
    );
  }, [sources]);

  const handleSourceSelect = useCallback((id: string) => {
    setSelectedSourceId(id);
    setPropertiesOpen(true);
  }, []);

  const handleSourceReorder = useCallback((newSources: Source[]) => {
    setSources(newSources);
  }, []);

  const handlePropertyChange = useCallback(
    (sourceId: string, property: string, value: any) => {
      setSources(
        sources.map((s) =>
          s.id === sourceId
            ? {
                ...s,
                properties: { ...s.properties, [property]: value },
              }
            : s
        )
      );
    },
    [sources]
  );

  // Stream Control Handlers
  const handleStartStream = useCallback((config: any) => {
    setIsStreaming(true);
    console.log('Stream started with config:', config);

    // Simulate stats updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        viewers: Math.floor(Math.random() * 5000) + 1000,
        bitrate: 4 + Math.random() * 2,
        frameDrops: Math.floor(Math.random() * 5),
        encodingTime: 10 + Math.random() * 10,
        cpuLoad: 30 + Math.random() * 40,
        gpuLoad: 20 + Math.random() * 30,
        memoryUsage: 40 + Math.random() * 30,
        networkStatus: ['good', 'okay', 'poor'][Math.floor(Math.random() * 3)] as any,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStopStream = useCallback(() => {
    setIsStreaming(false);
    console.log('Stream stopped');
  }, []);

  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden">
      {/* Main Layout: 3-column with center preview */}
      <div className="flex h-full gap-0">
        {/* Left Panel: Scene Manager */}
        <div className="w-64 flex-shrink-0 border-r border-gray-800 overflow-hidden">
          <OBSSceneManager
            scenes={scenes}
            onSceneAdd={handleSceneAdd}
            onSceneDelete={handleSceneDelete}
            onSceneDuplicate={handleSceneDuplicate}
            onSceneRename={handleSceneRename}
            onSceneSelect={handleSceneSelect}
            onSceneReorder={handleSceneReorder}
            onTransitionChange={handleTransitionChange}
          />
        </div>

        {/* Center: Preview Canvas + Stream Control */}
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
          {/* Preview Canvas */}
          <OBSPreviewCanvas
            sources={sources as any}
            resolution={resolution}
            fps={fps}
            isLive={isStreaming}
          />

          {/* Stream Control */}
          <div className="flex-shrink-0">
            <OBSStreamControl
              isStreaming={isStreaming}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
            />
          </div>
        </div>

        {/* Right Panels: Sources + Stats */}
        <div className="w-80 flex-shrink-0 flex flex-col border-l border-gray-800">
          {/* Top: Source Manager */}
          <div className="flex-1 overflow-hidden border-b border-gray-800">
            <OBSSourceManager
              sources={sources}
              selectedSourceId={selectedSourceId}
              onSourceAdd={handleSourceAdd}
              onSourceDelete={handleSourceDelete}
              onSourceToggleVisibility={handleSourceToggleVisibility}
              onSourceSelect={handleSourceSelect}
              onSourceReorder={handleSourceReorder}
            />
          </div>

          {/* Bottom: Stream Stats */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 p-4">
            <OBSStreamStats stats={stats} isLive={isStreaming} />
          </div>
        </div>
      </div>

      {/* Source Properties Modal */}
      {selectedSource && (
        <OBSSourceProperties
          source={selectedSource}
          isOpen={propertiesOpen}
          onClose={() => setPropertiesOpen(false)}
          onPropertyChange={handlePropertyChange}
        />
      )}

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="absolute bottom-4 left-4 text-xs text-gray-500 pointer-events-none"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div>Spacebar + Click: Quick scene switch</div>
        <div>Drag scenes to reorder transitions</div>
      </motion.div>
    </div>
  );
}
