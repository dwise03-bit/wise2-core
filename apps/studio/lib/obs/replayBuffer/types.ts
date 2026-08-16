/**
 * Replay Buffer Type Definitions
 */

export interface ReplayBufferConfig {
  maxDurationSeconds: number; // 10-60, default 30
  maxBufferSize: number; // bytes
  videoCodec: 'h264' | 'vp8' | 'vp9';
  audioCodec: 'aac' | 'opus';
  outputFormat: 'mp4' | 'webm' | 'mkv';
  videoBitrate?: number; // kbps
  audioBitrate?: number; // kbps
  resolution?: string; // e.g., "1920x1080"
  frameRate?: number; // fps
}

export interface ReplayFrame {
  data: Uint8Array; // video frame data
  timestamp: number; // Unix timestamp in ms
  keyFrame: boolean; // Is this a keyframe?
  duration: number; // Frame duration in ms
}

export interface ReplayAudioChunk {
  data: Float32Array;
  timestamp: number;
  sampleRate: number;
}

export interface ReplaySave {
  id: string;
  filename: string;
  filepath: string;
  duration: number; // seconds
  fileSize: number; // bytes
  format: string; // 'mp4', 'webm', etc.
  savedAt: Date;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

export interface ReplayBufferStatus {
  isRecording: boolean;
  currentDuration: number; // seconds
  bufferSize: number; // bytes
  frameCount: number;
  audioChunkCount: number;
  lastFrameTime: number;
  isProcessing: boolean;
}

export interface ReplayUIProps {
  isStreaming: boolean;
  onReplaySaved: (replay: ReplaySave) => void;
  onError: (error: Error) => void;
}

export type ReplayEvent =
  | 'buffer-started'
  | 'frame-added'
  | 'audio-added'
  | 'buffer-full'
  | 'save-started'
  | 'save-complete'
  | 'save-failed'
  | 'buffer-cleared';
