'use client';

/**
 * ClipTrack Component
 * Renders audio clips on a timeline canvas with waveform visualization
 *
 * Features:
 * - Multiple clips with waveform previews
 * - Zoom support (10-200px per second)
 * - Virtualization for performance
 * - Waveform caching
 * - Color coding by track/status
 * - Smooth 60 FPS scrolling
 *
 * @component
 * @example
 * ```tsx
 * <ClipTrack
 *   clips={clips}
 *   pxPerSecond={50}
 *   height={120}
 *   onClipSelect={(clipId) => console.log(clipId)}
 *   selectedClipId={selected}
 * />
 * ```
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  CSSProperties,
} from 'react';
import type { ClipData } from '../../hooks/useClips';
import { generateWaveform } from '../../utils/waveformGenerator';

/**
 * Props for ClipTrack component
 */
interface ClipTrackProps {
  /** Array of clips to render */
  clips: ClipData[];

  /** Pixels per second (zoom level: 10-200) */
  pxPerSecond: number;

  /** Height of the track in pixels (default: 120) */
  height?: number;

  /** Callback when clip is selected */
  onClipSelect?: (clipId: string) => void;

  /** ID of currently selected clip */
  selectedClipId?: string;

  /** Optional CSS class name */
  className?: string;

  /** Optional style overrides */
  style?: CSSProperties;
}

/**
 * Cached waveform data for performance
 */
interface WaveformCache {
  pixelData: Uint8ClampedArray;
  width: number;
  height: number;
  peaks: number[];
}

/**
 * Clip metadata for rendering
 */
interface RenderedClip {
  clip: ClipData;
  left: number;
  width: number;
  displayWidth: number;
}

/**
 * ClipTrack Component
 *
 * Renders a horizontal timeline of audio clips with:
 * - Waveform visualization via canvas
 * - Zoom and scroll support
 * - Selection highlighting with green accent
 * - Efficient virtualization for performance
 * - Waveform caching to avoid recomputation
 *
 * The component uses a scrollable container with clips positioned absolutely.
 * Only visible clips render waveforms to optimize performance.
 */
export function ClipTrack({
  clips,
  pxPerSecond,
  height = 120,
  onClipSelect,
  selectedClipId,
  className = '',
  style,
}: ClipTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const waveformCache = useRef<Map<string, WaveformCache>>(new Map());

  // State for viewport
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Clamp zoom level
  const clampedPxPerSecond = Math.max(10, Math.min(200, pxPerSecond));

  /**
   * Calculate which clips are visible based on scroll position
   */
  const visibleClips = useMemo(() => {
    const viewportStart = scrollLeft;
    const viewportEnd = scrollLeft + containerWidth;
    const padding = containerWidth; // Load clips outside viewport

    return clips.filter(clip => {
      const clipStart = clip.startTime * clampedPxPerSecond;
      const clipEnd = (clip.startTime + (clip.displayEnd - clip.displayStart)) * clampedPxPerSecond;

      return clipEnd + padding > viewportStart && clipStart - padding < viewportEnd;
    });
  }, [clips, scrollLeft, containerWidth, clampedPxPerSecond]);

  /**
   * Calculate rendered clip positions and dimensions
   */
  const renderedClips: RenderedClip[] = useMemo(() => {
    return visibleClips.map(clip => {
      const displayDuration = clip.displayEnd - clip.displayStart;
      const displayWidth = displayDuration * clampedPxPerSecond;
      const left = clip.startTime * clampedPxPerSecond;

      return {
        clip,
        left,
        width: displayWidth,
        displayWidth,
      };
    });
  }, [visibleClips, clampedPxPerSecond]);

  /**
   * Generate or retrieve cached waveform
   */
  const getWaveformData = useCallback(
    (clipId: string, audioBuffer: AudioBuffer, canvasWidth: number): WaveformCache => {
      const cacheKey = `${clipId}-${canvasWidth}`;

      // Check cache
      if (waveformCache.current.has(cacheKey)) {
        return waveformCache.current.get(cacheKey)!;
      }

      // Generate waveform
      const waveformData = generateWaveform(audioBuffer, {
        width: Math.max(1, canvasWidth),
        height: height - 12, // Account for padding/border
        color: '#22c55e', // Green from design system
        backgroundColor: '#0f1419', // Dark background
        channelMode: 'mono',
      });

      waveformCache.current.set(cacheKey, waveformData);

      // Limit cache size (keep 50 most recent)
      if (waveformCache.current.size > 50) {
        const firstKey = waveformCache.current.keys().next().value;
        waveformCache.current.delete(firstKey);
      }

      return waveformData;
    },
    [height]
  );

  /**
   * Render waveform to canvas element
   */
  const renderWaveform = useCallback(
    (canvas: HTMLCanvasElement, clipId: string, audioBuffer: AudioBuffer, isSelected: boolean) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const waveformData = getWaveformData(
        clipId,
        audioBuffer,
        canvas.width
      );

      // Clear canvas
      ctx.fillStyle = isSelected ? '#1a3a2a' : '#0f1419';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      const imageData = ctx.createImageData(waveformData.width, waveformData.height);
      imageData.data.set(waveformData.pixelData);
      ctx.putImageData(imageData, 0, 0);

      // Draw selection border
      if (isSelected) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }
    },
    [getWaveformData]
  );

  /**
   * Update canvas when it mounts or updates
   */
  const updateCanvasRefs = useCallback(
    (clipsToRender: RenderedClip[]) => {
      for (const renderedClip of clipsToRender) {
        const canvas = canvasRefs.current.get(renderedClip.clip.id);
        if (canvas) {
          canvas.width = Math.max(4, renderedClip.width);
          canvas.height = height - 12;
          renderWaveform(
            canvas,
            renderedClip.clip.id,
            renderedClip.clip.audioBuffer,
            renderedClip.clip.id === selectedClipId
          );
        }
      }
    },
    [height, selectedClipId, renderWaveform]
  );

  /**
   * Update canvas when clips change
   */
  useEffect(() => {
    updateCanvasRefs(renderedClips);
  }, [renderedClips, updateCanvasRefs]);

  /**
   * Handle scroll event with passive listener
   */
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollLeft(target.scrollLeft);
  }, []);

  /**
   * Handle window resize to track viewport width
   */
  useEffect(() => {
    const updateWidth = () => {
      if (scrollRef.current) {
        setContainerWidth(scrollRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  /**
   * Handle click on clip for selection
   */
  const handleClipClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, clipId: string) => {
      e.stopPropagation();
      onClipSelect?.(clipId);
    },
    [onClipSelect]
  );

  /**
   * Format duration for display
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return mins > 0 ? `${mins}:${secs}` : `${secs}s`;
  };

  // Calculate total timeline width
  const timelineWidth = clips.length > 0
    ? Math.max(
        containerWidth,
        (Math.max(...clips.map(c => c.startTime + (c.displayEnd - c.displayStart))) * clampedPxPerSecond)
      )
    : containerWidth;

  return (
    <div
      ref={containerRef}
      className={`relative w-full border border-gray-700 rounded-lg overflow-hidden bg-gray-950 ${className}`}
      style={{
        height: `${height}px`,
        ...style,
      }}
    >
      {/* Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="relative w-full h-full overflow-x-auto overflow-y-hidden"
        onScroll={handleScroll}
      >
        {/* Timeline Content Container */}
        <div
          className="relative h-full bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900"
          style={{
            width: `${timelineWidth}px`,
            minWidth: '100%',
          }}
        >
          {/* Grid Lines (every second) */}
          {clampedPxPerSecond >= 20 && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({
                length: Math.ceil(timelineWidth / clampedPxPerSecond),
              }).map((_, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-800/20"
                  style={{
                    left: `${i * clampedPxPerSecond}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Rendered Clips */}
          {renderedClips.map(renderedClip => {
            const { clip, left, width } = renderedClip;
            const isSelected = clip.id === selectedClipId;
            const displayDuration = clip.displayEnd - clip.displayStart;

            return (
              <div
                key={clip.id}
                className={`absolute top-1.5 h-[calc(100%-12px)] rounded border-2 transition-colors cursor-pointer group ${
                  isSelected
                    ? 'border-green-500 shadow-lg shadow-green-500/40 z-20'
                    : 'border-cyan-600/60 hover:border-cyan-500 z-10'
                }`}
                style={{
                  left: `${left}px`,
                  width: `${Math.max(4, width)}px`,
                  minWidth: '40px',
                }}
                onClick={e => handleClipClick(e, clip.id)}
                role="button"
                tabIndex={0}
                title={`${clip.name} • ${formatDuration(displayDuration)}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClipClick(e as any, clip.id);
                  }
                }}
              >
                {/* Waveform Canvas */}
                <canvas
                  ref={el => {
                    if (el) {
                      canvasRefs.current.set(clip.id, el);
                    }
                  }}
                  className="absolute inset-0 rounded w-full h-full"
                  style={{
                    pointerEvents: 'none',
                  }}
                />

                {/* Clip Info Label */}
                {width > 60 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-semibold text-white drop-shadow truncate px-1 bg-black/50 rounded select-none">
                      {clip.name}
                    </span>
                  </div>
                )}

                {/* Duration Badge */}
                {width > 80 && (
                  <div className="absolute bottom-0.5 right-0.5 text-xs text-cyan-300 drop-shadow bg-black/60 px-1.5 py-0.5 rounded">
                    {formatDuration(displayDuration)}
                  </div>
                )}

                {/* Fade In Indicator */}
                {clip.fadeIn > 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500/30 to-transparent pointer-events-none"
                    style={{
                      width: `${clip.fadeIn * clampedPxPerSecond}px`,
                    }}
                  />
                )}

                {/* Fade Out Indicator */}
                {clip.fadeOut > 0 && (
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-red-500/30 to-transparent pointer-events-none"
                    style={{
                      width: `${clip.fadeOut * clampedPxPerSecond}px`,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {clips.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm pointer-events-none">
              <div className="text-center">
                <p className="font-medium">No clips on this track</p>
                <p className="text-xs text-gray-600">Add audio to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Indicator */}
      <div className="absolute top-1 right-2 text-xs text-gray-500 pointer-events-none bg-black/30 px-2 py-1 rounded">
        {clampedPxPerSecond}px/s
      </div>
    </div>
  );
}

export type { ClipTrackProps };
