/**
 * Convert Suno Generation to Clip Data
 * Handles fetching audio from S3/CDN and converting to AudioBuffer
 */

import type { SunoGeneration } from '../types/suno';
import type { ClipData } from '../hooks/useClips';

export interface GeneratedClipMetadata {
  sunoGenerationId: string;
  sunoParams: SunoGeneration['params'];
  audioUrl: string;
  waveformData?: number[];
}

/**
 * Convert a Suno generation to ClipData
 * Fetches audio from the URL and creates an AudioBuffer
 */
export async function sunoGenerationToClip(
  audioContext: AudioContext,
  sunoGeneration: SunoGeneration,
  trackId: string,
  startTime: number = 0
): Promise<ClipData> {
  if (!sunoGeneration.audioUrl) {
    throw new Error('No audio URL available for Suno generation');
  }

  try {
    // Fetch audio from URL
    const response = await fetch(sunoGeneration.audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Generate clip ID
    const clipId = `clip-suno-${sunoGeneration.id}-${Date.now()}`;

    // Create clip data with source tracking
    const clip: ClipData = {
      id: clipId,
      trackId,
      name: `Suno - ${sunoGeneration.params.genre} (${sunoGeneration.params.mood})`,
      audioBuffer,
      startTime,
      duration: audioBuffer.duration,
      displayStart: 0,
      displayEnd: audioBuffer.duration,
      fadeIn: 0.05, // Default fade in
      fadeOut: 0.05, // Default fade out
      isSelected: false,
      source: 'generated',
      sunoGenerationId: sunoGeneration.id,
      sunoMetadata: {
        sunoGenerationId: sunoGeneration.id,
        sunoParams: sunoGeneration.params,
        audioUrl: sunoGeneration.audioUrl,
        waveformData: sunoGeneration.waveformData,
      },
      isLocked: false,
    };

    return clip;
  } catch (error) {
    console.error('[sunoToClip] Error converting Suno generation to clip:', error);
    throw error;
  }
}

/**
 * Batch convert multiple Suno generations to clips
 */
export async function sunoGenerationsToclips(
  audioContext: AudioContext,
  generations: SunoGeneration[],
  trackId: string,
  startTime: number = 0,
  spacing: number = 0.5 // Time between clips in seconds
): Promise<ClipData[]> {
  const clips: ClipData[] = [];
  let currentStartTime = startTime;

  for (const generation of generations) {
    try {
      const clip = await sunoGenerationToClip(
        audioContext,
        generation,
        trackId,
        currentStartTime
      );
      clips.push(clip);
      currentStartTime += clip.duration + spacing;
    } catch (error) {
      console.error(`[sunoToClips] Failed to convert generation ${generation.id}:`, error);
      // Continue with next generation
    }
  }

  return clips;
}

/**
 * Create a temporary placeholder clip while generation is pending
 * Useful for showing in timeline before audio is ready
 */
export function createPendingClip(
  generationId: string,
  trackId: string,
  startTime: number = 0,
  estimatedDuration: number = 30
): Partial<ClipData> {
  return {
    id: `clip-pending-${generationId}`,
    trackId,
    name: 'Generating...',
    startTime,
    duration: estimatedDuration,
    displayStart: 0,
    displayEnd: estimatedDuration,
    fadeIn: 0,
    fadeOut: 0,
    isSelected: false,
    source: 'generated',
    sunoGenerationId: generationId,
    isLocked: true, // Lock pending clips
  };
}
