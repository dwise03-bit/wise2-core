'use client';

/* eslint-disable no-unused-vars */

/**
 * Timeline Track Component
 * Displays all clips for a single track on the timeline
 */

import React, { useCallback } from 'react';
import type { ClipData } from '../hooks/useClips';
import { Clip } from './Clip';

interface TimelineTrackProps {
  trackId: string;
  trackName: string;
  clips: ClipData[];
  pxPerSecond: number; // Pixels per second (zoom level)
  timelineLength: number; // Total timeline length in seconds
  playheadPosition: number; // Current playhead position in seconds
  isRecording?: boolean;

  // Callbacks
  onClipMove?: (clipId: string, newStartTime: number) => void;
  onClipTrimStart?: (clipId: string, newTrimStart: number) => void;
  onClipTrimEnd?: (clipId: string, newTrimEnd: number) => void;
  onClipSelect?: (clipId: string | null) => void;
  onClipDelete?: (clipId: string) => void;
  onClipFadeInChange?: (clipId: string, duration: number) => void;
  onClipFadeOutChange?: (clipId: string, duration: number) => void;
  onSplitAtPlayhead?: (trackId: string, time: number) => void;
}

export function TimelineTrack({
  trackId,
  trackName,
  clips,
  pxPerSecond,
  timelineLength,
  playheadPosition,
  isRecording = false,
  onClipMove,
  onClipTrimStart,
  onClipTrimEnd,
  onClipSelect,
  onClipDelete,
  onClipFadeInChange,
  onClipFadeOutChange,
  onSplitAtPlayhead,
}: TimelineTrackProps) {
  const timelineWidth = timelineLength * pxPerSecond;
  const playheadLeft = playheadPosition * pxPerSecond;

  // Handle double-click to add marker or split
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickTime = clickX / pxPerSecond;

      // Double-click to split at this point
      if (e.detail === 2) {
        onSplitAtPlayhead?.(trackId, clickTime);
      }
    },
    [pxPerSecond, trackId, onSplitAtPlayhead]
  );

  return (
    <div className="flex flex-col gap-2 mb-2">
      {/* Track Header */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-32 text-sm font-semibold text-gray-300 truncate">
          {trackName}
        </div>
        <div className="text-xs text-gray-500">
          {clips.length} clip{clips.length !== 1 ? 's' : ''}
          {isRecording && ' • 🔴 REC'}
        </div>
      </div>

      {/* Timeline Container */}
      <div
        className="relative bg-gray-950 border border-gray-700 rounded h-24 overflow-x-auto overflow-y-hidden"
        style={{ width: '100%' }}
        onClick={onClipSelect ? () => onClipSelect(null) : undefined}
      >
        {/* Timeline Track Area */}
        <div
          className="relative h-full bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900"
          style={{ width: `${timelineWidth}px`, minWidth: '100%' }}
          onClick={handleTimelineClick}
        >
          {/* Grid Lines (optional - every second) */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: Math.ceil(timelineLength) }).map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute top-0 bottom-0 w-px bg-gray-800/30"
                style={{ left: `${i * pxPerSecond}px` }}
              />
            ))}
          </div>

          {/* Playhead Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none shadow-lg"
            style={{ left: `${playheadLeft}px` }}
          />

          {/* Clips */}
          {clips.map(clip => (
            <Clip
              key={clip.id}
              {...clip}
              pxPerSecond={pxPerSecond}
              onMove={newStartTime => onClipMove?.(clip.id, newStartTime)}
              onTrimStart={newTrimStart => onClipTrimStart?.(clip.id, newTrimStart)}
              onTrimEnd={newTrimEnd => onClipTrimEnd?.(clip.id, newTrimEnd)}
              onSelect={() => onClipSelect?.(clip.id)}
              onDelete={() => onClipDelete?.(clip.id)}
              onFadeInChange={duration => onClipFadeInChange?.(clip.id, duration)}
              onFadeOutChange={duration => onClipFadeOutChange?.(clip.id, duration)}
            />
          ))}

          {/* Empty State */}
          {clips.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs pointer-events-none">
              <div className="text-center">
                <p>No clips yet</p>
                <p className="text-gray-600">Record audio or import a file</p>
              </div>
            </div>
          )}

          {/* Recording Indicator Overlay */}
          {isRecording && (
            <div className="absolute inset-0 bg-red-500/5 border-2 border-red-500/50 pointer-events-none animate-pulse" />
          )}
        </div>
      </div>

      {/* Hint Text */}
      <div className="px-2 text-xs text-gray-600">
        💡 Drag to move • Drag edges to trim • Double-click to split • Delete key to remove • Space to play
      </div>
    </div>
  );
}
