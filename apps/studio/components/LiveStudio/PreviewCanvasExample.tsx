'use client';

import React, { useState, useEffect } from 'react';
import { PreviewCanvas } from './PreviewCanvas';
import type { Source as SourceManagerSource } from './SourceManager';

/**
 * Example implementation of PreviewCanvas
 * Shows how to use all features with realistic data
 */
export function PreviewCanvasExample() {
  const [sources, setSources] = useState<SourceManagerSource[]>([
    {
      id: 'source-camera-1',
      name: 'Main Camera',
      type: 'camera',
      visible: true,
      locked: false,
      zIndex: 1,
      properties: {
        x: 100,
        y: 50,
        width: 640,
        height: 480,
        opacity: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
    },
    {
      id: 'source-screen-1',
      name: 'Desktop Share',
      type: 'display',
      visible: true,
      locked: false,
      zIndex: 2,
      properties: {
        x: 800,
        y: 200,
        width: 400,
        height: 300,
        opacity: 90,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
    },
    {
      id: 'source-text-1',
      name: 'Title Text',
      type: 'text',
      visible: true,
      locked: false,
      zIndex: 3,
      properties: {
        x: 200,
        y: 800,
        width: 800,
        height: 200,
        opacity: 100,
        rotation: 0,
        text: 'WISE² Live Studio',
        fontSize: 48,
        fontFamily: 'Arial',
        fontColor: '#ffffff',
      },
    },
  ]);

  const [sceneName] = useState('Main Scene');
  const [isRecording, setIsRecording] = useState(true);
  const [isStreaming, setIsStreaming] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('00:05:32');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Simulated metrics update
  const [metrics, setMetrics] = useState({
    cpuUsage: 42,
    gpuUsage: 28,
    frameRate: 60,
    targetFrameRate: 60,
    bitrate: 5200,
    encodingTime: 12,
    networkStatus: 'good' as const,
  });

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const [h, m, s] = prev.split(':').map(Number);
        let seconds = s + 1;
        let minutes = m;
        let hours = h;

        if (seconds >= 60) {
          seconds = 0;
          minutes += 1;
        }
        if (minutes >= 60) {
          minutes = 0;
          hours += 1;
        }

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      });

      // Simulate metric changes
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        gpuUsage: Math.max(15, Math.min(60, prev.gpuUsage + (Math.random() - 0.5) * 8)),
        encodingTime: Math.max(5, Math.min(30, prev.encodingTime + (Math.random() - 0.5) * 4)),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSourceSelect = (sourceId: string | null) => {
    setSelectedSourceId(sourceId);
    console.log('Source selected:', sourceId);
  };

  const handleSourceUpdate = (sourceId: string, updates: Partial<SourceManagerSource>) => {
    setSources((prev) =>
      prev.map((source) => {
        if (source.id === sourceId) {
          return {
            ...source,
            ...updates,
            properties: {
              ...source.properties,
              ...updates.properties,
            },
          };
        }
        return source;
      })
    );
  };

  const handleSourceDelete = (sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    setSelectedSourceId(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Studio Preview</h1>
          <p className="text-sm text-gray-400 mt-1">Interactive OBS Preview Canvas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isRecording ? '⏹ Recording' : '⭕ Record'}
          </button>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isStreaming
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isStreaming ? '🔴 Live' : '⭕ Stream'}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 min-h-0">
        <PreviewCanvas
          sources={sources}
          sceneName={sceneName}
          isRecording={isRecording}
          isStreaming={isStreaming}
          elapsedTime={elapsedTime}
          resolution={{ width: 1920, height: 1080 }}
          targetResolution={{ width: 1080, height: 1080 }}
          metrics={metrics}
          onSourceSelect={handleSourceSelect}
          onSourceUpdate={handleSourceUpdate}
          onSourceDelete={handleSourceDelete}
        />
      </div>

      {/* Properties Panel */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-h-40 overflow-y-auto">
        <div className="text-sm text-gray-300">
          <p className="font-semibold mb-2">Sources ({sources.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  selectedSourceId === source.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handleSourceSelect(source.id)}
              >
                <div className="font-medium text-xs">{source.name}</div>
                <div className="text-xs opacity-75">
                  {source.properties.x?.toFixed(0)},{source.properties.y?.toFixed(0)} •{' '}
                  {source.properties.width?.toFixed(0)}x{source.properties.height?.toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedSourceId && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="font-semibold mb-2 text-sm">
              {sources.find((s) => s.id === selectedSourceId)?.name}
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              {(() => {
                const source = sources.find((s) => s.id === selectedSourceId);
                if (!source) return null;
                const p = source.properties;
                return (
                  <>
                    <div>Position: ({p.x?.toFixed(0)}, {p.y?.toFixed(0)})</div>
                    <div>Size: {p.width?.toFixed(0)} x {p.height?.toFixed(0)}</div>
                    <div>Rotation: {p.rotation?.toFixed(0)}°</div>
                    <div>Opacity: {p.opacity?.toFixed(0)}%</div>
                    <div>Z-Index: {source.zIndex}</div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <div>WISE² Studio v1.0</div>
        <div className="flex gap-4">
          <span>CPU: {metrics.cpuUsage.toFixed(0)}%</span>
          <span>GPU: {metrics.gpuUsage.toFixed(0)}%</span>
          <span>FPS: {metrics.frameRate}/{metrics.targetFrameRate}</span>
          <span>Network: {metrics.networkStatus}</span>
        </div>
      </div>
    </div>
  );
}

export default PreviewCanvasExample;
