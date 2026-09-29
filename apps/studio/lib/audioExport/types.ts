/**
 * types.ts
 *
 * Comprehensive TypeScript type definitions for audio export system.
 * Provides full IDE support and type safety.
 *
 * @module audioExport/types
 */

/**
 * Audio codec types
 */
export type AudioCodec = 'mp3' | 'wav' | 'flac' | 'alac' | 'opus' | 'ogg' | 'aac';

/**
 * Audio bit depth options
 */
export type BitDepth = 16 | 24 | 32;

/**
 * Sample rate options
 */
export type SampleRate = 44100 | 48000 | 88200 | 96000 | 192000;

/**
 * Export format specification
 */
export interface ExportFormat {
  codec: AudioCodec;
  bitrate?: number; // kbps for lossy codecs
  quality?: number; // 0-100 quality scale
  bitDepth?: BitDepth; // 16, 24, or 32-bit for lossless
  sampleRate?: SampleRate;
  normalize?: boolean;
  normalizationTarget?: number; // LUFS
}

/**
 * Audio track for rendering
 */
export interface AudioTrack {
  id: string;
  name: string;
  buffer: AudioBuffer;
  volume: number; // 0.0 to 1.0
  pan: number; // -1.0 (left) to 1.0 (right)
  muted: boolean;
  startTime: number; // in seconds
  enabled: boolean;
  effects?: TrackEffect[];
}

/**
 * Track effect configuration
 */
export interface TrackEffect {
  type: 'volume' | 'pan' | 'eq' | 'reverb' | 'delay' | 'compression';
  enabled: boolean;
  parameters: Record<string, number>;
}

/**
 * Loudness measurement result
 */
export interface LoudnessMeasurement {
  integratedLoudness: number; // LUFS
  truePeak: number; // dBFS
  loudnessRange: number; // LRA (dB)
  shortTermLoudness: number[]; // dB
  momentaryLoudness: number[]; // dB
  normalizedGain: number; // dB applied
}

/**
 * Loudness normalization options
 */
export interface LoudnessNormalizationOptions {
  targetLoudness?: number; // LUFS (default: -14)
  maxTruePeak?: number; // dBFS (default: -1)
  allowClipping?: boolean; // Allow hard clipping
}

/**
 * Export progress state
 */
export interface ExportProgress {
  taskId: string;
  status: 'pending' | 'rendering' | 'normalizing' | 'encoding' | 'complete' | 'error';
  progress: number; // 0-100
  currentTrack?: number;
  totalTracks: number;
  errorMessage?: string;
  renderedBuffer?: AudioBuffer;
  measurement?: LoudnessMeasurement;
  eta?: number; // milliseconds
}

/**
 * Export result
 */
export interface ExportResult {
  taskId: string;
  success: boolean;
  buffer?: AudioBuffer;
  blob?: Blob;
  measurement?: LoudnessMeasurement;
  filename: string;
  format: AudioCodec;
  fileSize: number;
  duration: number;
  error?: string;
}

/**
 * Codec configuration
 */
export interface CodecConfig {
  codec: AudioCodec;
  mimeType: string;
  extension: string;
  description: string;
  lossless: boolean;
  defaultBitrate: number; // kbps, 0 for lossless
  bitrateRange?: {
    min: number;
    max: number;
  };
  supportedBitDepths?: BitDepth[];
  supportedSampleRates?: SampleRate[];
}

/**
 * Quality preset
 */
export interface QualityPreset {
  label: string;
  description: string;
  bitrate: number; // kbps
  quality: number; // 0-100
}

/**
 * Loudness standard for streaming platforms
 */
export interface LoudnessStandard {
  name: string;
  targetLoudness: number; // LUFS
  maxTruePeak: number; // dBFS
}

/**
 * Browser codec support info
 */
export interface CodecSupportInfo {
  supported: boolean;
  webAudioSupport: boolean;
  mediaSourceSupport: boolean;
  notes: string[];
}

/**
 * Export engine options
 */
export interface ExportEngineOptions {
  audioContext: AudioContext;
  maxBufferPoolSize?: number; // Default: 5
}

/**
 * Export operation state (for hooks)
 */
export interface ExportOperationState {
  isExporting: boolean;
  progress: number;
  status: ExportProgress['status'] | null;
  error: string | null;
  results: ExportResult[];
  measurement: LoudnessMeasurement | null;
  currentTrack: number;
  totalTracks: number;
}

/**
 * Export hook options
 */
export interface UseAudioExportOptions {
  audioContext: AudioContext;
  tracks: AudioTrack[];
  duration: number;
  projectTitle?: string;
}

/**
 * Export hook return value
 */
export interface UseAudioExportReturn extends ExportOperationState {
  exportSingle(
    format: ExportFormat,
    filename?: string,
    normalizationOptions?: LoudnessNormalizationOptions
  ): Promise<ExportResult | null>;

  exportBatch(
    formats: ExportFormat[],
    baseFilename?: string,
    normalizationOptions?: LoudnessNormalizationOptions
  ): Promise<ExportResult[]>;

  downloadResult(result: ExportResult): void;
  downloadAll(): void;
  cancel(): void;
  clearError(): void;
  reset(): void;
}

/**
 * Preview hook return value
 */
export interface UseAudioPreviewReturn {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  play(blob: Blob): Promise<void>;
  pause(): void;
  stop(): void;
}

/**
 * Combined export + preview hook return
 */
export interface UseAudioExportWithPreviewReturn extends UseAudioExportReturn {
  preview: UseAudioPreviewReturn;
  previewExport(format: ExportFormat): Promise<void>;
}

/**
 * Batch export hook with auto-download
 */
export interface UseBatchAudioExportReturn extends UseAudioExportReturn {
  exportAndDownload(
    formats: ExportFormat[],
    baseFilename?: string,
    normalizationOptions?: LoudnessNormalizationOptions
  ): Promise<ExportResult[]>;
}

/**
 * Export dialog props
 */
export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: AudioTrack[];
  duration: number;
  projectTitle?: string;
  onExportComplete?: (results: ExportResult[]) => void;
  audioContext: AudioContext;
}

/**
 * Normalization result
 */
export interface NormalizationResult {
  buffer: AudioBuffer;
  measurement: LoudnessMeasurement;
  gain: number; // dB
}

/**
 * File size estimate info
 */
export interface FileSizeEstimate {
  format: AudioCodec;
  bitrate?: number;
  duration: number;
  estimatedBytes: number;
  estimatedMB: number;
}

/**
 * Progress callback function
 */
export type ProgressCallback = (progress: ExportProgress) => void;

/**
 * Export completion callback
 */
export type ExportCompletionCallback = (results: ExportResult[]) => void;

/**
 * Loudness report
 */
export interface LoudnessReport {
  measurement: LoudnessMeasurement;
  report: string;
  platformComparisons: Array<{
    platform: string;
    standard: LoudnessStandard;
    difference: number;
  }>;
}

/**
 * Batch export job
 */
export interface BatchExportJob {
  id: string;
  title: string;
  formats: ExportFormat[];
  tracks: AudioTrack[];
  duration: number;
  normalizationOptions?: LoudnessNormalizationOptions;
  startTime: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number;
  results: ExportResult[];
  error?: string;
}

/**
 * Use case for codec recommendation
 */
export type ExportUseCase = 'streaming' | 'archival' | 'broadcast' | 'social';

/**
 * Streaming platform key
 */
export type StreamingPlatform =
  | 'spotify'
  | 'youtube'
  | 'appleMusic'
  | 'amazonMusic'
  | 'tidal'
  | 'soundcloud'
  | 'broadcast'
  | 'podcast';

/**
 * Export dialog state (internal)
 */
export interface ExportDialogState {
  selectedCodec: AudioCodec;
  quality: number;
  bitrate: number;
  usePreset: boolean;
  selectedPreset: number;
  normalizeEnabled: boolean;
  normalizationStandard: StreamingPlatform;
  customTargetLUFS: number;
  batchExportEnabled: boolean;
  selectedFormats: AudioCodec[];
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  previewPlaying: boolean;
}

/**
 * Track state for UI
 */
export interface TrackUIState extends AudioTrack {
  isSelected?: boolean;
  isEditing?: boolean;
  error?: string;
}

/**
 * Project state for export
 */
export interface ProjectExportState {
  title: string;
  tracks: AudioTrack[];
  duration: number;
  metadata?: {
    artist?: string;
    album?: string;
    year?: number;
    genre?: string;
  };
  lastExportTime?: number;
  lastExportResult?: ExportResult;
}

/**
 * Analytics for export operations
 */
export interface ExportAnalytics {
  totalExports: number;
  averageExportTime: number; // milliseconds
  averageFileSize: number; // bytes
  mostUsedCodec: AudioCodec;
  averageLoudness: number; // LUFS
  errorRate: number; // percentage
}

export type { AudioTrack as Track } from './ExportEngine';
