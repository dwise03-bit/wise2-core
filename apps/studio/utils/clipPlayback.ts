/**
 * Clip Playback Utilities
 * Handle playing clips with trim points and fades applied
 */

export interface ClipPlaybackInfo {
  audioBuffer: AudioBuffer;
  startTime: number; // when clip starts on timeline
  displayStart: number; // where to start playing (in seconds)
  displayEnd: number; // where to stop playing (in seconds)
  fadeIn: number; // fade in duration (seconds)
  fadeOut: number; // fade out duration (seconds)
}

/**
 * Create a trimmed and faded audio buffer
 * Returns new buffer with fades applied
 */
export function createTrimmedClipBuffer(
  audioContext: AudioContext,
  clip: ClipPlaybackInfo
): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const displayDuration = clip.displayEnd - clip.displayStart;
  const outputLength = Math.ceil(displayDuration * sampleRate);

  // Create output buffer
  const outputBuffer = audioContext.createBuffer(
    clip.audioBuffer.numberOfChannels,
    outputLength,
    sampleRate
  );

  // Copy and process each channel
  const startSample = Math.floor(clip.displayStart * sampleRate);
  const fadeInSamples = Math.floor(clip.fadeIn * sampleRate);
  const fadeOutSamples = Math.floor(clip.fadeOut * sampleRate);

  for (let channel = 0; channel < clip.audioBuffer.numberOfChannels; channel++) {
    const inputData = clip.audioBuffer.getChannelData(channel);
    const outputData = outputBuffer.getChannelData(channel);

    // Copy trimmed audio
    for (let i = 0; i < outputLength; i++) {
      const inputIndex = startSample + i;
      if (inputIndex < inputData.length) {
        outputData[i] = inputData[inputIndex];
      }
    }

    // Apply fade in
    if (fadeInSamples > 0) {
      for (let i = 0; i < Math.min(fadeInSamples, outputLength); i++) {
        const fadeFactor = i / fadeInSamples;
        outputData[i] *= fadeFactor;
      }
    }

    // Apply fade out
    if (fadeOutSamples > 0) {
      const fadeOutStart = outputLength - fadeOutSamples;
      for (let i = Math.max(0, fadeOutStart); i < outputLength; i++) {
        const distanceFromEnd = outputLength - i;
        const fadeFactor = distanceFromEnd / fadeOutSamples;
        outputData[i] *= fadeFactor;
      }
    }
  }

  return outputBuffer;
}

/**
 * Calculate which clips should be playing at a given time
 */
export function getActiveClips(
  clips: ClipPlaybackInfo[],
  currentTime: number,
  lookAheadTime: number = 0.1
): ClipPlaybackInfo[] {
  return clips.filter(clip => {
    const clipEndTime = clip.startTime + (clip.displayEnd - clip.displayStart);
    // Check if clip overlaps with current time + lookahead
    return currentTime <= clipEndTime && clip.startTime <= currentTime + lookAheadTime;
  });
}

/**
 * Calculate the offset within a clip for a given timeline position
 */
export function getClipPlaybackOffset(
  clip: ClipPlaybackInfo,
  currentTime: number
): number {
  const offsetFromStart = currentTime - clip.startTime;
  if (offsetFromStart < 0) return 0;

  const displayDuration = clip.displayEnd - clip.displayStart;
  if (offsetFromStart >= displayDuration) return displayDuration;

  return offsetFromStart;
}

/**
 * Determine if a clip is currently playing
 */
export function isClipPlaying(
  clip: ClipPlaybackInfo,
  currentTime: number
): boolean {
  const clipEndTime = clip.startTime + (clip.displayEnd - clip.displayStart);
  return currentTime >= clip.startTime && currentTime < clipEndTime;
}

/**
 * Get all clips that should start playing before the next audio callback
 */
export function getClipsToStart(
  clips: ClipPlaybackInfo[],
  previousTime: number,
  currentTime: number
): ClipPlaybackInfo[] {
  return clips.filter(clip => {
    // Clip starts during this callback interval
    return clip.startTime >= previousTime && clip.startTime < currentTime;
  });
}

/**
 * Get all clips that should stop playing during the callback interval
 */
export function getClipsToStop(
  clips: ClipPlaybackInfo[],
  previousTime: number,
  currentTime: number
): ClipPlaybackInfo[] {
  return clips.filter(clip => {
    const clipEndTime = clip.startTime + (clip.displayEnd - clip.displayStart);
    // Clip ends during this callback interval
    return clipEndTime > previousTime && clipEndTime <= currentTime;
  });
}

/**
 * Calculate the volume envelope for a clip at a given playback position
 * Accounts for fade in/out
 */
export function getClipVolumeEnvelope(
  clip: ClipPlaybackInfo,
  offsetInClip: number
): number {
  const displayDuration = clip.displayEnd - clip.displayStart;
  let volume = 1.0;

  // Apply fade in
  if (clip.fadeIn > 0 && offsetInClip < clip.fadeIn) {
    volume *= offsetInClip / clip.fadeIn;
  }

  // Apply fade out
  if (clip.fadeOut > 0) {
    const fadeOutStart = displayDuration - clip.fadeOut;
    if (offsetInClip > fadeOutStart) {
      const distanceFromEnd = displayDuration - offsetInClip;
      volume *= distanceFromEnd / clip.fadeOut;
    }
  }

  return Math.max(0, Math.min(1, volume));
}
