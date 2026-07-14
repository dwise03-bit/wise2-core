/**
 * Playback engine - handles timeline playback, scrubbing, and looping
 */

import { AudioContextManager } from './AudioContextManager';
import { Track } from './Track';
import { PlaybackState } from './types';

interface PlaybackConfig {
  bpm?: number;
  loopStart?: number;
  loopEnd?: number;
  isLooping?: boolean;
}

export class Playback {
  private audioContext: AudioContext;
  private tracks: Map<string, Track> = new Map();
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private duration: number = 0;
  private bpm: number = 120;
  private loopStart: number = 0;
  private loopEnd: number = Infinity;
  private isLooping: boolean = false;
  private playbackRateNode: GainNode | null = null;
  private activeSourceNodes: Set<AudioBufferSourceNode> = new Set();
  private animationFrameId: number = 0;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: PlaybackConfig = {}) {
    this.audioContext = AudioContextManager.getInstance().getContext();
    this.bpm = config.bpm || 120;
    this.loopStart = config.loopStart || 0;
    this.loopEnd = config.loopEnd || Infinity;
    this.isLooping = config.isLooping || false;
  }

  /**
   * Register track for playback
   */
  registerTrack(track: Track): void {
    this.tracks.set(track.getId(), track);
  }

  /**
   * Unregister track
   */
  unregisterTrack(trackId: string): void {
    this.tracks.delete(trackId);
  }

  /**
   * Set project duration
   */
  setDuration(duration: number): void {
    this.duration = duration;
    this.emit('durationChanged', duration);
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): PlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
    };
  }

  /**
   * Start playback
   */
  play(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime - this.currentTime;
    this.beginPlaybackLoop();

    this.emit('started');
  }

  /**
   * Stop playback and reset position to start
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.stopAllSources();
    this.isPlaying = false;
    this.currentTime = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.emit('stopped');
  }

  /**
   * Pause playback without resetting position
   */
  pause(): void {
    if (!this.isPlaying) return;

    this.stopAllSources();
    this.isPlaying = false;
    this.pauseTime = this.audioContext.currentTime;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.emit('paused');
  }

  /**
   * Resume from pause
   */
  resume(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime - this.currentTime;
    this.beginPlaybackLoop();

    this.emit('resumed');
  }

  /**
   * Seek to specific time
   */
  seek(time: number): void {
    // Handle looping
    if (this.isLooping && time > this.loopEnd) {
      this.currentTime = this.loopStart + ((time - this.loopStart) % (this.loopEnd - this.loopStart));
    } else {
      this.currentTime = Math.max(0, Math.min(time, this.duration));
    }

    if (this.isPlaying) {
      this.stopAllSources();
      this.startTime = this.audioContext.currentTime - this.currentTime;
      this.schedulePlayback();
    }

    this.emit('seeked', this.currentTime);
  }

  /**
   * Set BPM
   */
  setBPM(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm));
    this.emit('bpmChanged', this.bpm);
  }

  /**
   * Get BPM
   */
  getBPM(): number {
    return this.bpm;
  }

  /**
   * Convert BPM to milliseconds per beat
   */
  getBeatDuration(): number {
    return (60 / this.bpm) * 1000;
  }

  /**
   * Enable/disable looping
   */
  setLooping(enabled: boolean, start?: number, end?: number): void {
    this.isLooping = enabled;
    if (start !== undefined) this.loopStart = start;
    if (end !== undefined) this.loopEnd = end;

    this.emit('loopingChanged', { enabled: this.isLooping, start: this.loopStart, end: this.loopEnd });
  }

  /**
   * Begin playback loop (RAF-based)
   */
  private beginPlaybackLoop(): void {
    const loop = () => {
      if (this.isPlaying) {
        this.updatePlayhead();
        this.schedulePlayback();
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Update current time
   */
  private updatePlayhead(): void {
    const elapsed = this.audioContext.currentTime - this.startTime;

    if (this.isLooping && elapsed > this.loopEnd) {
      const loopDuration = this.loopEnd - this.loopStart;
      const loopsCompleted = Math.floor((elapsed - this.loopStart) / loopDuration);
      this.currentTime = this.loopStart + (elapsed - this.loopStart - loopsCompleted * loopDuration);
    } else if (elapsed > this.duration) {
      this.stop();
      return;
    } else {
      this.currentTime = elapsed;
    }

    this.emit('timeUpdated', this.currentTime);
  }

  /**
   * Schedule audio playback for all clips at current time
   * In a real implementation, this would use Web Audio API scheduling
   */
  private schedulePlayback(): void {
    const bufferDuration = 0.5; // 500ms lookahead buffer

    this.tracks.forEach((track, trackId) => {
      // Get all clips for this track and play those within our time window
      // This is simplified - real implementation would use Web Audio's timing
    });
  }

  /**
   * Play a single audio buffer
   */
  playBuffer(buffer: AudioBuffer, track: Track): void {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(track.getInputNode());
    source.start(0);

    this.activeSourceNodes.add(source);

    source.onended = () => {
      this.activeSourceNodes.delete(source);
    };
  }

  /**
   * Stop all playing sources
   */
  private stopAllSources(): void {
    this.activeSourceNodes.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeSourceNodes.clear();
  }

  /**
   * Get current time in seconds
   */
  getCurrentTime(): number {
    if (!this.isPlaying) return this.currentTime;
    return this.audioContext.currentTime - this.startTime;
  }

  /**
   * Get current time in milliseconds
   */
  getCurrentTimeMs(): number {
    return this.getCurrentTime() * 1000;
  }

  /**
   * Convert time to bar.beat.tick format
   */
  timeToBarBeatTick(time: number, timeSignature: [number, number] = [4, 4]): [number, number, number] {
    const beatDuration = this.getBeatDuration() / 1000;
    const beatsPerBar = timeSignature[0];
    const beatDurationInSeconds = (60 / this.bpm);

    const totalBeats = time / beatDurationInSeconds;
    const bars = Math.floor(totalBeats / beatsPerBar);
    const beats = Math.floor(totalBeats % beatsPerBar);
    const ticks = Math.round((totalBeats % 1) * 480);

    return [bars + 1, beats + 1, ticks];
  }

  /**
   * Convert bar.beat.tick to time in seconds
   */
  barBeatTickToTime(bar: number, beat: number, tick: number, timeSignature: [number, number] = [4, 4]): number {
    const beatDurationInSeconds = 60 / this.bpm;
    const beatsPerBar = timeSignature[0];

    const totalBeats = (bar - 1) * beatsPerBar + (beat - 1) + tick / 480;
    return totalBeats * beatDurationInSeconds;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stop();
    this.tracks.clear();
    this.activeSourceNodes.clear();
    this.emit('cleaned');
  }

  /**
   * Event emitter
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.delete(callback);
  }

  private emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach(callback => callback(data));
  }
}
