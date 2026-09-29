/**
 * Recording Engine - Local Stream Recording System
 *
 * Handles:
 * - Simultaneous stream recording while broadcasting
 * - MP4 (H.264 video + AAC audio) and MKV (lossless) formats
 * - Separate audio tracks (up to 6 independent channels)
 * - Auto-split on 1GB, 5GB, 10GB thresholds
 * - Metadata persistence to database
 * - Resume from pause (max 30s)
 * - File management and cleanup
 */

import { RecordingConfig, RecordingMetadata, AudioTrackInfo, RecordingStatus } from './types';

export class RecordingEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioRecorders: Map<number, MediaRecorder> = new Map();
  private recordedChunks: Blob[] = [];
  private audioChunks: Map<number, Blob[]> = new Map();

  private recordingId: string | null = null;
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private pausedDuration: number = 0;
  private currentFileSize: number = 0;

  private maxFileSize: number = 1_073_741_824; // 1GB default
  private splitThresholds = {
    small: 1_073_741_824,    // 1GB
    medium: 5_368_709_120,   // 5GB
    large: 10_737_418_240,   // 10GB
  };

  private splitCount: number = 0;
  private config: RecordingConfig;
  private recordingTracks: AudioTrackInfo[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<RecordingConfig> = {}) {
    this.config = {
      format: 'mp4',
      quality: 'high',
      bitrate: 5000,
      resolution: '1920x1080',
      frameRate: 30,
      audioCodec: 'aac',
      videoBitrate: 5000,
      audioBitrate: 128,
      ...config,
    };

    this.maxFileSize = this.calculateMaxFileSize(config.splitThreshold);
  }

  /**
   * Calculate max file size from threshold setting
   */
  private calculateMaxFileSize(threshold?: 'small' | 'medium' | 'large'): number {
    if (!threshold) return this.splitThresholds.small;
    return this.splitThresholds[threshold];
  }

  /**
   * Subscribe to recording events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emit recording events
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  /**
   * Start recording a stream
   */
  async startRecording(
    stream: MediaStream,
    recordingTitle: string,
    config?: { platform?: string; streamTitle?: string }
  ): Promise<RecordingMetadata> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }

    this.stream = stream;
    this.recordedChunks = [];
    this.audioChunks.clear();
    this.audioRecorders.clear();

    this.startTime = Date.now();
    this.pauseStartTime = 0;
    this.pausedDuration = 0;
    this.currentFileSize = 0;
    this.splitCount = 1;
    this.recordingTracks = [];

    // Generate unique ID
    this.recordingId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Set up media recorder
    const mimeType = this.getMimeType();

    try {
      const options: MediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: (this.config.audioBitrate || 128) * 1000,
        videoBitsPerSecond: (this.config.videoBitrate || 5000) * 1000,
      };

      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      this.emit('error', { message: `Failed to create MediaRecorder: ${e}` });
      throw new Error(`Recording initialization failed: ${mimeType}`);
    }

    // Handle data available
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.currentFileSize += event.data.size;
        this.emit('size-update', { size: this.currentFileSize, parts: this.splitCount });

        // Check for auto-split
        if (this.currentFileSize > this.maxFileSize) {
          this.handleAutoSplit();
        }
      }
    };

    // Handle recording stop
    this.mediaRecorder.onstop = () => {
      this.emit('stop', { recordingId: this.recordingId });
    };

    // Start recording
    this.mediaRecorder.start(1000); // Collect data every second
    this.emit('start', { recordingId: this.recordingId });

    // Extract separate audio tracks if needed
    if (this.config.format === 'mkv') {
      await this.setupSeparateAudioTracks(stream);
    }

    const metadata: RecordingMetadata = {
      id: this.recordingId,
      title: recordingTitle,
      filePath: `/recordings/${this.recordingId}`,
      fileSize: 0,
      format: this.config.format.toUpperCase() as any,
      platform: config?.platform,
      streamTitle: config?.streamTitle,
      audioTracks: this.recordingTracks,
      status: 'RECORDING',
      quality: this.config.quality,
      bitrate: this.config.bitrate,
      startedAt: new Date(),
      isSplit: false,
      splitParts: 1,
    };

    // Save metadata to database
    await this.saveMetadata(metadata);

    return metadata;
  }

  /**
   * Pause recording (max 30 seconds)
   */
  pauseRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('No active recording to pause');
    }

    this.mediaRecorder.pause();
    this.pauseStartTime = Date.now();
    this.emit('pause', { recordingId: this.recordingId });
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('No active recording to resume');
    }

    if (this.pauseStartTime > 0) {
      const pauseDuration = Date.now() - this.pauseStartTime;

      // Enforce max 30s pause limit
      if (pauseDuration > 30000) {
        throw new Error('Pause duration exceeded 30 seconds - please stop recording');
      }

      this.pausedDuration += pauseDuration;
      this.pauseStartTime = 0;
    }

    this.mediaRecorder.resume();
    this.emit('resume', { recordingId: this.recordingId });
  }

  /**
   * Stop recording and save
   */
  async stopRecording(): Promise<RecordingMetadata> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('No active recording to stop');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Media recorder is null'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Stop all audio recorders
          for (const [, recorder] of this.audioRecorders) {
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }

          const duration = this.calculateDuration();
          const blob = new Blob(this.recordedChunks, { type: this.getMimeType() });

          const filePath = await this.saveRecordingFile(blob);

          const metadata: RecordingMetadata = {
            id: this.recordingId!,
            title: 'Stream Recording',
            filePath,
            fileSize: this.currentFileSize,
            duration,
            format: this.config.format.toUpperCase() as any,
            status: 'STOPPED',
            quality: this.config.quality,
            bitrate: this.config.bitrate,
            startedAt: new Date(this.startTime),
            stoppedAt: new Date(),
            audioTracks: this.recordingTracks,
            isSplit: this.splitCount > 1,
            splitParts: this.splitCount,
          };

          await this.updateMetadata(metadata);
          this.cleanup();

          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Handle automatic file splitting
   */
  private async handleAutoSplit(): Promise<void> {
    if (!this.mediaRecorder) return;

    // Request data
    this.mediaRecorder.requestData();

    // Save current part
    const partBlob = new Blob(this.recordedChunks, { type: this.getMimeType() });
    await this.saveSplitPart(partBlob, this.splitCount);

    this.emit('split', { part: this.splitCount, size: this.currentFileSize });

    // Reset for next part
    this.recordedChunks = [];
    this.currentFileSize = 0;
    this.splitCount += 1;
  }

  /**
   * Setup separate audio track recording
   */
  private async setupSeparateAudioTracks(stream: MediaStream): Promise<void> {
    const audioTracks = stream.getAudioTracks();

    for (let i = 0; i < audioTracks.length && i < 6; i++) {
      const audioTrack = audioTracks[i];
      const audioStream = new MediaStream([audioTrack]);

      try {
        const audioRecorder = new MediaRecorder(audioStream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 192000,
        });

        const chunks: Blob[] = [];

        audioRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        audioRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const audioPath = await this.saveAudioTrack(audioBlob, i);

          this.recordingTracks.push({
            name: audioTrack.label || `Audio Track ${i + 1}`,
            filePath: audioPath,
            codec: 'opus',
            bitrate: 192,
            channels: audioTrack.getSettings().channelCount || 2,
            sampleRate: audioTrack.getSettings().sampleRate || 48000,
          });

          this.emit('audio-track-saved', { trackIndex: i, path: audioPath });
        };

        audioRecorder.start();
        this.audioRecorders.set(i, audioRecorder);
      } catch (e) {
        console.warn(`Failed to record audio track ${i}:`, e);
      }
    }
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(): string {
    const types = {
      mp4: 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"',
      mkv: 'video/x-matroska;codecs="V_UNCOMPRESSED, A_FLAC"',
      webm: 'video/webm;codecs="vp8, vorbis"',
    };

    const type = types[this.config.format as keyof typeof types];

    // Fallback to WebM if not supported
    if (!MediaRecorder.isTypeSupported(type)) {
      return 'video/webm';
    }

    return type;
  }

  /**
   * Calculate recording duration (excluding paused time)
   */
  private calculateDuration(): number {
    const totalTime = Date.now() - this.startTime;
    const activeDuration = (totalTime - this.pausedDuration) / 1000;
    return Math.round(activeDuration);
  }

  /**
   * Save recording file to server
   */
  private async saveRecordingFile(blob: Blob): Promise<string> {
    const path = `/recordings/${this.recordingId}.${this.config.format}`;
    await this.uploadFile(blob, path);
    return path;
  }

  /**
   * Save audio track
   */
  private async saveAudioTrack(blob: Blob, trackIndex: number): Promise<string> {
    const path = `/recordings/${this.recordingId}-audio-${trackIndex + 1}.webm`;
    await this.uploadFile(blob, path);
    return path;
  }

  /**
   * Save split part
   */
  private async saveSplitPart(blob: Blob, partNumber: number): Promise<string> {
    const path = `/recordings/${this.recordingId}-part-${partNumber}.${this.config.format}`;
    await this.uploadFile(blob, path);
    return path;
  }

  /**
   * Upload file to server
   */
  private async uploadFile(blob: Blob, path: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('path', path);
    formData.append('recordingId', this.recordingId || 'unknown');

    try {
      const response = await fetch('/api/obs/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      this.emit('file-saved', { path, size: blob.size });
    } catch (error) {
      this.emit('error', { message: `Failed to upload file: ${error}` });
      throw error;
    }
  }

  /**
   * Save metadata to database
   */
  private async saveMetadata(metadata: RecordingMetadata): Promise<void> {
    try {
      const response = await fetch('/api/obs/recordings/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Metadata save failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
      this.emit('error', { message: 'Failed to save metadata' });
    }
  }

  /**
   * Update metadata in database
   */
  private async updateMetadata(metadata: RecordingMetadata): Promise<void> {
    try {
      const response = await fetch(`/api/obs/recordings/metadata/${metadata.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Metadata update failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
      this.emit('error', { message: 'Failed to update metadata' });
    }
  }

  /**
   * Get current recording status
   */
  getStatus(): RecordingStatus {
    if (!this.mediaRecorder) return 'IDLE';

    switch (this.mediaRecorder.state) {
      case 'recording':
        return 'RECORDING';
      case 'paused':
        return 'PAUSED';
      default:
        return 'IDLE';
    }
  }

  /**
   * Get current file size
   */
  getCurrentFileSize(): number {
    return this.currentFileSize;
  }

  /**
   * Get current recording duration
   */
  getCurrentDuration(): number {
    if (this.startTime === 0) return 0;
    return this.calculateDuration();
  }

  /**
   * Get current split count
   */
  getSplitCount(): number {
    return this.splitCount;
  }

  /**
   * Get recording ID
   */
  getRecordingId(): string | null {
    return this.recordingId;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.audioRecorders.forEach((recorder) => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    });

    this.mediaRecorder = null;
    this.stream = null;
    this.recordedChunks = [];
    this.audioChunks.clear();
    this.audioRecorders.clear();
    this.recordingId = null;
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.cleanup();
    this.listeners.clear();
  }
}

// Singleton instance
let engineInstance: RecordingEngine | null = null;

export function getRecordingEngine(config?: Partial<RecordingConfig>): RecordingEngine {
  if (!engineInstance) {
    engineInstance = new RecordingEngine(config);
  }
  return engineInstance;
}

export function resetRecordingEngine(): void {
  if (engineInstance) {
    engineInstance.destroy();
    engineInstance = null;
  }
}
