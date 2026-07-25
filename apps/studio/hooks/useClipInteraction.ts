'use client';

/**
 * Clip Interaction Hook
 * Handles dragging, trimming, and selecting clips with full mouse and keyboard support.
 * Includes grid snapping, boundary checking, undo/redo preparation, and accessibility.
 *
 * @example
 * ```tsx
 * const clipInteraction = useClipInteraction(clips, updateClip, {
 *   snapGrid: 100, // 100ms grid
 *   minClipLength: 100, // 100ms minimum
 * });
 *
 * <div
 *   onMouseDown={(e) => clipInteraction.handleClipMouseDown(e, clipId, 'center')}
 *   onMouseMove={clipInteraction.handleMouseMove}
 *   onMouseUp={clipInteraction.handleMouseUp}
 * >
 * ```
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { ClipData } from './useClips';

/**
 * Drag modes for different interaction types
 */
export type DragMode = 'move' | 'trim-start' | 'trim-end' | null;

/**
 * Position to detect drag from
 */
export type DragPosition = 'center' | 'left' | 'right';

/**
 * Configuration options for clip interaction
 */
export interface UseClipInteractionOptions {
  /** Grid snap interval in milliseconds (default: 100ms) */
  snapGrid?: number;
  /** Minimum clip length in milliseconds (default: 100ms) */
  minClipLength?: number;
  /** Maximum track duration in milliseconds (default: infinity) */
  maxTrackDuration?: number;
  /** Enable undo/redo tracking (default: true) */
  trackHistory?: boolean;
  /** Maximum undo stack depth (default: 50) */
  maxUndoDepth?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Action recorded for undo/redo
 */
interface HistoryAction {
  timestamp: number;
  clipId: string;
  type: 'move' | 'trim-start' | 'trim-end' | 'select' | 'delete' | 'create' | 'regenerate';
  before: Partial<ClipData>;
  after: Partial<ClipData>;
  metadata?: {
    source?: 'recorded' | 'generated'; // Track clip source in history
    sunoGenerationId?: string; // For tracking regenerations
  };
}

/**
 * Internal drag state
 */
interface DragState {
  isActive: boolean;
  clipId: string | null;
  mode: DragMode;
  startX: number;
  startTime: number;
  startDisplayStart: number;
  startDisplayEnd: number;
  initialOpacity: number;
  trackId: string | null;
}

/**
 * Hook for clip interaction (drag, trim, select)
 *
 * @param clips - Map of all clips
 * @param onUpdateClip - Callback when clip is updated
 * @param onMultiSelect - Callback when multiple clips are selected
 * @param options - Configuration options
 * @returns Clip interaction handlers and state
 */
export function useClipInteraction(
  clips: Map<string, ClipData>,
  onUpdateClip: (clipId: string, updates: Partial<ClipData>) => void,
  onMultiSelect?: (clipIds: string[]) => void,
  options: UseClipInteractionOptions = {}
) {
  const {
    snapGrid = 100,
    minClipLength = 100,
    maxTrackDuration = Infinity,
    trackHistory = true,
    maxUndoDepth = 50,
    debug = false,
  } = options;

  // Convert milliseconds to seconds for internal calculations
  const snapGridSeconds = snapGrid / 1000;
  const minClipLengthSeconds = minClipLength / 1000;
  const maxTrackDurationSeconds = maxTrackDuration / 1000;

  // Drag state tracking
  const dragStateRef = useRef<DragState>({
    isActive: false,
    clipId: null,
    mode: null,
    startX: 0,
    startTime: 0,
    startDisplayStart: 0,
    startDisplayEnd: 0,
    initialOpacity: 1,
    trackId: null,
  });

  // Undo/redo history
  const historyRef = useRef<HistoryAction[]>([]);
  const historyIndexRef = useRef(-1);

  // Selected clips tracking
  const [selectedClipIds, setSelectedClipIds] = useState<Set<string>>(new Set());

  // Pixels per second (scale factor for timeline)
  const pixelsPerSecondRef = useRef(50);

  log('useClipInteraction initialized', {
    snapGridSeconds,
    minClipLengthSeconds,
    maxTrackDurationSeconds,
  });

  /**
   * Debug logging utility
   */
  function log(message: string, data?: any) {
    if (debug) {
      console.log(`[useClipInteraction] ${message}`, data ?? '');
    }
  }

  /**
   * Snap a value to the grid
   */
  function snapToGrid(value: number): number {
    if (snapGridSeconds === 0) return value;
    return Math.round(value / snapGridSeconds) * snapGridSeconds;
  }

  /**
   * Record action in history for undo/redo
   */
  function recordHistory(
    clipId: string,
    type: HistoryAction['type'],
    before: Partial<ClipData>,
    after: Partial<ClipData>
  ) {
    if (!trackHistory) return;

    // Remove any actions after current index (if user undid then did something new)
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    const action: HistoryAction = {
      timestamp: Date.now(),
      clipId,
      type,
      before,
      after,
    };

    historyRef.current.push(action);
    historyIndexRef.current = historyRef.current.length - 1;

    // Trim history if it exceeds max depth
    if (historyRef.current.length > maxUndoDepth) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }

    log('History recorded', { action, depth: historyRef.current.length });
  }

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current < 0) return;

    const action = historyRef.current[historyIndexRef.current];
    if (!action) return;

    onUpdateClip(action.clipId, action.before);
    historyIndexRef.current--;
    log('Undo executed', action);
  }, [onUpdateClip]);

  /**
   * Redo the next action
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    historyIndexRef.current++;
    const action = historyRef.current[historyIndexRef.current];
    if (!action) return;

    onUpdateClip(action.clipId, action.after);
    log('Redo executed', action);
  }, [onUpdateClip]);

  /**
   * Clear history (useful after save)
   */
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    historyIndexRef.current = -1;
    log('History cleared');
  }, []);

  /**
   * Handle clip mouse down (start drag or select)
   *
   * @param event - Mouse event
   * @param clipId - ID of the clip being interacted with
   * @param position - Which part of the clip (center, left edge, right edge)
   * @param pixelsPerSecond - Scale factor for converting pixels to time
   */
  const handleClipMouseDown = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      clipId: string,
      position: DragPosition = 'center',
      pixelsPerSecond: number = 50
    ) => {
      const clip = clips.get(clipId);
      if (!clip) return;

      pixelsPerSecondRef.current = pixelsPerSecond;

      // Determine drag mode based on position
      let dragMode: DragMode = null;
      if (position === 'left') {
        dragMode = 'trim-start';
      } else if (position === 'right') {
        dragMode = 'trim-end';
      } else if (position === 'center') {
        dragMode = 'move';
      }

      // Handle selection
      if (event.button === 0) {
        // Left mouse button
        if (event.shiftKey) {
          // Shift+click for multi-select
          setSelectedClipIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clipId)) {
              newSet.delete(clipId);
            } else {
              newSet.add(clipId);
            }
            onMultiSelect?.(Array.from(newSet));
            return newSet;
          });
        } else if (event.ctrlKey || event.metaKey) {
          // Ctrl/Cmd+click to add to selection
          setSelectedClipIds(prev => {
            const newSet = new Set(prev);
            newSet.add(clipId);
            onMultiSelect?.(Array.from(newSet));
            return newSet;
          });
        } else {
          // Single click to select only this clip
          setSelectedClipIds(new Set([clipId]));
          onMultiSelect?.([clipId]);
        }

        // Handle double-click for editing
        if (event.detail === 2) {
          log('Double-click detected', { clipId });
          // Could trigger edit mode here
          return;
        }

        // Only start drag if not double-clicking
        if (event.detail === 1 && dragMode) {
          dragStateRef.current = {
            isActive: true,
            clipId,
            mode: dragMode,
            startX: event.clientX,
            startTime: clip.startTime,
            startDisplayStart: clip.displayStart,
            startDisplayEnd: clip.displayEnd,
            initialOpacity: 1,
            trackId: clip.trackId,
          };

          event.preventDefault();
          log('Drag started', {
            clipId,
            mode: dragMode,
            startX: event.clientX,
          });
        }
      }
    },
    [clips, onMultiSelect]
  );

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement> | MouseEvent) => {
      const dragState = dragStateRef.current;

      if (!dragState.isActive || !dragState.clipId || !dragState.mode) {
        return;
      }

      const clip = clips.get(dragState.clipId);
      if (!clip) return;

      const deltaX = event.clientX - dragState.startX;
      const deltaTime = deltaX / pixelsPerSecondRef.current;

      try {
        if (dragState.mode === 'move') {
          // Calculate new start time
          let newStartTime = dragState.startTime + deltaTime;

          // Snap to grid
          newStartTime = snapToGrid(newStartTime);

          // Boundary checking: can't move before 0
          newStartTime = Math.max(0, newStartTime);

          // Boundary checking: can't move past track end
          const clipEnd = newStartTime + (clip.displayEnd - clip.displayStart);
          if (clipEnd > maxTrackDurationSeconds) {
            newStartTime = maxTrackDurationSeconds - (clip.displayEnd - clip.displayStart);
          }

          // Only update if changed
          if (newStartTime !== clip.startTime) {
            // Record history before update
            recordHistory(dragState.clipId, 'move', { startTime: dragState.startTime }, { startTime: newStartTime });

            onUpdateClip(dragState.clipId, {
              startTime: newStartTime,
            });

            log('Clip moved', { clipId: dragState.clipId, newStartTime });
          }
        } else if (dragState.mode === 'trim-start') {
          // Trim start edge
          let newDisplayStart = dragState.startDisplayStart + deltaTime;

          // Constrain to valid range
          newDisplayStart = Math.max(0, newDisplayStart);
          newDisplayStart = Math.min(newDisplayStart, clip.displayEnd - minClipLengthSeconds);

          if (newDisplayStart !== clip.displayStart) {
            recordHistory(
              dragState.clipId,
              'trim-start',
              { displayStart: dragState.startDisplayStart },
              { displayStart: newDisplayStart }
            );

            onUpdateClip(dragState.clipId, {
              displayStart: newDisplayStart,
            });

            log('Clip trimmed (start)', { clipId: dragState.clipId, newDisplayStart });
          }
        } else if (dragState.mode === 'trim-end') {
          // Trim end edge
          let newDisplayEnd = dragState.startDisplayEnd + deltaTime;

          // Constrain to valid range
          newDisplayEnd = Math.min(newDisplayEnd, clip.duration);
          newDisplayEnd = Math.max(newDisplayEnd, clip.displayStart + minClipLengthSeconds);

          if (newDisplayEnd !== clip.displayEnd) {
            recordHistory(
              dragState.clipId,
              'trim-end',
              { displayEnd: dragState.startDisplayEnd },
              { displayEnd: newDisplayEnd }
            );

            onUpdateClip(dragState.clipId, {
              displayEnd: newDisplayEnd,
            });

            log('Clip trimmed (end)', { clipId: dragState.clipId, newDisplayEnd });
          }
        }
      } catch (error) {
        console.error('[useClipInteraction] Error during drag:', error);
      }
    },
    [clips, onUpdateClip, snapGridSeconds, minClipLengthSeconds, maxTrackDurationSeconds]
  );

  /**
   * Handle mouse up (end drag)
   */
  const handleMouseUp = useCallback(() => {
    if (dragStateRef.current.isActive) {
      log('Drag ended', {
        clipId: dragStateRef.current.clipId,
        mode: dragStateRef.current.mode,
      });
    }

    dragStateRef.current = {
      isActive: false,
      clipId: null,
      mode: null,
      startX: 0,
      startTime: 0,
      startDisplayStart: 0,
      startDisplayEnd: 0,
      initialOpacity: 1,
      trackId: null,
    };
  }, []);

  /**
   * Handle keyboard shortcuts for clip interaction
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (selectedClipIds.size === 0) return;

      const selectedClipId = Array.from(selectedClipIds)[0]; // Use first selected for now
      const clip = clips.get(selectedClipId);
      if (!clip) return;

      switch (event.key.toLowerCase()) {
        case 'delete':
        case 'backspace':
          event.preventDefault();
          // Signal deletion (component should handle removal via onRemoveClip)
          recordHistory(selectedClipId, 'delete', clip, {});
          log('Delete key pressed', { clipId: selectedClipId });
          break;

        case 'd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Signal duplication (component should handle via onDuplicateClip)
            recordHistory(selectedClipId, 'create', {}, clip);
            log('Duplicate key pressed', { clipId: selectedClipId });
          }
          break;

        case 'z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;

        case 'y':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            redo();
          }
          break;

        case 'arrowleft':
          event.preventDefault();
          // Move clip left by snap grid
          {
            const newStartTime = Math.max(0, clip.startTime - snapGridSeconds);
            onUpdateClip(selectedClipId, { startTime: newStartTime });
            recordHistory(selectedClipId, 'move', { startTime: clip.startTime }, { startTime: newStartTime });
          }
          break;

        case 'arrowright':
          event.preventDefault();
          // Move clip right by snap grid
          {
            const clipEnd = clip.startTime + (clip.displayEnd - clip.displayStart);
            const newStartTime = Math.min(maxTrackDurationSeconds - (clip.displayEnd - clip.displayStart), clip.startTime + snapGridSeconds);
            onUpdateClip(selectedClipId, { startTime: newStartTime });
            recordHistory(selectedClipId, 'move', { startTime: clip.startTime }, { startTime: newStartTime });
          }
          break;

        default:
          break;
      }
    },
    [selectedClipIds, clips, onUpdateClip, undo, redo, snapGridSeconds, maxTrackDurationSeconds]
  );

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleMouseUp]);

  /**
   * Get current drag state (for UI feedback)
   */
  const getDragState = useCallback(
    () => ({
      isDragging: dragStateRef.current.isActive,
      draggedClipId: dragStateRef.current.clipId,
      dragMode: dragStateRef.current.mode,
    }),
    []
  );

  /**
   * Check if a clip is selected
   */
  const isClipSelected = useCallback(
    (clipId: string) => selectedClipIds.has(clipId),
    [selectedClipIds]
  );

  /**
   * Get all selected clip IDs
   */
  const getSelectedClipIds = useCallback(() => Array.from(selectedClipIds), [selectedClipIds]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedClipIds(new Set());
    onMultiSelect?.([]);
  }, [onMultiSelect]);

  /**
   * Select a single clip
   */
  const selectClip = useCallback(
    (clipId: string) => {
      setSelectedClipIds(new Set([clipId]));
      onMultiSelect?.([clipId]);
    },
    [onMultiSelect]
  );

  /**
   * Record clip creation (useful for generated clips)
   */
  const recordClipCreation = useCallback(
    (clipId: string, clipData: Partial<ClipData>) => {
      recordHistory(
        clipId,
        'create',
        {}, // Before: empty (clip didn't exist)
        clipData // After: the created clip data
      );
    },
    []
  );

  /**
   * Record clip deletion
   */
  const recordClipDeletion = useCallback(
    (clipId: string, clipData: Partial<ClipData>) => {
      recordHistory(
        clipId,
        'delete',
        clipData, // Before: the deleted clip data
        {} // After: empty (clip no longer exists)
      );
    },
    []
  );

  /**
   * Record regeneration of a clip (for Suno regenerations)
   */
  const recordRegeneration = useCallback(
    (clipId: string, oldParams: Partial<ClipData>, newParams: Partial<ClipData>) => {
      recordHistory(
        clipId,
        'regenerate',
        oldParams,
        newParams
      );
    },
    []
  );

  /**
   * Get history info for debugging/UI
   */
  const getHistoryInfo = useCallback(
    () => ({
      canUndo: historyIndexRef.current >= 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
      historyLength: historyRef.current.length,
      currentIndex: historyIndexRef.current,
    }),
    []
  );

  /**
   * Set pixels per second (call this if timeline scale changes)
   */
  const setPixelsPerSecond = useCallback((pps: number) => {
    pixelsPerSecondRef.current = pps;
  }, []);

  return {
    // Event handlers
    handleClipMouseDown,
    handleMouseMove,
    handleMouseUp,

    // State getters
    isDragging: dragStateRef.current.isActive,
    draggedClipId: dragStateRef.current.clipId,
    dragMode: dragStateRef.current.mode,
    getDragState,

    // Selection
    selectedClipIds: getSelectedClipIds(),
    isClipSelected,
    selectClip,
    clearSelection,

    // History
    undo,
    redo,
    clearHistory,
    recordClipCreation,
    recordClipDeletion,
    recordRegeneration,
    getHistoryInfo,

    // Configuration
    setPixelsPerSecond,
  };
}
