'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, Grid3x3, Copy, Trash2 } from 'lucide-react';
import type { Source } from './SourceManager';

interface PreviewCanvasProps {
  sources: Source[];
  sceneName: string;
  isRecording: boolean;
  isStreaming: boolean;
  elapsedTime: string;
  resolution: { width: number; height: number };
  targetResolution: { width: number; height: number };
  metrics: {
    cpuUsage: number;
    gpuUsage: number;
    frameRate: number;
    targetFrameRate: number;
    bitrate: number;
    encodingTime: number;
    networkStatus: 'good' | 'okay' | 'poor';
  };
  onSourceSelect?: (sourceId: string | null) => void;
  onSourceUpdate?: (sourceId: string, updates: Partial<Source>) => void;
  onSourceDelete?: (sourceId: string) => void;
}

interface CanvasState {
  selectedSourceId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  gridSize: number;
  isDragging: boolean;
  dragMode: 'move' | 'resize' | null;
  dragStart: { x: number; y: number };
  isSpacePressed: boolean;
  hoveredHandle: string | null;
}

// Render handles for resizing
const RESIZE_HANDLES = [
  { id: 'nw', cursor: 'nw-resize' }, // top-left
  { id: 'ne', cursor: 'ne-resize' }, // top-right
  { id: 'sw', cursor: 'sw-resize' }, // bottom-left
  { id: 'se', cursor: 'se-resize' }, // bottom-right
];

const HANDLE_SIZE = 8;

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  sources,
  sceneName,
  isRecording,
  isStreaming,
  elapsedTime,
  resolution,
  targetResolution,
  metrics,
  onSourceSelect,
  onSourceUpdate,
  onSourceDelete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const [state, setState] = useState<CanvasState>({
    selectedSourceId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: false,
    gridSize: 25,
    isDragging: false,
    dragMode: null,
    dragStart: { x: 0, y: 0 },
    isSpacePressed: false,
    hoveredHandle: null,
  });

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Apply transformations (zoom and pan)
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(state.zoom, state.zoom);
      ctx.translate(state.panX, state.panY);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw grid if enabled
      if (state.showGrid) {
        drawGrid(ctx, canvas.width, canvas.height, state.gridSize);
      }

      // Draw sources sorted by z-index
      const sortedSources = [...sources].sort((a, b) => a.zIndex - b.zIndex);
      sortedSources.forEach((source) => {
        if (source.visible) {
          drawSource(ctx, source, state.selectedSourceId === source.id);
        }
      });

      // Restore context
      ctx.restore();

      // Draw overlay info (not affected by zoom/pan)
      drawOverlays(ctx, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, sources]);

  // Draw grid overlay
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, size: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Draw a single source with transforms
  const drawSource = (ctx: CanvasRenderingContext2D, source: Source, isSelected: boolean) => {
    const props = source.properties;
    const x = props.x || 0;
    const y = props.y || 0;
    const width = props.width || 320;
    const height = props.height || 240;
    const rotation = props.rotation || 0;
    const opacity = (props.opacity || 100) / 100;
    const scaleX = props.scaleX || 1;
    const scaleY = props.scaleY || 1;

    ctx.save();
    ctx.globalAlpha = opacity;

    // Translate to center, apply rotation and scale, then translate back
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-width / 2, -height / 2);

    // Draw source background (placeholder)
    const hue = hashCode(source.id) % 360;
    ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;
    ctx.fillRect(0, 0, width, height);

    // Draw source type icon and name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillText(source.name, 8, 20);

    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`[${source.type}]`, 8, 35);

    ctx.restore();

    // Draw selection outline (not affected by source transforms)
    if (isSelected) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);

      // Draw resize handles
      RESIZE_HANDLES.forEach((handle) => {
        let handleX = x;
        let handleY = y;

        if (handle.id === 'ne') handleX = x + width;
        if (handle.id === 'sw') handleY = y + height;
        if (handle.id === 'se') {
          handleX = x + width;
          handleY = y + height;
        }

        ctx.fillStyle = state.hoveredHandle === handle.id ? '#ffff00' : '#00ff00';
        ctx.fillRect(
          handleX - HANDLE_SIZE / 2,
          handleY - HANDLE_SIZE / 2,
          HANDLE_SIZE,
          HANDLE_SIZE
        );
      });
    }
  };

  // Draw overlay information (HUD)
  const drawOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const padding = 12;
    const lineHeight = 16;

    // Top-left: Resolution
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${targetResolution.width}p 60fps`, padding, padding + 16);

    // Top-center: Scene name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillText(sceneName, width / 2, padding + 16);

    // Top-right: Elapsed time & indicators
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '12px monospace';
    ctx.fillText(elapsedTime, width - padding, padding + 16);

    // Recording indicator
    if (isRecording) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(width - 60, padding + 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('REC', width - 75, padding + 16);
    }

    // Stream indicator
    if (isStreaming) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🔴 LIVE', width - padding, padding + 40);
    }

    // Bottom-left: Performance metrics
    ctx.textAlign = 'left';
    ctx.font = '11px monospace';
    ctx.fillStyle = '#a0a0a0';

    const metricsX = padding;
    const metricsY = height - padding - 95;

    ctx.fillText(`CPU: ${metrics.cpuUsage}%`, metricsX, metricsY);
    ctx.fillText(`GPU: ${metrics.gpuUsage}%`, metricsX, metricsY + lineHeight);
    ctx.fillText(`FPS: ${metrics.frameRate}/${metrics.targetFrameRate}`, metricsX, metricsY + lineHeight * 2);
    ctx.fillText(`Bitrate: ${metrics.bitrate} kbps`, metricsX, metricsY + lineHeight * 3);
    ctx.fillText(`Encoding: ${metrics.encodingTime}ms`, metricsX, metricsY + lineHeight * 4);

    // Network status indicator
    ctx.textAlign = 'left';
    const networkColor =
      metrics.networkStatus === 'good'
        ? '#00ff00'
        : metrics.networkStatus === 'okay'
          ? '#ffff00'
          : '#ff0000';
    ctx.fillStyle = networkColor;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Network: ${metrics.networkStatus.toUpperCase()}`, metricsX, metricsY + lineHeight * 5);

    // Bottom-right: Source count
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '10px monospace';
    const visibleCount = sources.filter((s) => s.visible).length;
    ctx.fillText(`${visibleCount}/${sources.length} sources`, width - padding, height - padding);
  };

  // Find source at canvas point
  const getSourceAtPoint = (clientX: number, clientY: number): { sourceId: string; handleId?: string } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Transform point back to canvas coordinates
    const transformedX = (x - canvas.width / 2) / state.zoom - state.panX + canvas.width / 2;
    const transformedY = (y - canvas.height / 2) / state.zoom - state.panY + canvas.height / 2;

    // Check reverse z-order (top-most sources first)
    const reversedSources = [...sources].reverse();
    for (const source of reversedSources) {
      if (!source.visible) continue;

      const props = source.properties;
      const sx = props.x || 0;
      const sy = props.y || 0;
      const sw = props.width || 320;
      const sh = props.height || 240;

      // Check if click is on resize handles (only for selected source)
      if (state.selectedSourceId === source.id) {
        for (const handle of RESIZE_HANDLES) {
          let handleX = sx;
          let handleY = sy;

          if (handle.id === 'ne') handleX = sx + sw;
          if (handle.id === 'sw') handleY = sy + sh;
          if (handle.id === 'se') {
            handleX = sx + sw;
            handleY = sy + sh;
          }

          const distance = Math.sqrt(
            Math.pow(transformedX - handleX, 2) + Math.pow(transformedY - handleY, 2)
          );
          if (distance <= HANDLE_SIZE) {
            return { sourceId: source.id, handleId: handle.id };
          }
        }
      }

      // Check if click is within source bounds
      if (
        transformedX >= sx &&
        transformedX <= sx + sw &&
        transformedY >= sy &&
        transformedY <= sy + sh
      ) {
        return { sourceId: source.id };
      }
    }

    return null;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      // Right-click: context menu
      e.preventDefault();
      const hit = getSourceAtPoint(e.clientX, e.clientY);
      if (hit?.sourceId) {
        // Open context menu (in a real app, you'd show a context menu here)
        console.log('Context menu for:', hit.sourceId);
      }
      return;
    }

    if (state.isSpacePressed) {
      // Space+drag: pan
      setState((prev) => ({
        ...prev,
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY },
        dragMode: 'move',
      }));
      return;
    }

    const hit = getSourceAtPoint(e.clientX, e.clientY);
    if (!hit) return;

    const sourceId = hit.sourceId;
    setState((prev) => ({
      ...prev,
      selectedSourceId: sourceId,
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
      dragMode: hit.handleId ? 'resize' : 'move',
    }));

    if (sourceId) {
      onSourceSelect?.(sourceId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDragging || !state.dragMode) {
      // Update hover state for resize handles
      const hit = getSourceAtPoint(e.clientX, e.clientY);
      setState((prev) => ({
        ...prev,
        hoveredHandle: hit?.handleId || null,
      }));
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const deltaX = (e.clientX - state.dragStart.x) / state.zoom;
    const deltaY = (e.clientY - state.dragStart.y) / state.zoom;

    if (state.isSpacePressed && state.dragMode === 'move') {
      // Pan camera
      setState((prev) => ({
        ...prev,
        panX: prev.panX + deltaX / canvas.width,
        panY: prev.panY + deltaY / canvas.height,
        dragStart: { x: e.clientX, y: e.clientY },
      }));
      return;
    }

    if (!state.selectedSourceId) return;

    const source = sources.find((s) => s.id === state.selectedSourceId);
    if (!source) return;

    const props = source.properties;
    const updates: Partial<Source> = {
      properties: { ...props },
    };

    if (state.dragMode === 'move') {
      updates.properties!.x = (props.x || 0) + deltaX;
      updates.properties!.y = (props.y || 0) + deltaY;
    } else if (state.dragMode === 'resize') {
      updates.properties!.width = Math.max(50, (props.width || 320) + deltaX);
      updates.properties!.height = Math.max(50, (props.height || 240) + deltaY);
    }

    onSourceUpdate?.(state.selectedSourceId, updates);

    setState((prev) => ({
      ...prev,
      dragStart: { x: e.clientX, y: e.clientY },
    }));
  };

  const handleMouseUp = () => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      dragMode: null,
    }));
  };

  const handleMouseLeave = () => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      dragMode: null,
      hoveredHandle: null,
    }));
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  // Keyboard handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setState((prev) => ({ ...prev, isSpacePressed: true }));
    }
    if (e.code === 'Delete' && state.selectedSourceId) {
      e.preventDefault();
      onSourceDelete?.(state.selectedSourceId);
      setState((prev) => ({ ...prev, selectedSourceId: null }));
    }
    if (e.code === 'Tab') {
      e.preventDefault();
      const visibleSources = sources.filter((s) => s.visible);
      if (visibleSources.length === 0) return;

      const currentIndex = visibleSources.findIndex((s) => s.id === state.selectedSourceId);
      const nextIndex = (currentIndex + 1) % visibleSources.length;
      const nextSourceId = visibleSources[nextIndex].id;

      setState((prev) => ({ ...prev, selectedSourceId: nextSourceId }));
      onSourceSelect?.(nextSourceId);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      setState((prev) => ({ ...prev, isSpacePressed: false }));
    }
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + delta)),
    }));
  };

  const handleFitToWindow = () => {
    setState((prev) => ({
      ...prev,
      zoom: 1,
      panX: 0,
      panY: 0,
    }));
  };

  const toggleGrid = () => {
    setState((prev) => ({
      ...prev,
      showGrid: !prev.showGrid,
    }));
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-2xl"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleGrid}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              state.showGrid
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Toggle grid overlay"
          >
            <Grid3x3 size={16} />
          </button>

          <select
            value={state.gridSize}
            onChange={(e) => setState((prev) => ({ ...prev, gridSize: Number(e.target.value) }))}
            className="px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 hover:bg-gray-600"
            disabled={!state.showGrid}
          >
            <option value={10}>10px</option>
            <option value={25}>25px</option>
            <option value={50}>50px</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>

          <input
            type="range"
            min={50}
            max={300}
            value={state.zoom * 100}
            onChange={(e) => setState((prev) => ({ ...prev, zoom: Number(e.target.value) / 100 }))}
            className="w-24"
          />

          <span className="text-xs text-gray-400 w-10 text-right">{Math.round(state.zoom * 100)}%</span>

          <button
            onClick={() => handleZoom(0.1)}
            className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>

          <div className="w-px h-6 bg-gray-600" />

          <button
            onClick={handleFitToWindow}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-medium transition-colors"
          >
            Fit
          </button>
        </div>

        {state.selectedSourceId && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                const source = sources.find((s) => s.id === state.selectedSourceId);
                if (source) {
                  const newSource = { ...source, id: `${source.id}_copy_${Date.now()}` };
                  // In real implementation, emit event to parent
                }
              }}
              className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              title="Duplicate source"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => {
                onSourceDelete?.(state.selectedSourceId!);
                setState((prev) => ({ ...prev, selectedSourceId: null }));
              }}
              className="p-1 bg-red-700 text-white rounded hover:bg-red-600"
              title="Delete source"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-950 flex items-center justify-center overflow-hidden p-2">
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          className={`max-w-full max-h-full rounded border border-gray-700 shadow-lg ${
            state.isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
          style={{
            background: '#0a0a0a',
          }}
        />
      </div>

      {/* Info Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            {sources.length} total • {sources.filter((s) => s.visible).length} visible
          </span>
          {state.selectedSourceId && (
            <span className="text-blue-400">
              Selected: {sources.find((s) => s.id === state.selectedSourceId)?.name}
            </span>
          )}
        </div>
        <div className="text-gray-600 text-xs">
          Drag to move • Corners to resize • Space+Drag to pan • Tab to cycle • Delete to remove
        </div>
      </div>
    </div>
  );
};

// Simple hash function for consistent colors
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export default PreviewCanvas;
