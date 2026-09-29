'use client';

/**
 * Sound Lab with Suno Integration
 * Tabbed interface for timeline editing and AI music generation
 * Supports mixing generated and recorded clips
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useClips, type ClipData } from '@/hooks/useClips';
import { useClipPlayback } from '@/hooks/useClipPlayback';
import { useClipInteraction } from '@/hooks/useClipInteraction';
import { useSunoClipPlayback } from '@/hooks/useSunoClipPlayback';
import { sunoGenerationToClip } from '@/utils/sunoToClip';
import { SunoPromptBuilder } from './SunoPromptBuilder';
import { SunoGenerationQueue } from './SunoGenerationQueue';
import type { SunoGeneration, SunoGenerationParams, SunoQueueItem } from '@/types/suno';

interface SoundLabWithSunoProps {
  // Existing Sound Lab props
  tracks?: Array<{ name: string; vol: number; mute: boolean }>;
  fx?: Array<{ name: string; amt: number }>;
  onToggleTrackMute?: (trackIndex: number) => void;
  onSetFXAmount?: (fxIndex: number, amount: number) => void;
}

type TabType = 'timeline' | 'generation';

/**
 * Main Sound Lab component with Suno integration
 */
export function SoundLabWithSuno({
  tracks = [],
  fx = [],
  onToggleTrackMute,
  onSetFXAmount,
}: SoundLabWithSunoProps) {
  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Clip management
  const clips = useClips();
  const playback = useClipPlayback();
  const interaction = useClipInteraction(
    clips.getClips(),
    (clipId, updates) => clips.updateClip(clipId, updates)
  );
  const sunoPlayback = useSunoClipPlayback(playback);

  // Generation queue state
  const [queue, setQueue] = useState<SunoQueueItem[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<SunoGeneration | undefined>();
  const [completedGenerations, setCompletedGenerations] = useState<SunoGeneration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Timeline state
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Audio context for clip conversion
  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Initialize audio context on mount
   */
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('[SoundLabWithSuno] Failed to initialize audio context:', error);
      }
    }
  }, []);

  /**
   * Handle Suno generation
   */
  const handleSunoGenerate = useCallback(
    async (params: SunoGenerationParams) => {
      try {
        setIsGenerating(true);

        // Call API to generate
        const response = await fetch('/api/suno/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Generation failed: ${response.statusText}`);
        }

        const generation = await response.json() as SunoGeneration;

        // Add to queue
        const queueItem: SunoQueueItem = {
          generationId: generation.id,
          position: queue.length + 1,
          status: generation.status,
          progress: 0,
          estimatedTime: 60, // Assume ~60 seconds
        };

        setQueue(prev => [...prev, queueItem]);
        setCurrentGeneration(generation);

        // Poll for completion
        pollGenerationStatus(generation.id);
      } catch (error) {
        console.error('[SoundLabWithSuno] Generation error:', error);
        alert('Generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsGenerating(false);
      }
    },
    [queue]
  );

  /**
   * Poll for generation status
   */
  const pollGenerationStatus = useCallback(async (generationId: string) => {
    const maxAttempts = 120; // 5 minutes with 2.5s intervals
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      try {
        const response = await fetch(`/api/suno/status/${generationId}`);
        if (!response.ok) throw new Error('Failed to check status');

        const generation = await response.json() as SunoGeneration;

        if (generation.status === 'Completed' && generation.audioUrl) {
          // Generation complete!
          setCurrentGeneration(undefined);
          setCompletedGenerations(prev => [...prev, generation]);
          setQueue(prev => prev.filter(item => item.generationId !== generationId));

          // Optionally add to timeline automatically
          await addGeneratedClipToTimeline(generation);
        } else if (generation.status === 'Failed') {
          console.error('[SoundLabWithSuno] Generation failed:', generation.error);
          setCurrentGeneration(undefined);
          setQueue(prev => prev.filter(item => item.generationId !== generationId));
        } else if (attempts < maxAttempts) {
          // Keep polling
          setTimeout(checkStatus, 2500);
        }
      } catch (error) {
        console.error('[SoundLabWithSuno] Status check error:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2500);
        }
      }
    };

    checkStatus();
  }, []);

  /**
   * Add generated clip to timeline at current playhead position
   */
  const addGeneratedClipToTimeline = useCallback(
    async (generation: SunoGeneration) => {
      if (!audioContextRef.current) {
        throw new Error('Audio context not initialized');
      }

      try {
        // Convert Suno generation to clip
        const clip = await sunoGenerationToClip(
          audioContextRef.current,
          generation,
          'track-0', // Default to first track
          playheadPosition
        );

        // Add to clips
        clips.addClip(
          clip.trackId,
          clip.audioBuffer,
          clip.name,
          clip.startTime
        );

        // Record in history for undo/redo
        interaction.recordClipCreation(clip.id, clip);

        // Preload for playback if tabs switch to timeline
        await sunoPlayback.preloadGeneratedClip(clip);
      } catch (error) {
        console.error('[SoundLabWithSuno] Failed to add clip to timeline:', error);
        throw error;
      }
    },
    [clips, interaction, playheadPosition, sunoPlayback, audioContextRef]
  );

  /**
   * Handle adding completed generation to timeline via UI button
   */
  const handleAddToTimeline = useCallback(
    async (generation: SunoGeneration) => {
      try {
        await addGeneratedClipToTimeline(generation);

        // Switch to timeline view
        setActiveTab('timeline');
      } catch (error) {
        console.error('[SoundLabWithSuno] Error adding to timeline:', error);
        alert('Failed to add to timeline: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    },
    [addGeneratedClipToTimeline]
  );

  /**
   * Play all clips in timeline
   */
  const handlePlayTimeline = useCallback(async () => {
    try {
      setIsPlaying(true);
      const allClips = clips.getClips();

      // Play all clips in their track order
      await Promise.all(
        Array.from(allClips.values()).map(clip => {
          if (clip.source === 'generated') {
            return sunoPlayback.playGeneratedClip(clip);
          } else {
            return playback.playClip(clip.id);
          }
        })
      );
    } catch (error) {
      console.error('[SoundLabWithSuno] Playback error:', error);
      setIsPlaying(false);
    }
  }, [clips, playback, sunoPlayback]);

  /**
   * Stop all playback
   */
  const handleStop = useCallback(() => {
    playback.stopAllClips();
    setIsPlaying(false);
  }, [playback]);

  return (
    <div className="h-full flex flex-col bg-studio-bg text-white space-y-4">
      {/* Header with Tabs */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-studio-line">
        <h1 className="text-4xl font-display font-black">Sound Lab</h1>

        {/* Tab Buttons */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeTab === 'timeline'
                ? 'bg-wise-accent text-black'
                : 'bg-studio-input text-gray-400 hover:text-white'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('generation')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeTab === 'generation'
                ? 'bg-wise-accent text-black'
                : 'bg-studio-input text-gray-400 hover:text-white'
            }`}
          >
            Generation
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-6">
        {activeTab === 'timeline' && (
          <div className="space-y-4 h-full overflow-y-auto">
            {/* Playback Controls */}
            <div className="flex gap-3">
              <button
                onClick={handlePlayTimeline}
                disabled={isPlaying}
                className="px-4 py-2 bg-wise-accent text-black rounded font-semibold hover:bg-wise-accent-bright disabled:opacity-50 transition"
              >
                {isPlaying ? '⏸ Playing' : '▶ Play'}
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-studio-input text-gray-400 rounded font-semibold hover:text-white transition"
              >
                ⏹ Stop
              </button>

              {/* Undo/Redo */}
              <button
                onClick={interaction.undo}
                disabled={!interaction.getHistoryInfo().canUndo}
                className="px-3 py-2 bg-studio-input text-gray-400 rounded hover:text-white disabled:opacity-50 transition"
                title="Undo (Cmd+Z)"
              >
                ↶
              </button>
              <button
                onClick={interaction.redo}
                disabled={!interaction.getHistoryInfo().canRedo}
                className="px-3 py-2 bg-studio-input text-gray-400 rounded hover:text-white disabled:opacity-50 transition"
                title="Redo (Cmd+Y)"
              >
                ↷
              </button>
            </div>

            {/* Playhead Position */}
            <div className="text-xs text-gray-600">
              Playhead: {playheadPosition.toFixed(1)}s
            </div>

            {/* Timeline Area */}
            <div
              ref={timelineRef}
              className="flex-1 bg-studio-input border border-studio-line rounded p-4 overflow-auto"
            >
              {/* Render clips on timeline */}
              {clips.getClips().size === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-600">
                  <span>No clips yet. Generate or record audio to get started.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from(clips.getClips().values()).map(clip => (
                    <div
                      key={clip.id}
                      className={`p-3 rounded cursor-move transition-all ${
                        clip.source === 'generated'
                          ? 'bg-blue-900/40 border border-blue-500/50'
                          : 'bg-green-900/40 border border-green-500/50'
                      } ${clip.isSelected ? 'ring-2 ring-wise-accent' : ''}`}
                      onMouseDown={(e) =>
                        interaction.handleClipMouseDown(e, clip.id, 'center', 50)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">{clip.name}</div>
                        <div className="text-xs text-gray-600">
                          {clip.duration.toFixed(1)}s @ {clip.startTime.toFixed(1)}s
                        </div>
                      </div>
                      {clip.source === 'generated' && (
                        <div className="text-xs text-blue-400 mt-1">Generated</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mixer Info */}
            <div className="text-xs text-gray-600">
              {clips.getClips().size} clips · {clips.getClips().size} tracks
            </div>
          </div>
        )}

        {activeTab === 'generation' && (
          <div className="space-y-6 overflow-y-auto h-full pb-6">
            {/* Prompt Builder */}
            <SunoPromptBuilder
              onGenerate={handleSunoGenerate}
              isLoading={isGenerating}
            />

            {/* Generation Queue */}
            <SunoGenerationQueue
              queue={queue}
              currentGeneration={currentGeneration}
              recentGenerations={completedGenerations}
            />

            {/* Completed Generations */}
            {completedGenerations.length > 0 && (
              <div className="bg-studio-panel border border-wise-medium rounded-xl p-6 space-y-3">
                <h3 className="text-lg font-bold text-white">Ready to Add</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {completedGenerations.map(gen => (
                    <div
                      key={gen.id}
                      className="flex items-center justify-between p-3 bg-studio-input rounded border border-wise-medium/50"
                    >
                      <div className="text-sm">
                        <div className="font-semibold text-white">{gen.params.genre}</div>
                        <div className="text-xs text-gray-600">{gen.duration}s · {gen.params.mood}</div>
                      </div>
                      <button
                        onClick={() => handleAddToTimeline(gen)}
                        className="px-3 py-1 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright transition"
                      >
                        Add to Timeline
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
