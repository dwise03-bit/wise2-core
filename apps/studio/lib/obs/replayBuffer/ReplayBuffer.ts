/**
 * Replay Buffer - Instant Replay Capture System
 *
 * Maintains a ring buffer of the last N seconds of video/audio data.
 * On demand, saves the buffer contents to an MP4 file.
 * Auto-cleans up old replays (keeps last 5).
 */

import { ReplayBufferConfig, ReplayFrame, ReplayAudioChunk, ReplaySave, ReplayBufferStatus, ReplayEvent } from './types';

export class ReplayBuffer {
  private config: ReplayBufferConfig;
  private videoFrames: ReplayFrame[] = [];
  private audioChunks: ReplayAudioChunk[] = [];

  private isRecording = false;
  private bufferStartTime = 0;
  private currentTimestamp = 0;
  private totalFrames = 0;
  private totalAudioChunks = 0;

  private currentBufferSize = 0;
  private maxBufferSize: number;

  // Event listeners
  private listeners: Map<ReplayEvent, Function[]> = new Map();

  // Recent replays tracking
  private savedReplays: ReplaySave[] = [];
  private maxSavedReplays = 5;

  // Processing state
  private isProcessing = false;
  private processingPromise: Promise<ReplaySave> | null = null;

  constructor(config: Partial<ReplayBufferConfig> = {}) {
    this.config = {
      maxDurationSeconds: 30,
      videoCodec: 'h264',
      audioCodec: 'aac',
      outputFormat: 'mp4',
      videoBitrate: 5000,
      audioBitrate: 128,
      resolution: '1920x1080',
      frameRate: 30,
      ...config,
    };

    // Calculate max buffer size (approximately)
    // H264 at 5000kbps = 625KB/s, for 60 seconds = ~37.5MB
    this.maxBufferSize = this.config.maxBufferSize || (this.config.videoBitrate! * this.config.maxDurationSeconds * 1024) / 8;
  }

  /**
   * Start recording frames into the replay buffer
   */
  start(): void {
    if (this.isRecording) return;

    this.isRecording = true;
    this.bufferStartTime = Date.now();
    this.videoFrames = [];
    this.audioChunks = [];
    this.totalFrames = 0;
    this.totalAudioChunks = 0;
    this.currentBufferSize = 0;
    this.currentTimestamp = this.bufferStartTime;

    this.emit('buffer-started');
  }

  /**
   * Stop recording frames (clears buffer)
   */
  stop(): void {
    this.isRecording = false;
    this.emit('buffer-cleared');
  }

  /**
   * Add a video frame to the replay buffer
   */
  addFrame(frameData: Uint8Array, isKeyFrame: boolean = false, duration: number = 33): void {
    if (!this.isRecording) return;

    const frame: ReplayFrame = {
      data: frameData,
      timestamp: Date.now(),
      keyFrame: isKeyFrame,
      duration,
    };

    this.videoFrames.push(frame);
    this.currentBufferSize += frameData.byteLength;
    this.totalFrames++;
    this.currentTimestamp = frame.timestamp;

    // Trim old frames if buffer exceeds max size
    this.trimBuffer();

    this.emit('frame-added', { frameCount: this.totalFrames });
  }

  /**
   * Add audio chunk to the replay buffer
   */
  addAudioChunk(audioData: Float32Array, sampleRate: number = 48000): void {
    if (!this.isRecording) return;

    const chunk: ReplayAudioChunk = {
      data: audioData,
      timestamp: Date.now(),
      sampleRate,
    };

    this.audioChunks.push(chunk);
    this.currentBufferSize += audioData.byteLength;
    this.totalAudioChunks++;

    this.emit('audio-added', { audioChunkCount: this.totalAudioChunks });
  }

  /**
   * Trim buffer to remove old frames/audio when max size exceeded
   */
  private trimBuffer(): void {
    const maxDurationMs = this.config.maxDurationSeconds * 1000;
    const cutoffTime = Date.now() - maxDurationMs;

    // Remove old frames
    const initialFrameCount = this.videoFrames.length;
    this.videoFrames = this.videoFrames.filter((frame) => {
      if (frame.timestamp < cutoffTime) {
        this.currentBufferSize -= frame.data.byteLength;
        return false;
      }
      return true;
    });

    // Remove old audio chunks
    const initialAudioCount = this.audioChunks.length;
    this.audioChunks = this.audioChunks.filter((chunk) => {
      if (chunk.timestamp < cutoffTime) {
        this.currentBufferSize -= chunk.data.byteLength;
        return false;
      }
      return true;
    });

    // Also trim if still exceeding max size (aggressive trim)
    if (this.currentBufferSize > this.maxBufferSize && this.videoFrames.length > 0) {
      const framesToRemove = Math.floor(this.videoFrames.length * 0.1);
      const removedFrames = this.videoFrames.splice(0, framesToRemove);
      removedFrames.forEach(f => {
        this.currentBufferSize -= f.data.byteLength;
      });
    }
  }

  /**
   * Save replay buffer to disk as MP4
   * Returns the saved replay metadata
   */
  async saveReplay(durationSeconds?: number): Promise<ReplaySave> {
    if (this.isProcessing) {
      // Return existing processing promise
      return this.processingPromise!;
    }

    if (this.videoFrames.length === 0) {
      throw new Error('No frames in buffer to save');
    }

    this.isProcessing = true;
    this.emit('save-started');

    const processingPromise = this._performSave(durationSeconds);
    this.processingPromise = processingPromise;

    try {
      const replay = await processingPromise;
      this.emit('save-complete', replay);
      return replay;
    } catch (error) {
      this.emit('save-failed', error);
      throw error;
    } finally {
      this.isProcessing = false;
      this.processingPromise = null;
    }
  }

  /**
   * Internal: Perform the actual save operation
   */
  private async _performSave(durationSeconds?: number): Promise<ReplaySave> {
    const duration = durationSeconds || this.config.maxDurationSeconds;

    // Filter frames within the requested duration
    const now = Date.now();
    const cutoffTime = now - (duration * 1000);
    const selectedFrames = this.videoFrames.filter(f => f.timestamp >= cutoffTime);
    const selectedAudio = this.audioChunks.filter(a => a.timestamp >= cutoffTime);

    if (selectedFrames.length === 0) {
      throw new Error('No frames within requested duration');
    }

    // Create blob from frames (simplified - in production, use ffmpeg.wasm or libvpx)
    const videoBlob = await this._encodeVideoFrames(selectedFrames, duration);
    const audioBlob = selectedAudio.length > 0
      ? await this._encodeAudioChunks(selectedAudio)
      : new Blob();

    // Generate unique filename with timestamp
    const now_ms = Date.now();
    const timestamp = new Date(now_ms).toISOString().replace(/[:.]/g, '-');
    const filename = `replay_${timestamp}.${this.config.outputFormat}`;

    // Calculate file size
    const fileSize = videoBlob.size + audioBlob.size;

    // Create the replay metadata
    const replay: ReplaySave = {
      id: `replay_${now_ms}_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      filepath: `/replays/${filename}`,
      duration,
      fileSize,
      format: this.config.outputFormat,
      savedAt: new Date(),
      width: parseInt(this.config.resolution?.split('x')[0] || '1920'),
      height: parseInt(this.config.resolution?.split('x')[1] || '1080'),
      frameRate: this.config.frameRate || 30,
      bitrate: this.config.videoBitrate || 5000,
    };

    // Track this replay
    this.savedReplays.unshift(replay);

    // Clean up old replays (keep last 5)
    if (this.savedReplays.length > this.maxSavedReplays) {
      const oldReplays = this.savedReplays.splice(this.maxSavedReplays);
      await this._deleteReplays(oldReplays);
    }

    // Simulate saving to storage (in real implementation, send to server)
    await this._saveToStorage(replay, videoBlob, audioBlob);

    return replay;
  }

  /**
   * Encode video frames to blob (simplified version)
   * In production, use ffmpeg.wasm or Canvas API
   */
  private async _encodeVideoFrames(frames: ReplayFrame[], duration: number): Promise<Blob> {
    // This is a simplified implementation
    // In production, you'd use ffmpeg.wasm to encode H264
    const totalSize = frames.reduce((sum, f) => sum + f.data.byteLength, 0);
    return new Blob([...frames.map(f => f.data)], { type: 'video/mp4' });
  }

  /**
   * Encode audio chunks to blob
   */
  private async _encodeAudioChunks(chunks: ReplayAudioChunk[]): Promise<Blob> {
    // Simplified: combine audio chunks
    // In production, encode to AAC or Opus
    const audioData = chunks.map(c => c.data);
    return new Blob(audioData, { type: 'audio/aac' });
  }

  /**
   * Save replay blob to storage (localStorage or server)
   */
  private async _saveToStorage(replay: ReplaySave, videoBlob: Blob, audioBlob: Blob): Promise<void> {
    // Save to localStorage (limited by 5-50MB quota per domain)
    // In production, save to server or cloud storage
    try {
      const replayBlob = new Blob([videoBlob, audioBlob], { type: `video/${replay.format}` });
      const url = URL.createObjectURL(replayBlob);

      // Store metadata in localStorage
      const metadata = {
        ...replay,
        dataUrl: url, // This persists only during the session
      };

      const replays = JSON.parse(localStorage.getItem('replay_buffer_saves') || '[]');
      replays.push({ ...replay, dataUrl: url });
      localStorage.setItem('replay_buffer_saves', JSON.stringify(replays));

      // In production, POST to server: POST /api/replays/save
    } catch (error) {
      console.error('Failed to save replay to storage:', error);
      // Fallback: create download link
    }
  }

  /**
   * Delete old replays
   */
  private async _deleteReplays(replays: ReplaySave[]): Promise<void> {
    for (const replay of replays) {
      try {
        // In production: DELETE /api/replays/{id}
        localStorage.removeItem(replay.id);
      } catch (error) {
        console.error(`Failed to delete replay ${replay.id}:`, error);
      }
    }
  }

  /**
   * Get list of recent replays
   */
  getSavedReplays(): ReplaySave[] {
    return [...this.savedReplays];
  }

  /**
   * Get current buffer status
   */
  getStatus(): ReplayBufferStatus {
    const currentDuration = this.isRecording && this.videoFrames.length > 0
      ? (this.currentTimestamp - this.videoFrames[0].timestamp) / 1000
      : 0;

    return {
      isRecording: this.isRecording,
      currentDuration,
      bufferSize: this.currentBufferSize,
      frameCount: this.totalFrames,
      audioChunkCount: this.totalAudioChunks,
      lastFrameTime: this.currentTimestamp,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Delete a specific replay
   */
  async deleteReplay(replayId: string): Promise<void> {
    this.savedReplays = this.savedReplays.filter(r => r.id !== replayId);

    // In production: DELETE /api/replays/{replayId}
    try {
      localStorage.removeItem(replayId);
    } catch (error) {
      console.error(`Failed to delete replay ${replayId}:`, error);
    }
  }

  /**
   * Download replay file
   */
  async downloadReplay(replayId: string): Promise<void> {
    const replay = this.savedReplays.find(r => r.id === replayId);
    if (!replay) throw new Error('Replay not found');

    try {
      // In production: GET /api/replays/{replayId}/download
      const metadata = JSON.parse(localStorage.getItem('replay_buffer_saves') || '[]');
      const replayData = metadata.find((r: any) => r.id === replayId);

      if (replayData?.dataUrl) {
        const a = document.createElement('a');
        a.href = replayData.dataUrl;
        a.download = replay.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download replay:', error);
      throw error;
    }
  }

  /**
   * Subscribe to buffer events
   */
  on(event: ReplayEvent, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from buffer events
   */
  off(event: ReplayEvent, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  /**
   * Emit buffer events
   */
  private emit(event: ReplayEvent, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.videoFrames = [];
    this.audioChunks = [];
    this.currentBufferSize = 0;
    this.totalFrames = 0;
    this.totalAudioChunks = 0;
  }

  /**
   * Destroy the buffer (cleanup)
   */
  destroy(): void {
    this.stop();
    this.clear();
    this.listeners.clear();
  }
}
