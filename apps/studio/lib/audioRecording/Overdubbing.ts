/**
 * Overdubbing.ts
 *
 * Multi-track overdubbing system with punch in/out, track management,
 * and undo history for individual recordings.
 *
 * @module audioRecording/Overdubbing
 */

export interface Track {
  id: string;
  name: string;
  audioBuffer: AudioBuffer;
  enabled: boolean;
  volume: number;
  muted: boolean;
  pan: number; // -1 (left) to +1 (right)
}

export interface RecordingUndoState {
  trackId: string;
  recordingData: AudioBuffer;
  timestamp: number;
}

export interface PunchInOutMarkers {
  startTime: number;  // Seconds
  endTime: number;    // Seconds
  enabled: boolean;
}

/**
 * OverdubbingSystem - Multi-track recording with punch in/out
 *
 * Manages:
 * - Multiple audio tracks with individual volume/pan/mute
 * - Punch in/out recording (replace section of track)
 * - Per-track undo history
 * - Track mixing and playback
 */
export class OverdubbingSystem {
  private audioContext: AudioContext;
  private tracks: Map<string, Track> = new Map();
  private playbackSource: AudioBufferSourceNode | null = null;
  private mainGain: GainNode;
  private masterVolume: number = 1;
  private isPlaying: boolean = false;
  private playbackTime: number = 0;
  private punchInOut: PunchInOutMarkers | null = null;

  // Undo history per track
  private undoHistory: Map<string, RecordingUndoState[]> = new Map();
  private undoIndex: Map<string, number> = new Map();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    // Create master gain node
    this.mainGain = audioContext.createGain();
    this.mainGain.connect(audioContext.destination);
    this.mainGain.gain.value = this.masterVolume;
  }

  /**
   * Create a new track
   */
  createTrack(
    name: string,
    audioBuffer: AudioBuffer
  ): string {
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const track: Track = {
      id: trackId,
      name,
      audioBuffer,
      enabled: true,
      volume: 1,
      muted: false,
      pan: 0,
    };

    this.tracks.set(trackId, track);
    this.undoHistory.set(trackId, []);
    this.undoIndex.set(trackId, -1);

    console.log(`Track created: ${trackId} (${name})`);

    return trackId;
  }

  /**
   * Record to a track (replace entire track or section with punch in/out)
   */
  recordToTrack(
    trackId: string,
    recordedBuffer: AudioBuffer,
    options?: {
      punchInStart?: number;  // Seconds - if set, replace only this section
      punchInEnd?: number;    // Seconds
    }
  ): boolean {
    const track = this.tracks.get(trackId);
    if (!track) {
      console.error(`Track not found: ${trackId}`);
      return false;
    }

    // Save current state to undo history
    const currentUndoStack = this.undoHistory.get(trackId) || [];
    const currentIndex = this.undoIndex.get(trackId) ?? -1;

    // Remove any redo states if we're adding new history
    if (currentIndex < currentUndoStack.length - 1) {
      currentUndoStack.splice(currentIndex + 1);
    }

    currentUndoStack.push({
      trackId,
      recordingData: track.audioBuffer,
      timestamp: Date.now(),
    });

    this.undoHistory.set(trackId, currentUndoStack);
    this.undoIndex.set(trackId, currentUndoStack.length - 1);

    // Apply recording
    if (!options?.punchInStart) {
      // Replace entire track
      track.audioBuffer = recordedBuffer;
      console.log(`Track replaced: ${trackId}`);
    } else {
      // Punch in/out - replace section
      const start = Math.floor((options.punchInStart || 0) * recordedBuffer.sampleRate);
      const end = Math.floor((options.punchInEnd || recordedBuffer.duration) * recordedBuffer.sampleRate);

      // Get source channel data
      const sourceChannel = recordedBuffer.getChannelData(0);

      // Replace section in track
      for (let ch = 0; ch < track.audioBuffer.numberOfChannels; ch++) {
        const trackData = track.audioBuffer.getChannelData(ch);
        const sourceData = ch < recordedBuffer.numberOfChannels
          ? recordedBuffer.getChannelData(ch)
          : sourceChannel;

        for (let i = start; i < Math.min(end, trackData.length); i++) {
          const sourceIndex = i - start;
          if (sourceIndex < sourceData.length) {
            trackData[i] = sourceData[sourceIndex];
          }
        }
      }

      console.log(
        `Punch in/out recorded: ${trackId} (${options.punchInStart.toFixed(2)}s - ${options.punchInEnd?.toFixed(2)}s)`
      );
    }

    return true;
  }

  /**
   * Undo last recording for a track
   */
  undoRecording(trackId: string): boolean {
    const track = this.tracks.get(trackId);
    if (!track) {
      console.error(`Track not found: ${trackId}`);
      return false;
    }

    const undoStack = this.undoHistory.get(trackId) || [];
    const currentIndex = this.undoIndex.get(trackId) ?? -1;

    // Check if we can undo (must have previous state)
    if (currentIndex <= 0) {
      console.warn(`Nothing to undo for track: ${trackId}`);
      return false;
    }

    // Move to previous state
    const previousIndex = currentIndex - 1;
    const previousState = undoStack[previousIndex];

    track.audioBuffer = previousState.recordingData;
    this.undoIndex.set(trackId, previousIndex);

    console.log(`Undo successful for track: ${trackId}`);
    return true;
  }

  /**
   * Redo last undone recording for a track
   */
  redoRecording(trackId: string): boolean {
    const track = this.tracks.get(trackId);
    if (!track) {
      console.error(`Track not found: ${trackId}`);
      return false;
    }

    const undoStack = this.undoHistory.get(trackId) || [];
    const currentIndex = this.undoIndex.get(trackId) ?? -1;

    // Check if we can redo
    if (currentIndex >= undoStack.length - 1) {
      console.warn(`Nothing to redo for track: ${trackId}`);
      return false;
    }

    // Move to next state
    const nextIndex = currentIndex + 1;
    const nextState = undoStack[nextIndex];

    track.audioBuffer = nextState.recordingData;
    this.undoIndex.set(trackId, nextIndex);

    console.log(`Redo successful for track: ${trackId}`);
    return true;
  }

  /**
   * Punch in/out markers for recording
   */
  setPunchInOut(startTime: number, endTime: number): void {
    this.punchInOut = {
      startTime,
      endTime,
      enabled: true,
    };
    console.log(`Punch in/out set: ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
  }

  /**
   * Disable punch in/out
   */
  disablePunchInOut(): void {
    if (this.punchInOut) {
      this.punchInOut.enabled = false;
    }
  }

  /**
   * Get current punch in/out markers
   */
  getPunchInOut(): PunchInOutMarkers | null {
    return this.punchInOut && this.punchInOut.enabled ? this.punchInOut : null;
  }

  /**
   * Play all enabled tracks
   */
  play(startTime: number = 0): void {
    if (this.isPlaying) {
      console.warn('Already playing');
      return;
    }

    this.isPlaying = true;
    this.playbackTime = startTime;

    // Create gain nodes and sources for each enabled track
    const sources: AudioBufferSourceNode[] = [];

    Array.from(this.tracks.values()).forEach((track) => {
      if (!track.enabled || !track.audioBuffer) return;

      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = track.audioBuffer;

      // Create track-specific gain nodes for volume and pan
      const trackGain = this.audioContext.createGain();
      trackGain.gain.value = track.muted ? 0 : track.volume;

      const panner = this.audioContext.createStereoPanner();
      panner.pan.value = track.pan;

      // Connect: source -> gain -> panner -> main
      source.connect(trackGain);
      trackGain.connect(panner);
      panner.connect(this.mainGain);

      // Start playback
      source.start(0, startTime);
      sources.push(source);

      // Stop on end
      source.onended = () => {
        this.isPlaying = false;
        console.log('Playback finished');
      };
    });

    this.playbackSource = sources[0] || null;
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (!this.isPlaying) {
      return;
    }

    this.isPlaying = false;
    this.playbackTime = 0;

    // Stop all sources
    if (this.playbackSource) {
      this.playbackSource.stop();
      this.playbackSource.disconnect();
      this.playbackSource = null;
    }

    console.log('Playback stopped');
  }

  /**
   * Get or update track properties
   */
  getTrack(trackId: string): Track | undefined {
    return this.tracks.get(trackId);
  }

  /**
   * Update track volume
   */
  setTrackVolume(trackId: string, volume: number): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    track.volume = Math.max(0, Math.min(1, volume));
    return true;
  }

  /**
   * Update track pan
   */
  setTrackPan(trackId: string, pan: number): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    track.pan = Math.max(-1, Math.min(1, pan));
    return true;
  }

  /**
   * Mute/unmute track
   */
  setTrackMuted(trackId: string, muted: boolean): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    track.muted = muted;
    return true;
  }

  /**
   * Enable/disable track
   */
  setTrackEnabled(trackId: string, enabled: boolean): boolean {
    const track = this.tracks.get(trackId);
    if (!track) return false;

    track.enabled = enabled;
    return true;
  }

  /**
   * Delete track
   */
  deleteTrack(trackId: string): boolean {
    const deleted = this.tracks.delete(trackId);
    if (deleted) {
      this.undoHistory.delete(trackId);
      this.undoIndex.delete(trackId);
      console.log(`Track deleted: ${trackId}`);
    }
    return deleted;
  }

  /**
   * Get all tracks
   */
  getTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Mix all tracks down to stereo
   */
  mixDown(): AudioBuffer {
    // Create stereo output buffer
    const mixBuffer = this.audioContext.createBuffer(
      2,
      Math.max(...Array.from(this.tracks.values()).map((t) => t.audioBuffer.length)),
      this.audioContext.sampleRate
    );

    const leftData = mixBuffer.getChannelData(0);
    const rightData = mixBuffer.getChannelData(1);

    // Mix all tracks
    Array.from(this.tracks.values()).forEach((track) => {
      if (!track.enabled || track.muted) return;

      const trackData = track.audioBuffer.getChannelData(0);
      const panAmount = (track.pan + 1) / 2; // Convert -1..1 to 0..1

      for (let i = 0; i < trackData.length; i++) {
        const sample = trackData[i] * track.volume;
        leftData[i] += sample * (1 - panAmount);
        rightData[i] += sample * panAmount;
      }
    });

    // Normalize to prevent clipping
    const leftArray = Array.from(leftData);
    const rightArray = Array.from(rightData);
    const maxSample = Math.max(...leftArray, ...rightArray);
    if (maxSample > 1) {
      const scale = 1 / maxSample;
      for (let i = 0; i < leftData.length; i++) {
        leftData[i] *= scale;
        rightData[i] *= scale;
      }
    }

    console.log('Mix down complete');
    return mixBuffer;
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.mainGain.gain.value = this.masterVolume;
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.mainGain.disconnect();
    this.tracks.clear();
    this.undoHistory.clear();
    console.log('OverdubbingSystem disposed');
  }
}
