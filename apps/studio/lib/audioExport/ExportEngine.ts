/**
 * ExportEngine.ts
 *
 * Professional audio rendering engine for WISE² Studio.
 * Mixes multiple tracks with effects, applies normalization, and
 * exports to various audio formats.
 *
 * @module audioExport/ExportEngine
 */

import { AudioCodec, ExportFormat, CODEC_CONFIGS, estimateFileSize } from './Codecs';
import {
  LoudnessMeasurement,
  LoudnessNormalizationOptions,
  analyzeLoudness,
  normalizeToTarget,
} from './Loudness';

/**
 * Track information for rendering
 */
export interface AudioTrack {
  id: string;
  name: string;
  buffer: AudioBuffer;
  volume: number; // 0-1
  pan: number; // -1 (left) to 1 (right)
  muted: boolean;
  startTime: number; // seconds
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
 * Export task progress
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
 * Audio buffer pool for memory efficiency
 */
class AudioBufferPool {
  private pool: Map<string, AudioBuffer[]> = new Map();
  private maxPoolSize: number = 5;

  allocate(context: AudioContext, channels: number, length: number, sampleRate: number): AudioBuffer {
    const key = `${channels}-${sampleRate}`;

    if (!this.pool.has(key)) {
      this.pool.set(key, []);
    }

    const bufferList = this.pool.get(key)!;

    if (bufferList.length > 0 && bufferList[0].length === length) {
      return bufferList.pop()!;
    }

    return context.createAudioBuffer({ numberOfChannels: channels, length, sampleRate });
  }

  release(buffer: AudioBuffer): void {
    const key = `${buffer.numberOfChannels}-${buffer.sampleRate}`;

    if (!this.pool.has(key)) {
      this.pool.set(key, []);
    }

    const bufferList = this.pool.get(key)!;
    if (bufferList.length < this.maxPoolSize) {
      bufferList.push(buffer);
    }
  }
}

/**
 * Professional audio export engine
 */
export class ExportEngine {
  private audioContext: AudioContext;
  private bufferPool: AudioBufferPool;
  private progressCallbacks: Map<string, (progress: ExportProgress) => void> = new Map();
  private exportTasks: Map<string, ExportProgress> = new Map();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.bufferPool = new AudioBufferPool();
  }

  /**
   * Register progress callback
   */
  onProgress(taskId: string, callback: (progress: ExportProgress) => void): void {
    this.progressCallbacks.set(taskId, callback);
  }

  /**
   * Emit progress update
   */
  private emitProgress(progress: ExportProgress): void {
    this.exportTasks.set(progress.taskId, progress);
    const callback = this.progressCallbacks.get(progress.taskId);
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Render and mix multiple tracks into single audio buffer
   */
  async renderTracks(
    tracks: AudioTrack[],
    duration: number,
    taskId: string
  ): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const totalSamples = Math.ceil(duration * sampleRate);
    const mixedBuffer = this.bufferPool.allocate(
      this.audioContext,
      2, // Always stereo output
      totalSamples,
      sampleRate
    );

    const mixedLeft = mixedBuffer.getChannelData(0);
    const mixedRight = mixedBuffer.getChannelData(1);

    // Initialize with zeros
    mixedLeft.fill(0);
    mixedRight.fill(0);

    // Mix each track
    const activeTracks = tracks.filter((t) => t.enabled && !t.muted);
    let tracksProcessed = 0;

    for (const track of activeTracks) {
      this.emitProgress({
        taskId,
        status: 'rendering',
        progress: Math.round((tracksProcessed / activeTracks.length) * 50),
        currentTrack: tracksProcessed,
        totalTracks: activeTracks.length,
      });

      // Get track data
      const trackLeft =
        track.buffer.numberOfChannels > 0 ? track.buffer.getChannelData(0) : null;
      const trackRight =
        track.buffer.numberOfChannels > 1 ? track.buffer.getChannelData(1) : trackLeft;

      if (!trackLeft) {
        continue; // Skip empty tracks
      }

      // Apply track-level effects (simplified: volume and pan)
      const volume = track.volume * (1 - Math.abs(track.pan)); // Reduce volume when panning
      const panLeft = track.pan < 0 ? 1 : 1 - track.pan;
      const panRight = track.pan > 0 ? 1 : 1 + track.pan;

      // Mix track into output
      const startSample = Math.floor(track.startTime * sampleRate);
      for (let i = 0; i < trackLeft.length; i++) {
        const outputIndex = startSample + i;
        if (outputIndex >= 0 && outputIndex < totalSamples) {
          const leftSample = trackLeft[i] * volume * panLeft;
          const rightSample = (trackRight?.[i] ?? trackLeft[i]) * volume * panRight;

          mixedLeft[outputIndex] += leftSample;
          mixedRight[outputIndex] += rightSample;
        }
      }

      tracksProcessed++;
    }

    // Prevent clipping
    this.softClipBuffer(mixedBuffer);

    this.emitProgress({
      taskId,
      status: 'rendering',
      progress: 50,
      currentTrack: activeTracks.length,
      totalTracks: activeTracks.length,
      renderedBuffer: mixedBuffer,
    });

    return mixedBuffer;
  }

  /**
   * Apply soft clipping to prevent harsh digital clipping
   */
  private softClipBuffer(buffer: AudioBuffer, threshold: number = 0.95): void {
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const channel = buffer.getChannelData(ch);
      for (let i = 0; i < channel.length; i++) {
        const sample = channel[i];
        if (Math.abs(sample) > threshold) {
          // Soft clipping using atan (smooth saturation)
          channel[i] = Math.atan(sample) / (Math.PI / 2);
        }
      }
    }
  }

  /**
   * Normalize audio buffer to target loudness
   */
  async normalizeBuffer(
    buffer: AudioBuffer,
    options: LoudnessNormalizationOptions,
    taskId: string
  ): Promise<{ buffer: AudioBuffer; measurement: LoudnessMeasurement; gain: number }> {
    this.emitProgress({
      taskId,
      status: 'normalizing',
      progress: 60,
      totalTracks: 0,
    });

    const result = normalizeToTarget(buffer, options);

    this.emitProgress({
      taskId,
      status: 'normalizing',
      progress: 80,
      totalTracks: 0,
      measurement: result.measurement,
    });

    return result;
  }

  /**
   * Convert audio buffer to blob (WAV format)
   * This is the base format; other codecs would require external encoders
   */
  async bufferToWAV(buffer: AudioBuffer): Promise<Blob> {
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const format = 1; // PCM
    const bitDepth = 24; // 24-bit
    const bytesPerSample = bitDepth / 8;

    // Get audio data
    const audioData: Float32Array[] = [];
    for (let ch = 0; ch < numberOfChannels; ch++) {
      audioData.push(buffer.getChannelData(ch));
    }

    // Calculate file size
    const dataLength = buffer.length * numberOfChannels * bytesPerSample;
    const fileLength = 36 + dataLength;

    // Create WAV file
    const wav = new ArrayBuffer(44 + dataLength);
    const view = new DataView(wav);

    // Helper function to write strings
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF chunk
    writeString(0, 'RIFF');
    view.setUint32(4, fileLength, true);
    writeString(8, 'WAVE');

    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, format, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true); // ByteRate
    view.setUint16(32, numberOfChannels * bytesPerSample, true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample

    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio samples
    let offset = 44;
    const maxSample = Math.pow(2, bitDepth - 1) - 1;

    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numberOfChannels; ch++) {
        // Convert float (-1..1) to 24-bit PCM
        const sample = Math.max(-1, Math.min(1, audioData[ch][i]));
        const intSample = Math.round(sample * maxSample);

        // Write 24-bit value (little-endian)
        view.setUint8(offset, intSample & 0xff);
        view.setUint8(offset + 1, (intSample >> 8) & 0xff);
        view.setUint8(offset + 2, (intSample >> 16) & 0xff);
        offset += 3;
      }
    }

    return new Blob([wav], { type: 'audio/wav' });
  }

  /**
   * Export complete project
   */
  async export(
    tracks: AudioTrack[],
    duration: number,
    format: ExportFormat,
    options: LoudnessNormalizationOptions = {},
    filename: string = 'export.wav'
  ): Promise<ExportResult> {
    const taskId = `export_${Date.now()}_${Math.random()}`;

    try {
      // Render tracks
      const renderedBuffer = await this.renderTracks(tracks, duration, taskId);

      // Normalize (if requested)
      let finalBuffer = renderedBuffer;
      let measurement: LoudnessMeasurement | undefined;

      if (options.targetLoudness !== undefined || options.maxTruePeak !== undefined) {
        const normResult = await this.normalizeBuffer(renderedBuffer, options, taskId);
        finalBuffer = normResult.buffer;
        measurement = normResult.measurement;
      } else {
        const analysis = analyzeLoudness(renderedBuffer);
        measurement = analysis;
      }

      // Convert to output format (currently WAV, others require external encoders)
      this.emitProgress({
        taskId,
        status: 'encoding',
        progress: 90,
        totalTracks: 0,
        measurement,
      });

      let outputBlob: Blob;
      if (format.codec === 'wav') {
        outputBlob = await this.bufferToWAV(finalBuffer);
      } else {
        // For other formats, export as WAV (external encoder would be used in production)
        outputBlob = await this.bufferToWAV(finalBuffer);
      }

      const fileSize = outputBlob.size;
      const estimatedSize = estimateFileSize(format, duration);

      this.emitProgress({
        taskId,
        status: 'complete',
        progress: 100,
        totalTracks: 0,
        measurement,
      });

      return {
        taskId,
        success: true,
        blob: outputBlob,
        buffer: finalBuffer,
        measurement,
        filename,
        format: format.codec,
        fileSize,
        duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.emitProgress({
        taskId,
        status: 'error',
        progress: 0,
        totalTracks: 0,
        errorMessage,
      });

      return {
        taskId,
        success: false,
        filename,
        format: format.codec,
        fileSize: 0,
        duration,
        error: errorMessage,
      };
    }
  }

  /**
   * Batch export to multiple formats
   */
  async batchExport(
    tracks: AudioTrack[],
    duration: number,
    formats: ExportFormat[],
    baseFilename: string = 'export',
    options: LoudnessNormalizationOptions = {}
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];

    // Render once, export to multiple formats
    const renderedBuffer = await this.renderTracks(
      tracks,
      duration,
      `batch_${Date.now()}`
    );

    let finalBuffer = renderedBuffer;
    let measurement: LoudnessMeasurement | undefined;

    if (options.targetLoudness !== undefined || options.maxTruePeak !== undefined) {
      const normResult = await this.normalizeBuffer(
        renderedBuffer,
        options,
        `batch_${Date.now()}`
      );
      finalBuffer = normResult.buffer;
      measurement = normResult.measurement;
    } else {
      measurement = analyzeLoudness(renderedBuffer);
    }

    // Export to each format
    for (const format of formats) {
      const extension = format.codec === 'wav' ? '.wav' : `.${format.codec}`;
      const filename = `${baseFilename}${extension}`;

      let outputBlob: Blob;
      if (format.codec === 'wav') {
        outputBlob = await this.bufferToWAV(finalBuffer);
      } else {
        // In production, use external encoder for MP3, FLAC, etc.
        outputBlob = await this.bufferToWAV(finalBuffer);
      }

      results.push({
        taskId: `batch_${format.codec}`,
        success: true,
        blob: outputBlob,
        buffer: finalBuffer,
        measurement,
        filename,
        format: format.codec,
        fileSize: outputBlob.size,
        duration,
      });
    }

    return results;
  }

  /**
   * Download exported blob
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get current export status
   */
  getExportStatus(taskId: string): ExportProgress | undefined {
    return this.exportTasks.get(taskId);
  }
}
