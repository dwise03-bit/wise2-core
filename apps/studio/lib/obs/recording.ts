/**
 * Local Stream Recording Service
 *
 * Handles:
 * - Starting/stopping stream recordings
 * - Saving to public/recordings/ with timestamps
 * - MP4 (H.264 + AAC) and MKV (lossless) formats
 * - Separate audio track extraction
 * - Auto-split for files >1GB
 * - Metadata persistence to database
 */

import { NextRequest } from 'next/server';

export interface RecordingConfig {
  format: 'mp4' | 'mkv' | 'webm';
  quality: 'low' | 'medium' | 'high';
  bitrate: number; // kbps
  resolution: string; // e.g., "1920x1080"
  frameRate: number; // fps
  audioCodec: 'aac' | 'flac' | 'opus';
  videoBitrate?: number; // kbps, auto-calculated if not set
  audioBitrate?: number; // kbps, default 128
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
  status: 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED' | 'PROCESSING' | 'FAILED';
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

export class StreamRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private pauseTime: number = 0;
  private totalPausedTime: number = 0;
  private currentRecordingId: string | null = null;
  private fileSize: number = 0;
  private maxFileSize: number = 1024 * 1024 * 1024; // 1GB
  private splitCount: number = 1;
  private config: RecordingConfig;
  private audioContext: AudioContext | null = null;
  private audioTracks: AudioTrackInfo[] = [];

  constructor(config: Partial<RecordingConfig> = {}) {
    this.config = {
      format: 'mp4',
      quality: 'high',
      bitrate: 5000,
      resolution: '1920x1080',
      frameRate: 30,
      audioCodec: 'aac',
      ...config,
    };
  }

  /**
   * Start recording a stream
   */
  async startRecording(
    stream: MediaStream,
    recordingTitle: string,
    platform?: string,
    streamTitle?: string
  ): Promise<RecordingMetadata> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }

    this.stream = stream;
    this.chunks = [];
    this.startTime = Date.now();
    this.totalPausedTime = 0;
    this.fileSize = 0;
    this.splitCount = 1;
    this.audioTracks = [];

    // Generate unique ID and timestamps
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentRecordingId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Set up media recorder with appropriate MIME type
    const mimeType = this.getMimeType();
    const options: MediaRecorderOptions = {
      mimeType,
      audioBitsPerSecond: this.config.audioBitrate || 128000,
      videoBitsPerSecond: this.config.videoBitrate,
    };

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.error('Error creating MediaRecorder:', e);
      throw new Error(`Unsupported format: ${mimeType}`);
    }

    // Collect recorded data
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        this.fileSize += event.data.size;

        // Check if we need to split
        if (this.fileSize > this.maxFileSize) {
          this.handleAutoSplit();
        }
      }
    };

    // Start recording
    this.mediaRecorder.start(1000); // Collect data every second

    // Extract separate audio track if needed
    if (this.config.format === 'mkv') {
      await this.extractAudioTrack(stream);
    }

    const metadata: RecordingMetadata = {
      id: this.currentRecordingId,
      title: recordingTitle,
      filePath: `/recordings/${timestamp}/${this.currentRecordingId}`,
      fileSize: 0,
      format: this.config.format === 'mkv' ? 'MKV' : 'MP4',
      platform,
      streamTitle,
      videoTrackPath: this.config.format === 'mkv' ? `/recordings/${timestamp}/${this.currentRecordingId}-video` : undefined,
      audioTrackPath: this.config.format === 'mkv' ? `/recordings/${timestamp}/${this.currentRecordingId}-audio` : undefined,
      audioTracks: this.audioTracks,
      status: 'RECORDING',
      quality: this.config.quality,
      bitrate: this.config.bitrate,
      startedAt: new Date(),
      isSplit: false,
      splitParts: 1,
    };

    // Save metadata to database
    await this.saveMetadataToDatabase(metadata);

    return metadata;
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('No active recording to pause');
    }

    this.mediaRecorder.pause();
    this.pauseTime = Date.now();
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('No active recording to resume');
    }

    this.mediaRecorder.resume();
    if (this.pauseTime > 0) {
      this.totalPausedTime += Date.now() - this.pauseTime;
      this.pauseTime = 0;
    }
  }

  /**
   * Stop recording and save file
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
          const duration = this.calculateDuration();
          const blob = new Blob(this.chunks, { type: this.getMimeType() });
          const filePath = await this.saveFile(blob);

          const metadata: RecordingMetadata = {
            id: this.currentRecordingId!,
            title: 'Stream Recording',
            filePath,
            fileSize: this.fileSize,
            duration,
            format: this.config.format === 'mkv' ? 'MKV' : 'MP4',
            status: 'STOPPED',
            quality: this.config.quality,
            bitrate: this.config.bitrate,
            startedAt: new Date(this.startTime),
            stoppedAt: new Date(),
            audioTracks: this.audioTracks,
            isSplit: this.splitCount > 1,
            splitParts: this.splitCount,
          };

          // Update database with final metadata
          await this.updateMetadataInDatabase(metadata);

          // Cleanup
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
   * Get appropriate MIME type for format
   */
  private getMimeType(): string {
    const mimeTypes = {
      mp4: 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"',
      mkv: 'video/x-matroska;codecs="V_UNCOMPRESSED, A_FLAC"',
      webm: 'video/webm;codecs="vp8, vorbis"',
    };

    const type = mimeTypes[this.config.format as keyof typeof mimeTypes];

    // Fallback if not supported
    if (!MediaRecorder.isTypeSupported(type)) {
      return 'video/webm';
    }

    return type;
  }

  /**
   * Extract separate audio track for post-editing
   */
  private async extractAudioTrack(stream: MediaStream): Promise<void> {
    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      console.warn('No audio tracks found in stream');
      return;
    }

    // Create separate audio recorder for each track
    for (let i = 0; i < audioTracks.length; i++) {
      const audioTrack = audioTracks[i];
      const audioStream = new MediaStream([audioTrack]);
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 192000, // Lossless-quality audio
      });

      const audioChunks: Blob[] = [];

      audioRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      audioRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioPath = await this.saveAudioTrack(audioBlob, i);

        this.audioTracks.push({
          name: `Audio Track ${i + 1}`,
          filePath: audioPath,
          codec: 'opus',
          bitrate: 192,
          channels: audioTrack.getSettings().channelCount || 2,
          sampleRate: audioTrack.getSettings().sampleRate || 48000,
        });
      };

      audioRecorder.start();
    }
  }

  /**
   * Handle auto-split when file exceeds 1GB
   */
  private async handleAutoSplit(): Promise<void> {
    if (!this.mediaRecorder) return;

    // Request data for current file
    this.mediaRecorder.requestData();

    // Save current part
    const partBlob = new Blob(this.chunks, { type: this.getMimeType() });
    await this.saveSplitPart(partBlob, this.splitCount);

    // Reset for next part
    this.chunks = [];
    this.fileSize = 0;
    this.splitCount += 1;
  }

  /**
   * Calculate recording duration
   */
  private calculateDuration(): number {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    const activeDuration = (totalTime - this.totalPausedTime) / 1000; // Convert to seconds
    return Math.round(activeDuration);
  }

  /**
   * Save recorded blob to file
   */
  private async saveFile(blob: Blob): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${this.currentRecordingId}.${this.config.format}`;
    const path = `/recordings/${filename}`;

    // In a real implementation, upload to server
    // For now, create local blob URL
    const url = URL.createObjectURL(blob);

    // Notify server to save file
    await this.notifyServerToSaveFile(blob, path);

    return path;
  }

  /**
   * Save audio track
   */
  private async saveAudioTrack(blob: Blob, trackIndex: number): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${this.currentRecordingId}-audio-${trackIndex + 1}.webm`;
    const path = `/recordings/${filename}`;

    await this.notifyServerToSaveFile(blob, path);

    return path;
  }

  /**
   * Save split part
   */
  private async saveSplitPart(blob: Blob, partNumber: number): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${this.currentRecordingId}-part-${partNumber}.${this.config.format}`;
    const path = `/recordings/${filename}`;

    await this.notifyServerToSaveFile(blob, path);

    return path;
  }

  /**
   * Notify server to save file (via API)
   */
  private async notifyServerToSaveFile(blob: Blob, path: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('path', path);
    formData.append('recordingId', this.currentRecordingId || 'unknown');

    try {
      const response = await fetch('/api/obs/recordings/save', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Failed to save file:', response.statusText);
      }
    } catch (error) {
      console.error('Error notifying server to save file:', error);
    }
  }

  /**
   * Save metadata to database
   */
  private async saveMetadataToDatabase(metadata: RecordingMetadata): Promise<void> {
    try {
      await fetch('/api/obs/recordings/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
    } catch (error) {
      console.error('Error saving metadata to database:', error);
    }
  }

  /**
   * Update metadata in database
   */
  private async updateMetadataInDatabase(metadata: RecordingMetadata): Promise<void> {
    try {
      await fetch(`/api/obs/recordings/metadata/${metadata.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
    } catch (error) {
      console.error('Error updating metadata in database:', error);
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.currentRecordingId = null;
  }

  /**
   * Get recording status
   */
  getStatus(): RecordingStatus {
    if (!this.mediaRecorder) {
      return 'IDLE';
    }

    const state = this.mediaRecorder.state;
    return state === 'recording' ? 'RECORDING' : state === 'paused' ? 'PAUSED' : 'IDLE';
  }

  /**
   * Get current file size
   */
  getCurrentFileSize(): number {
    return this.fileSize;
  }

  /**
   * Get current duration
   */
  getCurrentDuration(): number {
    if (this.startTime === 0) return 0;
    return this.calculateDuration();
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    this.cleanup();
    this.audioContext?.close();
  }
}

export type RecordingStatus = 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED' | 'PROCESSING' | 'FAILED';

/**
 * Singleton instance for global access
 */
let recorderInstance: StreamRecorder | null = null;

export function getRecorder(config?: Partial<RecordingConfig>): StreamRecorder {
  if (!recorderInstance) {
    recorderInstance = new StreamRecorder(config);
  }
  return recorderInstance;
}

export function resetRecorder(): void {
  if (recorderInstance) {
    recorderInstance.destroy();
    recorderInstance = null;
  }
}
