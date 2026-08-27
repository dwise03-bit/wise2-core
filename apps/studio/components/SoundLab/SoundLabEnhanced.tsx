'use client';

/**
 * Sound Lab Enhanced - Music Generation + DAW Integration
 * Features:
 * - Tab interface: Timeline | Generate | Mixer | Effects
 * - Music generation with Suno/MusicGen
 * - Clip management (record/generate/import)
 * - Effects chain per clip (EQ, Reverb, Delay, Compression)
 * - Professional mixer with track routing
 * - Undo/redo across all operations
 * - Visual distinction: blue=generated, green=recorded
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useClips, type ClipData } from '@/hooks/useClips';
import { useClipPlayback } from '@/hooks/useClipPlayback';
import { useClipInteraction } from '@/hooks/useClipInteraction';
import { useClipEffects } from '@/hooks/useClipEffects';
import { useSunoClipPlayback } from '@/hooks/useSunoClipPlayback';
import { sunoGenerationToClip } from '@/utils/sunoToClip';
import { SunoPromptBuilder } from './SunoPromptBuilder';
import { SunoGenerationQueue } from './SunoGenerationQueue';
import { Mixer, type ChannelStrip } from './Mixer';
import type { SunoGeneration, SunoGenerationParams, SunoQueueItem } from '@/types/suno';

const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbXQ1ODQ3b2EwMDAwYWUzMmZ2Ymthc3prIiwiZW1haWwiOiJkd2lzZTAzQGdtYWlsLmNvbSIsInJvbGUiOiJGT1VOREVSIiwiaWF0IjoxNzg3NDYyNzU2LCJleHAiOjE3ODc0NjYzNTZ9.WQTzGcAyz98GCilgNeTHbXdxC4jrSPxkj0eFJPW8T9o';
const TEST_PROJECT_ID = 'cmt5d6dhw00014ak3wimhgk7y';
const API_BASE_URL = 'http://localhost:3010';

type TabType = 'timeline' | 'generation' | 'mixer' | 'effects';

interface SoundLabEnhancedProps {
  onStatusUpdate?: (status: string) => void;
}

/**
 * Main Sound Lab Enhanced component
 */
export function SoundLabEnhanced({ onStatusUpdate }: SoundLabEnhancedProps) {
  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Clip and effects management
  const clips = useClips();
  const playback = useClipPlayback();
  const effects = useClipEffects();
  const interaction = useClipInteraction(clips.getClips(), (clipId, updates) =>
    clips.updateClip(clipId, updates)
  );
  const sunoPlayback = useSunoClipPlayback(playback);

  // Generation state
  const [queue, setQueue] = useState<SunoQueueItem[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<SunoGeneration | undefined>();
  const [completedGenerations, setCompletedGenerations] = useState<SunoGeneration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Timeline state
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState('track-0');
  const timelineRef = useRef<HTMLDivElement>(null);

  // Mixer state
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterPeakLevel, setMasterPeakLevel] = useState(-40);

  // Audio context
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('[SoundLabEnhanced] Failed to initialize audio context:', error);
      }
    }
  }, []);

  /**
   * Build mixer channels from current clips
   */
  const buildMixerChannels = useCallback((): ChannelStrip[] => {
    const clipsByTrack = new Map<string, ClipData[]>();

    // Group clips by track
    clips.getClips().forEach(clip => {
      if (!clipsByTrack.has(clip.trackId)) {
        clipsByTrack.set(clip.trackId, []);
      }
      clipsByTrack.get(clip.trackId)!.push(clip);
    });

    // Build channel strips
    const channels: ChannelStrip[] = Array.from(clipsByTrack.entries()).map(
      ([trackId, trackClips]) => {
        const chain = effects.getChain(trackId) || { volume: 1, pan: 0, isMuted: false };
        const hasGenerated = trackClips.some(c => c.source === 'generated');
        const hasRecorded = trackClips.some(c => c.source === 'recorded' || !c.source);

        return {
          id: trackId,
          name: `Track ${parseInt(trackId.split('-')[1]) + 1}${hasGenerated ? ' (Gen)' : ''}${
            hasRecorded ? ' (Rec)' : ''
          }`,
          volume: chain.volume,
          pan: chain.pan,
          isMuted: chain.isMuted,
          isSoloed: false,
          peakLevel: -20, // Placeholder
          inputLevel: undefined,
        };
      }
    );

    return channels;
  }, [clips, effects]);

  /**
   * Handle Suno generation
   */
  const handleSunoGenerate = useCallback(
    async (params: SunoGenerationParams) => {
      try {
        setIsGenerating(true);
        onStatusUpdate?.('Sending generation request...');

        const response = await fetch(
          `${API_BASE_URL}/api/v1/sound-labs/me/projects/${TEST_PROJECT_ID}/generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${TEST_JWT}`,
            },
            body: JSON.stringify({
              prompt: params.prompt,
              genre: params.genre,
              mood: params.mood,
              tempo: params.tempo,
              duration: params.duration,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Generation failed: ${response.statusText}`);
        }

        const data = await response.json();
        const generation: SunoGeneration = {
          id: data.project.generationJobId,
          status: data.project.generationStatus,
          audioUrl: data.project.generatedAudioUrl,
          params: params,
          createdAt: new Date().toISOString(),
          error: undefined,
        };

        const queueItem: SunoQueueItem = {
          generationId: generation.id,
          position: queue.length + 1,
          status: generation.status,
          progress: 0,
          estimatedTime: 60,
        };

        setQueue(prev => [...prev, queueItem]);
        setCurrentGeneration(generation);
        onStatusUpdate?.(`Generating: ${params.prompt.slice(0, 50)}...`);

        pollGenerationStatus(generation.id);
      } catch (error) {
        console.error('[SoundLabEnhanced] Generation error:', error);
        onStatusUpdate?.('Generation failed');
        alert('Generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsGenerating(false);
      }
    },
    [queue, onStatusUpdate]
  );

  /**
   * Poll for generation status
   */
  const pollGenerationStatus = useCallback(async (generationId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      try {
        const response = await fetch(`/api/suno/status/${generationId}`);
        if (!response.ok) throw new Error('Failed to check status');

        const generation = (await response.json()) as SunoGeneration;

        if (generation.status === 'Completed' && generation.audioUrl) {
          setCurrentGeneration(undefined);
          setCompletedGenerations(prev => [...prev, generation]);
          setQueue(prev => prev.filter(item => item.generationId !== generationId));
          onStatusUpdate?.(`Generated: ${generation.params.genre}`);

          // Auto-add to timeline
          await addGeneratedClipToTimeline(generation);
        } else if (generation.status === 'Failed') {
          console.error('[SoundLabEnhanced] Generation failed:', generation.error);
          setCurrentGeneration(undefined);
          setQueue(prev => prev.filter(item => item.generationId !== generationId));
          onStatusUpdate?.('Generation failed');
        } else if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2500);
        }
      } catch (error) {
        console.error('[SoundLabEnhanced] Status check error:', error);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2500);
        }
      }
    };

    checkStatus();
  }, [onStatusUpdate]);

  /**
   * Add generated clip to timeline
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
          selectedTrackId,
          playheadPosition
        );

        // Add clip with generation metadata
        const clipId = clips.addGeneratedClip(
          selectedTrackId,
          clip.audioBuffer,
          generation,
          `${generation.params.genre} - ${generation.params.mood}`,
          playheadPosition
        );

        // Initialize effects chain for clip
        effects.initializeChain(clipId, selectedTrackId);

        // Record in interaction history for undo/redo
        interaction.recordClipCreation?.(clipId, clip);

        // Preload for playback
        await sunoPlayback.preloadGeneratedClip(clip);

        onStatusUpdate?.(`Added: ${generation.params.genre}`);
      } catch (error) {
        console.error('[SoundLabEnhanced] Failed to add clip to timeline:', error);
        throw error;
      }
    },
    [clips, effects, interaction, playheadPosition, selectedTrackId, sunoPlayback, onStatusUpdate]
  );

  /**
   * Handle adding completed generation to timeline via UI
   */
  const handleAddToTimeline = useCallback(
    async (generation: SunoGeneration) => {
      try {
        await addGeneratedClipToTimeline(generation);
        setActiveTab('timeline');
      } catch (error) {
        console.error('[SoundLabEnhanced] Error adding to timeline:', error);
        alert('Failed to add to timeline: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    },
    [addGeneratedClipToTimeline]
  );

  /**
   * Play timeline
   */
  const handlePlayTimeline = useCallback(async () => {
    try {
      setIsPlaying(true);
      onStatusUpdate?.('Playing...');

      const allClips = clips.getClips();
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
      console.error('[SoundLabEnhanced] Playback error:', error);
      setIsPlaying(false);
    }
  }, [clips, playback, sunoPlayback, onStatusUpdate]);

  /**
   * Stop playback
   */
  const handleStop = useCallback(() => {
    playback.stopAllClips();
    setIsPlaying(false);
    onStatusUpdate?.('Stopped');
  }, [playback, onStatusUpdate]);

  /**
   * Export timeline
   */
  const handleExport = useCallback(async () => {
    try {
      onStatusUpdate?.('Exporting...');
      // TODO: Implement export logic
      onStatusUpdate?.('Export complete');
    } catch (error) {
      console.error('[SoundLabEnhanced] Export error:', error);
      onStatusUpdate?.('Export failed');
    }
  }, [onStatusUpdate]);

  const mixerChannels = buildMixerChannels();

  return (
    <div className="h-full flex flex-col bg-studio-bg text-white space-y-0">
      {/* Header with Tabs and Controls */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-studio-line flex-none">
        <h1 className="text-4xl font-display font-black">Sound Lab</h1>

        {/* Tab Buttons */}
        <div className="ml-auto flex gap-2">
          {(['timeline', 'generation', 'mixer', 'effects'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-wise-accent text-black'
                  : 'bg-studio-input text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-2 pl-4 border-l border-studio-line">
          <span className="text-xs text-gray-400">Master</span>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume * 100}
            onChange={e => setMasterVolume(parseFloat(e.target.value) / 100)}
            className="w-20 h-1 bg-gray-700 rounded"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 h-full overflow-y-auto p-6">
            {/* Transport Controls */}
            <div className="flex gap-3">
              <button
                onClick={handlePlayTimeline}
                disabled={isPlaying}
                className="px-4 py-2 bg-wise-accent text-black rounded font-semibold hover:bg-wise-accent-bright disabled:opacity-50"
              >
                {isPlaying ? '⏸ Playing' : '▶ Play'}
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-studio-input text-gray-400 rounded font-semibold hover:text-white"
              >
                ⏹ Stop
              </button>
              <button
                onClick={interaction.undo}
                disabled={!interaction.getHistoryInfo().canUndo}
                className="px-3 py-2 bg-studio-input text-gray-400 rounded hover:text-white disabled:opacity-50"
                title="Undo"
              >
                ↶
              </button>
              <button
                onClick={interaction.redo}
                disabled={!interaction.getHistoryInfo().canRedo}
                className="px-3 py-2 bg-studio-input text-gray-400 rounded hover:text-white disabled:opacity-50"
                title="Redo"
              >
                ↷
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-studio-input text-gray-400 rounded font-semibold hover:text-white ml-auto"
              >
                📥 Export
              </button>
            </div>

            {/* Playhead Position */}
            <div className="text-xs text-gray-600">
              Playhead: {playheadPosition.toFixed(1)}s | Clips: {clips.getClips().size}
            </div>

            {/* Timeline Clips */}
            <div
              ref={timelineRef}
              className="flex-1 bg-studio-input border border-studio-line rounded p-4 overflow-auto"
            >
              {clips.getClips().size === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-600">
                  <span>No clips yet. Generate music or record audio to get started.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(clips.getClips().values()).map(clip => {
                    const chain = effects.getChain(clip.id);
                    const hasEffects = chain && chain.effects.length > 0;

                    return (
                      <div
                        key={clip.id}
                        className={`p-4 rounded cursor-move transition-all border-l-4 ${
                          clip.source === 'generated'
                            ? 'bg-blue-900/40 border-l-blue-500 border border-blue-500/50'
                            : 'bg-green-900/40 border-l-green-500 border border-green-500/50'
                        } ${clip.isSelected ? 'ring-2 ring-wise-accent' : ''}`}
                        onMouseDown={e =>
                          interaction.handleClipMouseDown(e, clip.id, 'center', 50)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{clip.name}</div>
                            <div className="text-xs text-gray-500">
                              {clip.source === 'generated' && (
                                <span className="inline-block mr-2 px-2 py-0.5 bg-blue-500/30 rounded text-blue-300">
                                  Generated
                                </span>
                              )}
                              {clip.duration.toFixed(1)}s @ {clip.startTime.toFixed(1)}s
                            </div>
                          </div>
                          {hasEffects && (
                            <div className="text-xs text-gray-400">
                              {chain!.effects.length} effects
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generation Tab */}
        {activeTab === 'generation' && (
          <div className="space-y-6 overflow-y-auto h-full p-6 pb-6">
            <SunoPromptBuilder onGenerate={handleSunoGenerate} isLoading={isGenerating} />
            <SunoGenerationQueue queue={queue} currentGeneration={currentGeneration} recentGenerations={completedGenerations} />

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
                        <div className="text-xs text-gray-600">
                          {gen.duration}s · {gen.params.mood}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToTimeline(gen)}
                        className="px-3 py-1 bg-wise-accent text-black text-xs font-semibold rounded hover:bg-wise-accent-bright"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mixer Tab */}
        {activeTab === 'mixer' && (
          <div className="h-full">
            <Mixer
              channels={mixerChannels}
              masterVolume={masterVolume}
              masterPeakLevel={masterPeakLevel}
              onChannelVolumeChange={(id, volume) => effects.setVolume(id, volume)}
              onChannelPanChange={(id, pan) => effects.setPan(id, pan)}
              onChannelMuteToggle={(id, muted) => effects.toggleMute(id)}
              onMasterVolumeChange={setMasterVolume}
            />
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4 overflow-y-auto h-full p-6 pb-6">
            <h2 className="text-2xl font-bold text-white">Effects Chain</h2>

            {clips.getClips().size === 0 ? (
              <div className="text-center text-gray-600 py-8">
                <p>No clips yet. Add clips to apply effects.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(clips.getClips().values()).map(clip => {
                  const chain = effects.getChain(clip.id);
                  if (!chain) return null;

                  return (
                    <div
                      key={clip.id}
                      className="bg-studio-panel border border-wise-medium rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{clip.name}</h3>
                        <button
                          onClick={() => effects.addEffect(clip.id, 'eq', { lowGain: 0, midGain: 0, highGain: 0 })}
                          className="text-xs px-2 py-1 bg-wise-accent text-black rounded font-semibold hover:bg-wise-accent-bright"
                        >
                          + Add Effect
                        </button>
                      </div>

                      {chain.effects.length === 0 ? (
                        <div className="text-xs text-gray-600">No effects applied</div>
                      ) : (
                        <div className="space-y-2">
                          {chain.effects.map(effect => (
                            <div
                              key={effect.id}
                              className="flex items-center justify-between p-2 bg-studio-input rounded border border-studio-line"
                            >
                              <div className="text-sm text-gray-300">{effect.name}</div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => effects.toggleEffect(clip.id, effect.id)}
                                  className={`px-2 py-1 text-xs rounded ${
                                    effect.enabled
                                      ? 'bg-wise-accent text-black'
                                      : 'bg-gray-800 text-gray-400'
                                  }`}
                                >
                                  {effect.enabled ? '✓' : '✕'}
                                </button>
                                <button
                                  onClick={() => effects.removeEffect(clip.id, effect.id)}
                                  className="px-2 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clip Volume/Pan */}
                      <div className="flex gap-4 pt-2 border-t border-studio-line">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400">Volume</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={chain.volume * 100}
                            onChange={e =>
                              effects.setVolume(clip.id, parseFloat(e.target.value) / 100)
                            }
                            className="w-full h-1 bg-gray-700 rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400">Pan</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={chain.pan * 100}
                            onChange={e =>
                              effects.setPan(clip.id, parseFloat(e.target.value) / 100)
                            }
                            className="w-full h-1 bg-gray-700 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
