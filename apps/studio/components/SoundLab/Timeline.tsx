'use client';

/**
 * Timeline Component
 * Canvas-based 60fps timeline rendering with horizontal scrolling, zoom, and playhead control
 *
 * Features:
 * - Horizontal scrolling track view
 * - Vertical zoom (1-10x magnification)
 * - Time ruler with bars:beats:ticks format
 * - Draggable playhead indicator
 * - Loop region markers
 * - Selection rectangle (drag to select multiple clips)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface TimelineProps {
  /** Duration in seconds */
  duration: number;
  /** Current playhead position in seconds */
  playheadPosition: number;
  /** Pixels per second at current zoom */
  pxPerSecond: number;
  /** Zoom level (1-10x) */
  zoom: number;
  /** Horizontal scroll position in pixels */
  scrollX: number;
  /** Tempo in BPM */
  bpm: number;
  /** Loop enabled */
  isLooping: boolean;
  /** Loop start in seconds */
  loopStart?: number;
  /** Loop end in seconds */
  loopEnd?: number;
  /** Children clips to render */
  children?: React.ReactNode;

  // Callbacks
  onPlayheadChange?: (position: number) => void;
  onZoomChange?: (zoom: number) => void;
  onScrollChange?: (scrollX: number) => void;
  onLoopChange?: (enabled: boolean, start?: number, end?: number) => void;
  onSelectionChange?: (startTime: number, endTime: number) => void;
}

export function Timeline({
  duration,
  playheadPosition,
  pxPerSecond,
  zoom,
  scrollX,
  bpm,
  isLooping,
  loopStart = 0,
  loopEnd,
  children,
  onPlayheadChange,
  onZoomChange,
  onScrollChange,
  onLoopChange,
  onSelectionChange,
}: TimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  // Calculate pixels per beat based on BPM
  const beatDuration = 60 / bpm; // seconds per beat
  const pxPerBeat = pxPerSecond * beatDuration;
  const pxPerBar = pxPerBeat * 4; // 4 beats per bar

  /**
   * Render time ruler with bars, beats, and ticks
   */
  const renderTimeRuler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = 40;
    const rulerY = 0;

    // Clear
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, rulerY, width, height);

    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, rulerY, width, height);

    // Draw time markings
    const visibleDuration = width / pxPerSecond;
    const startTime = scrollX / pxPerSecond;
    const endTime = startTime + visibleDuration;

    // Major marks (bars)
    ctx.strokeStyle = '#666666';
    ctx.fillStyle = '#999999';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    for (let bar = Math.floor(startTime / (beatDuration * 4)); bar <= Math.ceil(endTime / (beatDuration * 4)); bar++) {
      const time = bar * beatDuration * 4;
      const x = time * pxPerSecond - scrollX;

      if (x >= 0 && x <= width) {
        // Bar line
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, rulerY + height - 12);
        ctx.lineTo(x, rulerY + height);
        ctx.stroke();

        // Bar number
        ctx.fillText(`${bar + 1}`, x + 3, rulerY + 14);
      }

      // Minor marks (beats)
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = time + beat * beatDuration;
        const beatX = beatTime * pxPerSecond - scrollX;

        if (beatX >= 0 && beatX <= width && beat > 0) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#444444';
          ctx.beginPath();
          ctx.moveTo(beatX, rulerY + height - 8);
          ctx.lineTo(beatX, rulerY + height);
          ctx.stroke();
        }
      }
    }

    // Current time indicator
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    const bars = Math.floor(playheadPosition / (beatDuration * 4));
    const beats = Math.floor((playheadPosition % (beatDuration * 4)) / beatDuration);
    const ticks = Math.floor(((playheadPosition % beatDuration) / beatDuration) * 480); // 480 ticks per beat
    ctx.fillText(`${bars + 1}:${beats + 1}:${ticks}`, width - 50, rulerY + 14);
  }, [playheadPosition, pxPerSecond, scrollX, bpm, beatDuration]);

  /**
   * Render playhead indicator
   */
  const renderPlayhead = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = playheadPosition * pxPerSecond - scrollX;
    const height = canvas.height;

    // Playhead line
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    // Playhead handle (triangle)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(x - 6, -8);
    ctx.lineTo(x + 6, -8);
    ctx.lineTo(x, 0);
    ctx.closePath();
    ctx.fill();
  }, [playheadPosition, pxPerSecond, scrollX]);

  /**
   * Render loop region
   */
  const renderLoopRegion = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLooping || loopEnd === undefined) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startX = loopStart * pxPerSecond - scrollX;
    const endX = loopEnd * pxPerSecond - scrollX;
    const width = canvas.width;
    const height = canvas.height;

    if (endX < 0 || startX > width) return;

    // Semi-transparent loop region
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'; // green with transparency
    ctx.fillRect(Math.max(0, startX), 0, Math.min(endX, width) - Math.max(0, startX), height);

    // Loop markers
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    if (startX >= 0 && startX <= width) {
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.stroke();
    }

    if (endX >= 0 && endX <= width) {
      ctx.beginPath();
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, [isLooping, loopStart, loopEnd, pxPerSecond, scrollX]);

  /**
   * Main canvas render loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render layers
      renderTimeRuler();
      renderLoopRegion();
      renderPlayhead();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderTimeRuler, renderLoopRegion, renderPlayhead]);

  /**
   * Handle playhead dragging
   */
  const handlePlayheadMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDraggingPlayhead(true);
  };

  useEffect(() => {
    if (!isDraggingPlayhead) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = (x + scrollX) / pxPerSecond;

      onPlayheadChange?.(Math.max(0, Math.min(position, duration)));
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, scrollX, pxPerSecond, duration, onPlayheadChange]);

  /**
   * Handle selection rectangle
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas || e.target === canvas) return;

    e.preventDefault();
    setIsSelecting(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x + scrollX) / pxPerSecond;
    setSelectionStart(time);
  };

  useEffect(() => {
    if (!isSelecting || selectionStart === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const endTime = (x + scrollX) / pxPerSecond;

      const start = Math.min(selectionStart, endTime);
      const end = Math.max(selectionStart, endTime);
      onSelectionChange?.(start, end);
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionStart, scrollX, pxPerSecond, onSelectionChange]);

  /**
   * Handle horizontal scrolling with mouse wheel
   */
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.shiftKey) {
      // Horizontal scroll
      e.preventDefault();
      const newScrollX = Math.max(0, scrollX + e.deltaY);
      onScrollChange?.(newScrollX);
    } else if (e.ctrlKey || e.metaKey) {
      // Zoom
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(1, Math.min(10, zoom + delta));
      onZoomChange?.(newZoom);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-gray-900 border-b border-gray-700 overflow-x-auto overflow-y-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ height: '200px' }}
    >
      {/* Canvas for time ruler and playhead */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={40}
        className="absolute top-0 left-0 cursor-pointer"
        onMouseDown={handlePlayheadMouseDown}
        title="Drag playhead, Shift+Wheel to scroll, Ctrl+Wheel to zoom"
      />

      {/* Clip tracks area */}
      <div
        className="absolute top-10 left-0 right-0 bottom-0 bg-gray-950"
        style={{
          width: `${duration * pxPerSecond}px`,
          minHeight: '160px',
        }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 flex gap-1 bg-gray-900 border border-gray-700 rounded p-1">
        <button
          onClick={() => onZoomChange?.(Math.max(1, zoom - 0.5))}
          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded"
          title="Zoom out"
        >
          −
        </button>
        <span className="px-2 py-1 text-gray-400 text-xs">{zoom.toFixed(1)}x</span>
        <button
          onClick={() => onZoomChange?.(Math.min(10, zoom + 0.5))}
          className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded"
          title="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}
