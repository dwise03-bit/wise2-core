/**
 * Core types for the SoundLabs audio engine
 */

// Force emission of this types module for proper declaration file generation
export {};

export interface AudioDeviceInfo {
  id: string;
  name: string;
  kind: 'audioinput' | 'audiooutput' | 'audiooutput';
  groupId?: string;
}

export interface TrackConfig {
  id: string;
  name: string;
  color?: string;
  isMuted?: boolean;
  isSolo?: boolean;
  volume?: number; // 0-1
  pan?: number; // -1 to 1
  fadeIn?: number; // ms
  fadeOut?: number; // ms
}

export interface ClipConfig {
  id: string;
  trackId: string;
  startTime: number; // seconds
  duration: number; // seconds
  audioBuffer?: AudioBuffer;
  isSelected?: boolean;
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
}

export interface ProjectConfig {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number]; // [numerator, denominator]
  key?: string;
  sampleRate: number;
  duration: number; // seconds
  tracks: TrackConfig[];
  clips: ClipConfig[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number; // seconds
  duration: number; // seconds
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordedDuration: number; // seconds
}

export interface MeterReading {
  peak: number; // dB
  rms: number; // dB
  lufs: number; // LUFS (integrated loudness)
}

export interface UndoAction {
  type: string;
  payload: any;
  timestamp: number;
  description: string;
}

export interface EffectConfig {
  id: string;
  type: 'eq' | 'compressor' | 'limiter' | 'delay' | 'reverb' | 'chorus' | 'saturation';
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface BusConfig {
  id: string;
  name: string;
  color?: string;
  volume: number; // 0-1
  pan: number; // -1 to 1
  effects: EffectConfig[];
  sendTargets: string[]; // busId[]
}

export type AudioNodeProcessor = (inputBuffer: AudioBuffer, params: any) => AudioBuffer | Promise<AudioBuffer>;
