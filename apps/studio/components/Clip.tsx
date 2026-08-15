'use client';

/* eslint-disable no-unused-vars */

/**
 * Clip Component
 * Individual audio clip on timeline with editing capabilities
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { drawWaveformToCanvas } from '../utils/waveformGenerator';

export interface ClipProps {
  id: string;
  trackId: string;
  name: string;
  audioBuffer: AudioBuffer;
  startTime: number; // seconds, position on timeline
  duration: number; // original duration
  displayStart: number; // trim start
  displayEnd: number; // trim end
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  isSelected?: boolean;
  pxPerSecond: number; // pixels per second (zoom level)

  // Callbacks
  onMove?: (newStartTime: number) => void;
  onTrimStart?: (newTrimStart: number) => void;
  onTrimEnd?: (newTrimEnd: number) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  onFadeInChange?: (duration: number) => void;
  onFadeOutChange?: (duration: number) => void;
}

export function Clip({
  id: _id,
  name,
  audioBuffer,
  startTime,
  duration,
  displayStart,
  displayEnd,
  fadeIn = 0,
  fadeOut = 0,
  isSelected = false,
  pxPerSecond,
  onMove,
  onTrimStart,
  onTrimEnd,
  onSelect,
  onDelete,
  onFadeInChange: _onFadeInChange,
  onFadeOutChange: _onFadeOutChange,
}: ClipProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'trim-start' | 'trim-end' | 'fade-in' | 'fade-out' | null>(null);
  const [dragStart, setDragStart] = useState(0);
  const [waveformRendered, setWaveformRendered] = useState(false);

  // Calculate display width based on displayed portion
  const displayWidth = (displayEnd - displayStart) * pxPerSecond;
  const clipLeft = startTime * pxPerSecond;

  // Render waveform to canvas
  useEffect(() => {
    if (!canvasRef.current || waveformRendered) return;

    const canvas = canvasRef.current;
    canvas.width = Math.max(displayWidth, 1);
    canvas.height = 60;

    drawWaveformToCanvas(canvas, audioBuffer, {
      width: canvas.width,
      height: canvas.height,
      color: isSelected ? '#00FF88' : '#00D9FF',
      backgroundColor: isSelected ? '#1a3a2a' : '#1a1a1a',
      channelMode: 'mono',
    });

    setWaveformRendered(true);
  }, [audioBuffer, displayStart, displayEnd, displayWidth, isSelected, pxPerSecond, waveformRendered]);

  // Re-render when selection changes
  useEffect(() => {
    if (canvasRef.current) {
      setWaveformRendered(false);
    }
  }, [isSelected]);

  /**
   * Handle mouse down - determine drag mode
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click

    e.preventDefault();
    e.stopPropagation();

    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const dragThreshold = 8; // pixels for resize handles

    // Check which part of clip is being dragged
    if (relativeX < dragThreshold) {
      // Trim start
      setDragMode('trim-start');
      setDragStart(e.clientX);
    } else if (relativeX > rect.width - dragThreshold) {
      // Trim end
      setDragMode('trim-end');
      setDragStart(e.clientX);
    } else {
      // Move clip
      setDragMode('move');
      setDragStart(e.clientX);
    }

    setIsDragging(true);
    onSelect?.();
  };

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragMode) return;

      const delta = e.clientX - dragStart;
      const deltaSeconds = delta / pxPerSecond;

      switch (dragMode) {
        case 'move': {
          // Move entire clip
          const newStartTime = Math.max(0, startTime + deltaSeconds);
          onMove?.(newStartTime);
          setDragStart(e.clientX);
          break;
        }

        case 'trim-start': {
          // Trim from start
          const newTrimStart = Math.max(0, Math.min(displayStart + deltaSeconds, displayEnd - 0.1));
          onTrimStart?.(newTrimStart);
          setDragStart(e.clientX);
          break;
        }

        case 'trim-end': {
          // Trim from end
          const newTrimEnd = Math.min(duration, Math.max(displayStart + 0.1, displayEnd + deltaSeconds));
          onTrimEnd?.(newTrimEnd);
          setDragStart(e.clientX);
          break;
        }
      }
    },
    [isDragging, dragMode, dragStart, pxPerSecond, startTime, displayStart, displayEnd, duration, onMove, onTrimStart, onTrimEnd]
  );

  /**
   * Handle mouse up - end drag
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
  }, []);

  /**
   * Register mouse event listeners
   */
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  /**
   * Handle key presses
   */
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, onDelete]);

  return (
    <div
      ref={clipRef}
      className={`absolute top-0 h-16 rounded border-2 transition-colors cursor-move group ${
        isSelected ? 'border-green-400 bg-blue-500/20 shadow-lg shadow-green-500/50' : 'border-gray-600 bg-gray-800 hover:border-gray-500'
      }`}
      style={{
        left: `${clipLeft}px`,
        width: `${displayWidth}px`,
        minWidth: '40px',
      }}
      onMouseDown={handleMouseDown}
      title={`${name} • ${(displayEnd - displayStart).toFixed(2)}s • Click to select, drag to move`}
    >
      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded cursor-pointer w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      {/* Trim Handle - Start */}
      <div
        className="absolute left-0 top-0 w-1 h-full bg-yellow-400 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:opacity-100 hover:bg-yellow-300 transition-all"
        title="Drag to trim start"
      />

      {/* Trim Handle - End */}
      <div
        className="absolute right-0 top-0 w-1 h-full bg-yellow-400 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:opacity-100 hover:bg-yellow-300 transition-all"
        title="Drag to trim end"
      />

      {/* Fade In Triangle */}
      {fadeIn > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-transparent opacity-30"
          style={{ width: `${fadeIn * pxPerSecond}px` }}
          title={`Fade in ${fadeIn.toFixed(2)}s`}
        />
      )}

      {/* Fade Out Triangle */}
      {fadeOut > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-red-500 to-transparent opacity-30"
          style={{ width: `${fadeOut * pxPerSecond}px` }}
          title={`Fade out ${fadeOut.toFixed(2)}s`}
        />
      )}

      {/* Clip Info Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs font-semibold text-white drop-shadow truncate px-1 bg-black/40 rounded">
          {name}
        </span>
      </div>

      {/* Context Menu (right-click) */}
      {isSelected && (
        <div className="absolute -bottom-8 left-0 right-0 bg-gray-900 border border-gray-700 rounded text-xs hidden group-hover:flex gap-1 p-1 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="px-2 py-1 hover:bg-red-500/30 rounded text-red-400 hover:text-red-300"
            title="Delete clip"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
