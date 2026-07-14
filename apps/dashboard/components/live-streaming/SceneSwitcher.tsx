'use client';

import React, { useState } from 'react';

interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
}

interface SceneSwitcherProps {
  scenes?: Scene[];
  // eslint-disable-next-line no-unused-vars
  onSceneChange?: (sceneId: string) => void;
}

const DEFAULT_SCENES: Scene[] = [
  { id: 'camera1', name: 'Camera 1', icon: '📹', description: 'Main camera feed', isActive: true },
  { id: 'camera2', name: 'Camera 2', icon: '📹', description: 'Side angle', isActive: false },
  { id: 'screen', name: 'Screen Share', icon: '🖥️', description: 'Desktop capture', isActive: false },
  { id: 'picture', name: 'Picture', icon: '🖼️', description: 'Static image', isActive: false },
];

/**
 * SceneSwitcher Component
 * Displays different camera/screen setup options for streaming
 */
export function SceneSwitcher({ scenes = DEFAULT_SCENES, onSceneChange }: SceneSwitcherProps) {
  const [localScenes, setLocalScenes] = useState(scenes);

  const handleSceneChange = (sceneId: string) => {
    const newScenes = localScenes.map((scene) => ({
      ...scene,
      isActive: scene.id === sceneId,
    }));
    setLocalScenes(newScenes);
    onSceneChange?.(sceneId);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md space-y-md">
      {/* Header */}
      <div className="border-b border-gray-700/50 pb-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Scene Switcher</h3>
        <p className="text-xs text-gray-400 mt-1">Select active video source</p>
      </div>

      {/* Scenes Grid */}
      <div className="grid grid-cols-2 gap-sm">
        {localScenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => handleSceneChange(scene.id)}
            className={`relative p-md rounded-lg border-2 transition-all duration-200 ${
              scene.isActive
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
            }`}
          >
            {/* Active Indicator */}
            {scene.isActive && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            )}

            {/* Content */}
            <div className="text-left">
              <div className="text-2xl mb-1">{scene.icon}</div>
              <h4 className="text-sm font-bold text-white">{scene.name}</h4>
              <p className="text-xs text-gray-400 mt-0.5">{scene.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Scene Preview */}
      <div className="mt-md border-t border-gray-700/50 pt-md">
        <div className="bg-gray-800/50 rounded-lg aspect-video border border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {localScenes.find((s) => s.isActive)?.icon}
            </div>
            <p className="text-sm text-gray-400">
              {localScenes.find((s) => s.isActive)?.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {localScenes.find((s) => s.isActive)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-sm pt-md border-t border-gray-700/50">
        <button className="px-md py-sm rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition-colors">
          Add Scene
        </button>
        <button className="px-md py-sm rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold transition-colors">
          Scene Settings
        </button>
      </div>
    </div>
  );
}
