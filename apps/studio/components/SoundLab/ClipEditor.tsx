'use client';

/**
 * Clip Editor Component
 * Enhanced clip editing with advanced features
 *
 * Features:
 * - Generated clips (blue) vs Recorded clips (green) differentiation
 * - Drag-to-move with snap-to-grid
 * - Trim start/end (visual trim handles)
 * - Crossfade between adjacent clips
 * - Time-stretch (drag corner to extend without pitch change)
 * - Pitch-shift (frequency-domain processing)
 * - Double-click to open clip properties
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { drawWaveformToCanvas } from '../../utils/waveformGenerator';

export type ClipType = 'recorded' | 'generated';

export interface ClipEditorProps {
  id: string;
  trackId: string;
  name: string;
  audioBuffer: AudioBuffer;
  type?: ClipType; // 'recorded' (green) or 'generated' (blue)
  startTime: number; // seconds, position on timeline
  duration: number; // original duration
  displayStart: number; // trim start
  displayEnd: number; // trim end
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  pitchShift?: number; // semitones
  timeStretch?: number; // 1.0 = normal, 0.5 = half speed, 2.0 = double speed
  crossfadeNextClip?: number; // seconds of crossfade
  isSelected?: boolean;
  pxPerSecond: number;
  gridSnap?: number; // snap to grid (in seconds)

  // Callbacks
  onMove?: (newStartTime: number) => void;
  onTrimStart?: (newTrimStart: number) => void;
  onTrimEnd?: (newTrimEnd: number) => void;
  onTimeStretch?: (factor: number) => void;
  onPitchShift?: (semitones: number) => void;
  onCrossfade?: (duration: number) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  onFadeInChange?: (duration: number) => void;
  onFadeOutChange?: (duration: number) => void;
  onPropertiesOpen?: () => void;
}

export function ClipEditor({
  id: _id,
  name,
  audioBuffer,
  type = 'recorded',
  startTime,
  duration,
  displayStart,
  displayEnd,
  fadeIn = 0,
  fadeOut = 0,
  pitchShift = 0,
  timeStretch = 1.0,
  crossfadeNextClip = 0,
  isSelected = false,
  pxPerSecond,
  gridSnap = 0,
  onMove,
  onTrimStart,
  onTrimEnd,
  onTimeStretch,
  onPitchShift,
  onCrossfade,
  onSelect,
  onDelete,
  onFadeInChange,
  onFadeOutChange,
  onPropertiesOpen,
}: ClipEditorProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<
    'move' | 'trim-start' | 'trim-end' | 'time-stretch' | 'pitch-shift' | 'fade-in' | 'fade-out' | null
  >(null);
  const [dragStart, setDragStart] = useState(0);
  const [waveformRendered, setWaveformRendered] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  // Calculate display width based on displayed portion
  const displayWidth = (displayEnd - displayStart) * pxPerSecond;
  const clipLeft = startTime * pxPerSecond;

  // Clip colors based on type
  const getClipColors = () => {
    if (type === 'generated') {
      return {
        waveform: isSelected ? '#00FF88' : '#00D9FF',
        background: isSelected ? '#1a3a2a' : '#1a1a1a',
      };
    } else {
      // recorded
      return {
        waveform: isSelected ? '#22c55e' : '#10b981',
        background: isSelected ? '#1a3a1a' : '#0f2817',
      };
    }
  };

  const colors = getClipColors();

  /**
   * Render waveform to canvas
   */
  useEffect(() => {
    if (!canvasRef.current || waveformRendered) return;

    const canvas = canvasRef.current;
    canvas.width = Math.max(displayWidth, 1);
    canvas.height = 60;

    drawWaveformToCanvas(canvas, audioBuffer, {
      width: canvas.width,
      height: canvas.height,
      color: colors.waveform,
      backgroundColor: colors.background,
      channelMode: 'mono',
    });

    setWaveformRendered(true);
  }, [audioBuffer, displayStart, displayEnd, displayWidth, isSelected, pxPerSecond, waveformRendered, colors]);

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
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = clipRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    const dragThreshold = 8;

    // Determine drag mode based on click position
    if (relativeY < dragThreshold) {
      // Top area - pitch shift
      setDragMode('pitch-shift');
    } else if (relativeX < dragThreshold) {
      // Left edge - trim start
      setDragMode('trim-start');
    } else if (relativeX > rect.width - dragThreshold) {
      if (relativeY > rect.height - dragThreshold) {
        // Bottom right corner - time stretch
        setDragMode('time-stretch');
      } else {
        // Right edge - trim end
        setDragMode('trim-end');
      }
    } else if (relativeX < 20) {
      // Left area - fade in
      setDragMode('fade-in');
    } else if (relativeX > rect.width - 20) {
      // Right area - fade out
      setDragMode('fade-out');
    } else {
      // Center - move clip
      setDragMode('move');
    }

    setDragStart(e.clientX);
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
          let newStartTime = startTime + deltaSeconds;
          if (gridSnap > 0) {
            newStartTime = Math.round(newStartTime / gridSnap) * gridSnap;
          }
          newStartTime = Math.max(0, newStartTime);
          onMove?.(newStartTime);
          setDragStart(e.clientX);
          break;
        }

        case 'trim-start': {
          const newTrimStart = Math.max(0, Math.min(displayStart + deltaSeconds, displayEnd - 0.1));
          onTrimStart?.(newTrimStart);
          setDragStart(e.clientX);
          break;
        }

        case 'trim-end': {
          const newTrimEnd = Math.min(duration, Math.max(displayStart + 0.1, displayEnd + deltaSeconds));
          onTrimEnd?.(newTrimEnd);
          setDragStart(e.clientX);
          break;
        }

        case 'time-stretch': {
          const factor = 1 + delta / (displayWidth || 1);
          const newFactor = Math.max(0.25, Math.min(4.0, timeStretch * factor));
          onTimeStretch?.(newFactor);
          setDragStart(e.clientX);
          break;
        }

        case 'pitch-shift': {
          const semitones = Math.round((delta / 10) * 12) / 12;
          onPitchShift?.(pitchShift + semitones);
          setDragStart(e.clientX);
          break;
        }

        case 'fade-in': {
          const newFadeIn = Math.max(0, Math.min(fadeIn + deltaSeconds, displayEnd - displayStart));
          onFadeInChange?.(newFadeIn);
          setDragStart(e.clientX);
          break;
        }

        case 'fade-out': {
          const newFadeOut = Math.max(0, Math.min(fadeOut + deltaSeconds, displayEnd - displayStart));
          onFadeOutChange?.(newFadeOut);
          setDragStart(e.clientX);
          break;
        }
      }
    },
    [
      isDragging,
      dragMode,
      dragStart,
      pxPerSecond,
      startTime,
      displayStart,
      displayEnd,
      duration,
      fadeIn,
      fadeOut,
      gridSnap,
      displayWidth,
      pitchShift,
      timeStretch,
      onMove,
      onTrimStart,
      onTrimEnd,
      onTimeStretch,
      onPitchShift,
      onFadeInChange,
      onFadeOutChange,
    ]
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
   * Handle double-click to open properties
   */
  const handleDoubleClick = () => {
    setShowProperties(true);
    onPropertiesOpen?.();
  };

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

  const clipTypeLabel = type === 'generated' ? 'Generated' : 'Recorded';

  return (
    <div
      ref={clipRef}
      className={`absolute top-0 h-16 rounded border-2 transition-colors cursor-move group ${
        isSelected ? `border-${type === 'generated' ? 'blue' : 'green'}-400 shadow-lg shadow-${type === 'generated' ? 'blue' : 'green'}-500/50` : `border-${type === 'generated' ? 'blue' : 'green'}-600 hover:border-${type === 'generated' ? 'blue' : 'green'}-500`
      } ${type === 'generated' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}
      style={{
        left: `${clipLeft}px`,
        width: `${displayWidth}px`,
        minWidth: '40px',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title={`${name} • ${clipTypeLabel} • ${(displayEnd - displayStart).toFixed(2)}s • Double-click for properties`}
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

      {/* Time Stretch Handle - Bottom Right */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-purple-400 opacity-0 group-hover:opacity-100 cursor-se-resize hover:opacity-100 hover:bg-purple-300 transition-all rounded-tr"
        title="Drag to time-stretch"
      />

      {/* Pitch Shift Bar - Top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-orange-400 opacity-0 group-hover:opacity-100 cursor-ns-resize hover:opacity-100 hover:bg-orange-300 transition-all"
        title="Drag to shift pitch"
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

      {/* Crossfade Indicator */}
      {crossfadeNextClip > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-cyan-400 to-transparent opacity-20 pointer-events-none"
          style={{ width: `${crossfadeNextClip * pxPerSecond}px` }}
          title={`Crossfade ${crossfadeNextClip.toFixed(2)}s`}
        />
      )}

      {/* Clip Info Label */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white drop-shadow truncate">{name}</span>
          <span className="text-xs text-gray-300 drop-shadow">{clipTypeLabel}</span>
        </div>
        {(pitchShift !== 0 || timeStretch !== 1.0) && (
          <div className="text-xs text-white drop-shadow font-mono">
            {pitchShift !== 0 && `${pitchShift > 0 ? '+' : ''}${pitchShift.toFixed(1)}st`}
            {timeStretch !== 1.0 && ` ${timeStretch.toFixed(2)}x`}
          </div>
        )}
      </div>

      {/* Context Menu (on hover) */}
      {isSelected && (
        <div className="absolute -bottom-10 left-0 right-0 bg-gray-900 border border-gray-700 rounded text-xs hidden group-hover:flex gap-1 p-1 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProperties(true);
            }}
            className="px-2 py-1 hover:bg-blue-500/30 rounded text-blue-400 hover:text-blue-300"
            title="Open clip properties"
          >
            Props
          </button>
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

      {/* Properties Panel (modal) */}
      {showProperties && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm w-full mx-2" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-3">Clip Properties</h3>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-400">Name</label>
                <input type="text" defaultValue={name} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm" />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-gray-400">Type: {clipTypeLabel}</label>
              </div>

              {/* Pitch Shift */}
              <div>
                <label className="text-xs text-gray-400">Pitch Shift: {pitchShift.toFixed(2)} semitones</label>
                <input type="range" min="-12" max="12" step="0.1" defaultValue={pitchShift} className="w-full" />
              </div>

              {/* Time Stretch */}
              <div>
                <label className="text-xs text-gray-400">Time Stretch: {timeStretch.toFixed(2)}x</label>
                <input type="range" min="0.25" max="4" step="0.1" defaultValue={timeStretch} className="w-full" />
              </div>

              {/* Crossfade */}
              <div>
                <label className="text-xs text-gray-400">Crossfade: {crossfadeNextClip.toFixed(2)}s</label>
                <input type="range" min="0" max="2" step="0.05" defaultValue={crossfadeNextClip} className="w-full" />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowProperties(false)} className="flex-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
