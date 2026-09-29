/**
 * Recording System Type Definitions
 */

export interface RecordingConfig {
  format: 'mp4' | 'mkv' | 'webm';
  quality: 'low' | 'medium' | 'high';
  bitrate: number; // kbps
  resolution: string; // e.g., "1920x1080"
  frameRate: number; // fps
  audioCodec: 'aac' | 'flac' | 'opus';
  videoBitrate?: number; // kbps
  audioBitrate?: number; // kbps, default 128
  splitThreshold?: 'small' | 'medium' | 'large'; // 1GB, 5GB, 10GB
}

export interface RecordingMetadata {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  format: 'MP4' | 'MKV' | 'WEBM';
  platform?: string;
  streamTitle?: string;
  videoTrackPath?: string;
  audioTrackPath?: string;
  audioTracks: AudioTrackInfo[];
  status: RecordingStatus;
  quality: string;
  bitrate: number;
  startedAt: Date;
  stoppedAt?: Date;
  isSplit: boolean;
  splitParts: number;
  userId?: string;
}

export interface AudioTrackInfo {
  name: string;
  filePath: string;
  codec: string;
  bitrate: number;
  channels: number;
  sampleRate: number;
}

export type RecordingStatus = 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED' | 'PROCESSING' | 'FAILED';

export interface RecordingEvent {
  type: 'start' | 'pause' | 'resume' | 'stop' | 'split' | 'error' | 'size-update' | 'file-saved' | 'audio-track-saved';
  recordingId?: string;
  data?: any;
  timestamp: number;
}

export interface RecordingFile {
  id: string;
  name: string;
  path: string;
  size: number;
  duration: number;
  format: 'MP4' | 'MKV' | 'WEBM';
  platform?: string;
  thumbnail?: string;
  createdAt: Date;
  bitrate: number;
  isSplit: boolean;
  splitParts?: number;
  audioTracks?: AudioTrackInfo[];
}

export interface RecordingsListProps {
  recordings: RecordingFile[];
  onDelete: (recordingId: string) => void;
  onDownload: (recordingId: string) => void;
  onPlay: (recordingId: string) => void;
  onMove: (recordingId: string, destination: string) => void;
  isLoading?: boolean;
}

export interface RecordingControlProps {
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  status: RecordingStatus;
  duration: number;
  fileSize: number;
  splitCount: number;
  recording?: RecordingMetadata;
}
