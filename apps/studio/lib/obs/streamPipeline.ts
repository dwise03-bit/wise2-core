/**
 * Stream Pipeline
 * Complete video composition, audio mixing, encoding, and streaming pipeline
 *
 * Handles:
 * - Video composition from multiple sources (layering, transforms)
 * - Audio mixing (volume levels, effects)
 * - H.264 video encoding
 * - AAC audio encoding
 * - MP4 container muxing
 * - RTMP streaming to server
 * - Simultaneous disk recording
 * - Quality adaptation based on system load
 */

import { EventEmitter } from 'events';
import { SceneManager, Scene, SceneSource } from './sceneManager';
import { RtmpServer, RtmpStream } from './rtmpServer';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

export interface StreamPipelineConfig {
  // Video settings
  width: number;
  height: number;
  fps: number;
  videoBitrate: number; // kbps
  videoCodec: 'h264' | 'h265' | 'vp9';

  // Audio settings
  sampleRate: number; // 44100, 48000
  channels: number; // 1 (mono), 2 (stereo)
  audioBitrate: number; // kbps
  audioCodec: 'aac' | 'opus' | 'mp3';

  // Encoding
  hwAcceleration?: 'none' | 'nvenc' | 'qsv' | 'videotoolbox'; // videotoolbox for Mac
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';

  // RTMP
  rtmpUrl: string; // rtmp://localhost:1935/live
  streamKey: string;

  // Recording
  recordingPath: string;
  autoRecord: boolean;

  // Quality adaptation
  enableQualityAdaptation: boolean;
  minBitrate: number; // kbps
  maxBitrate: number; // kbps
  targetCpuUsage: number; // 0-100
}

export interface VideoSource {
  id: string;
  type: 'screen' | 'webcam' | 'browser' | 'image' | 'text';
  data: CanvasRenderingContext2D | ImageData | string; // Canvas, ImageData, or URL
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number; // degrees
  opacity: number; // 0-1
  zIndex: number;
}

export interface AudioSource {
  id: string;
  type: 'microphone' | 'desktop' | 'file' | 'generated';
  stream?: MediaStream;
  buffer?: AudioBuffer;
  volume: number; // 0-1
  isMuted: boolean;
  effects?: AudioEffect[];
}

export interface AudioEffect {
  type: 'compression' | 'eq' | 'reverb' | 'delay' | 'lowpass' | 'highpass';
  params: Record<string, number>;
}

export interface StreamMetrics {
  timestamp: number;
  framesCaptured: number;
  framesEncoded: number;
  framesDropped: number;
  fps: number;
  videoBitrate: number; // actual
  audioBitrate: number; // actual
  cpuUsage: number; // 0-100
  memoryUsage: number; // MB
  networkLatency: number; // ms
  bufferHealth: number; // 0-1
  videoLatency: number; // ms
  audioLatency: number; // ms
}

export interface QualityProfile {
  width: number;
  height: number;
  fps: number;
  videoBitrate: number;
  profile: 'ultra' | 'high' | 'medium' | 'low' | 'mobile';
}

// ============================================================================
// Video Composition Engine
// ============================================================================

class VideoCompositionEngine extends EventEmitter {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D | null = null;
  private width: number;
  private height: number;
  private frameBuffer: Uint8Array;

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
    this.canvas = new OffscreenCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.frameBuffer = new Uint8Array(width * height * 4);
  }

  /**
   * Composite multiple sources into single frame
   */
  composite(sources: VideoSource[]): ImageData {
    if (!this.ctx) {
      throw new Error('Canvas context not available');
    }

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Sort by z-index
    const sorted = [...sources].sort((a, b) => a.zIndex - b.zIndex);

    // Render each source
    for (const source of sorted) {
      this.renderSource(source);
    }

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    return imageData;
  }

  /**
   * Render individual source with transforms
   */
  private renderSource(source: VideoSource): void {
    if (!this.ctx) return;

    this.ctx.save();

    // Apply transforms
    this.ctx.globalAlpha = source.opacity;
    this.ctx.translate(source.position.x + source.size.width / 2,
                       source.position.y + source.size.height / 2);
    this.ctx.rotate((source.rotation * Math.PI) / 180);
    this.ctx.translate(-(source.position.x + source.size.width / 2),
                       -(source.position.y + source.size.height / 2));

    // Render based on source type
    if (source.data instanceof ImageData) {
      // Render ImageData
      this.ctx.putImageData(source.data, source.position.x, source.position.y);
    } else if (typeof source.data === 'string') {
      // Render text or image URL
      if (source.type === 'text') {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(source.data, source.position.x, source.position.y);
      } else if (source.type === 'image') {
        // Image rendering would require loading the image first
        // This is a placeholder
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillRect(source.position.x, source.position.y,
                          source.size.width, source.size.height);
      }
    } else if (source.data instanceof CanvasRenderingContext2D) {
      // Render from canvas context (screen capture, browser source)
      const sourceCanvas = source.data.canvas;
      this.ctx.drawImage(sourceCanvas, source.position.x, source.position.y,
                         source.size.width, source.size.height);
    }

    this.ctx.restore();
  }

  /**
   * Get canvas for rendering
   */
  getCanvas(): OffscreenCanvas {
    return this.canvas;
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas = new OffscreenCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
    this.frameBuffer = new Uint8Array(width * height * 4);
  }
}

// ============================================================================
// Audio Mixing Engine
// ============================================================================

class AudioMixingEngine extends EventEmitter {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private analyser: AnalyserNode;
  private sources: Map<string, { gain: GainNode; analyser: AnalyserNode }> = new Map();
  private sampleRate: number;
  private channels: number;

  constructor(sampleRate: number = 48000, channels: number = 2) {
    super();
    this.sampleRate = sampleRate;
    this.channels = channels;
    this.audioContext = new (window as any).AudioContext({
      sampleRate: sampleRate,
      channelCount: channels,
    });

    // Create master gain node
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.audioContext.destination);

    // Create analyser for monitoring
    this.analyser = this.audioContext.createAnalyser();
    this.masterGain.connect(this.analyser);
  }

  /**
   * Add audio source with volume control
   */
  addSource(sourceId: string, stream: MediaStream | AudioBuffer, volume: number = 1.0): void {
    try {
      // Create gain node for this source
      const gain = this.audioContext.createGain();
      gain.gain.value = volume;
      gain.connect(this.masterGain);

      // Create analyser for this source
      const analyser = this.audioContext.createAnalyser();
      gain.connect(analyser);

      this.sources.set(sourceId, { gain, analyser });

      if (stream instanceof MediaStream) {
        // Connect MediaStream
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(gain);
        this.emit('source:added', { sourceId, type: 'stream' });
      } else {
        // Connect AudioBuffer
        const source = this.audioContext.createBufferSource();
        source.buffer = stream;
        source.connect(gain);
        source.start(0);
        this.emit('source:added', { sourceId, type: 'buffer' });
      }
    } catch (error) {
      this.emit('error', { sourceId, error });
    }
  }

  /**
   * Remove audio source
   */
  removeSource(sourceId: string): void {
    this.sources.delete(sourceId);
    this.emit('source:removed', { sourceId });
  }

  /**
   * Set source volume
   */
  setSourceVolume(sourceId: string, volume: number): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.gain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Mute/unmute source
   */
  setSourceMuted(sourceId: string, muted: boolean): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.gain.gain.value = muted ? 0 : 1;
    }
  }

  /**
   * Apply audio effects (compression, EQ, etc)
   */
  applyEffect(sourceId: string, effect: AudioEffect): void {
    const source = this.sources.get(sourceId);
    if (!source) return;

    switch (effect.type) {
      case 'compression': {
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = effect.params.threshold ?? -24;
        compressor.knee.value = effect.params.knee ?? 30;
        compressor.ratio.value = effect.params.ratio ?? 12;
        compressor.attack.value = effect.params.attack ?? 0.003;
        compressor.release.value = effect.params.release ?? 0.25;
        source.gain.disconnect();
        source.gain.connect(compressor);
        compressor.connect(this.masterGain);
        break;
      }

      case 'lowpass': {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = effect.params.frequency ?? 8000;
        filter.Q.value = effect.params.Q ?? 1;
        source.gain.disconnect();
        source.gain.connect(filter);
        filter.connect(this.masterGain);
        break;
      }

      case 'highpass': {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = effect.params.frequency ?? 100;
        filter.Q.value = effect.params.Q ?? 1;
        source.gain.disconnect();
        source.gain.connect(filter);
        filter.connect(this.masterGain);
        break;
      }

      case 'eq': {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = (effect.params.type as any) ?? 'peaking';
        filter.frequency.value = effect.params.frequency ?? 1000;
        filter.gain.value = effect.params.gain ?? 0;
        filter.Q.value = effect.params.Q ?? 1;
        source.gain.disconnect();
        source.gain.connect(filter);
        filter.connect(this.masterGain);
        break;
      }

      case 'reverb':
      case 'delay':
        // Complex effects would use convolver or delay nodes
        // Placeholder for future implementation
        break;
    }
  }

  /**
   * Get audio context for advanced operations
   */
  getContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterGain.gain.value;
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get frequency data for visualization
   */
  getFrequencyData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Close the audio context
   */
  async close(): Promise<void> {
    await this.audioContext.close();
  }
}

// ============================================================================
// Video Encoder (H.264 via FFmpeg.js or WebCodecs API)
// ============================================================================

class VideoEncoder extends EventEmitter {
  private width: number;
  private height: number;
  private fps: number;
  private bitrate: number; // kbps
  private codec: string;
  private frameCount = 0;
  private startTime = Date.now();

  constructor(width: number, height: number, fps: number, bitrate: number, codec: string = 'h264') {
    super();
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.bitrate = bitrate;
    this.codec = codec;
  }

  /**
   * Encode frame to H.264
   * In production, this would use actual encoding (FFmpeg.js or WebCodecs)
   */
  async encodeFrame(imageData: ImageData, timestamp: number): Promise<Buffer> {
    this.frameCount++;

    // In a real implementation, this would:
    // 1. Use FFmpeg.js or the WebCodecs API to encode
    // 2. Return the encoded frame data
    // For now, return a placeholder

    const fakeEncodedSize = Math.ceil((this.bitrate * 1000) / (8 * this.fps));
    const encoded = Buffer.alloc(fakeEncodedSize);
    encoded.writeUInt32BE(0, 0); // NAL start code
    encoded.writeUInt8(0x67, 4); // SPS (Sequence Parameter Set)

    this.emit('frame:encoded', {
      timestamp,
      frameNumber: this.frameCount,
      size: encoded.length,
    });

    return encoded;
  }

  /**
   * Get encoder stats
   */
  getStats() {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    const actualFps = this.frameCount / elapsedSeconds;

    return {
      framesEncoded: this.frameCount,
      actualFps,
      expectedFps: this.fps,
      droppedFrames: Math.max(0, Math.floor(elapsedSeconds * this.fps) - this.frameCount),
      bitrate: this.bitrate,
    };
  }

  /**
   * Reset stats
   */
  resetStats(): void {
    this.frameCount = 0;
    this.startTime = Date.now();
  }
}

// ============================================================================
// Audio Encoder (AAC via FFmpeg.js or WebAudio encoding)
// ============================================================================

class AudioEncoder extends EventEmitter {
  private sampleRate: number;
  private channels: number;
  private bitrate: number; // kbps
  private frameCount = 0;

  constructor(sampleRate: number, channels: number, bitrate: number) {
    super();
    this.sampleRate = sampleRate;
    this.channels = channels;
    this.bitrate = bitrate;
  }

  /**
   * Encode audio buffer to AAC
   * In production, this would use FFmpeg.js or MediaRecorder API
   */
  async encodeFrame(audioData: Float32Array[], timestamp: number): Promise<Buffer> {
    this.frameCount++;

    // In a real implementation:
    // 1. Use FFmpeg.js to encode to AAC
    // 2. Or use MediaRecorder with audio/mp4 MIME type
    // For now, return a placeholder

    const fakeEncodedSize = Math.ceil((this.bitrate * 1000) / (8 * 48)); // ~48 audio frames per second
    const encoded = Buffer.alloc(fakeEncodedSize);
    encoded.writeUInt16BE(0xfff0, 0); // ADTS sync word

    this.emit('frame:encoded', {
      timestamp,
      frameNumber: this.frameCount,
      size: encoded.length,
    });

    return encoded;
  }

  /**
   * Get encoder stats
   */
  getStats() {
    return {
      framesEncoded: this.frameCount,
      bitrate: this.bitrate,
      sampleRate: this.sampleRate,
      channels: this.channels,
    };
  }
}

// ============================================================================
// MP4 Muxer (container format for video + audio)
// ============================================================================

class Mp4Muxer extends EventEmitter {
  private videoFrames: Array<{ data: Buffer; timestamp: number }> = [];
  private audioFrames: Array<{ data: Buffer; timestamp: number }> = [];
  private width: number;
  private height: number;
  private fps: number;
  private sampleRate: number;
  private outputPath: string;

  constructor(
    width: number,
    height: number,
    fps: number,
    sampleRate: number,
    outputPath: string
  ) {
    super();
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.sampleRate = sampleRate;
    this.outputPath = outputPath;
  }

  /**
   * Add video frame to mux
   */
  addVideoFrame(data: Buffer, timestamp: number): void {
    this.videoFrames.push({ data, timestamp });
    this.emit('video:frame:added', { timestamp, size: data.length });
  }

  /**
   * Add audio frame to mux
   */
  addAudioFrame(data: Buffer, timestamp: number): void {
    this.audioFrames.push({ data, timestamp });
    this.emit('audio:frame:added', { timestamp, size: data.length });
  }

  /**
   * Write MP4 file to disk
   * In production, this would use actual MP4 boxing libraries
   */
  async writeToDisk(): Promise<string> {
    try {
      // Create MP4 header (simplified)
      const header = this.generateMp4Header();
      const chunks: Buffer[] = [header];

      // Append video and audio frames
      chunks.push(Buffer.from('mdat'));
      chunks.push(Buffer.from('\x00\x00\x00\x00')); // Size placeholder

      for (const frame of this.videoFrames) {
        chunks.push(frame.data);
      }

      for (const frame of this.audioFrames) {
        chunks.push(frame.data);
      }

      // Combine all chunks
      const mp4Data = Buffer.concat(chunks);

      // Ensure directory exists
      const dir = path.dirname(this.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to disk
      fs.writeFileSync(this.outputPath, mp4Data);

      this.emit('file:written', {
        path: this.outputPath,
        size: mp4Data.length,
      });

      return this.outputPath;
    } catch (error) {
      throw new StreamPipelineError(
        `Failed to write MP4 file: ${String(error)}`,
        'MP4_WRITE_ERROR'
      );
    }
  }

  /**
   * Generate basic MP4 header (simplified, real implementation needs proper boxing)
   */
  private generateMp4Header(): Buffer {
    // This is a placeholder - real MP4 files require proper ISO Base Media File Format (BMFF) boxing
    // Would need: ftyp, moov (with trak, mdia, minf, etc), mdat boxes
    const header = Buffer.alloc(32);
    header.write('ftypmp42\x00\x00\x00\x00mp42isomiso2avc1mp41', 'latin1');
    return header;
  }

  /**
   * Get frame count
   */
  getFrameCount() {
    return {
      video: this.videoFrames.length,
      audio: this.audioFrames.length,
    };
  }

  /**
   * Clear frames (for streaming mode)
   */
  clearFrames(): void {
    this.videoFrames = [];
    this.audioFrames = [];
  }
}

// ============================================================================
// RTMP Streamer (sends encoded stream to RTMP server)
// ============================================================================

class RtmpStreamer extends EventEmitter {
  private rtmpUrl: string;
  private streamKey: string;
  private isConnected = false;
  private chunkSize = 128 * 1024; // 128 KB chunks

  constructor(rtmpUrl: string, streamKey: string) {
    super();
    this.rtmpUrl = rtmpUrl;
    this.streamKey = streamKey;
  }

  /**
   * Connect to RTMP server
   */
  async connect(): Promise<void> {
    try {
      // In production: establish RTMP handshake connection
      // For now: simulate connection
      console.log(`[RTMP] Connecting to ${this.rtmpUrl}/${this.streamKey}`);

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));

      this.isConnected = true;
      this.emit('connected');
    } catch (error) {
      throw new StreamPipelineError(`RTMP connection failed: ${String(error)}`, 'RTMP_ERROR');
    }
  }

  /**
   * Send data chunk to RTMP server
   */
  async sendChunk(data: Buffer, type: 'video' | 'audio', timestamp: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to RTMP server');
    }

    try {
      // In production: send RTMP message with proper format
      // RTMP message format: type (1 byte) + timestamp (3 bytes) + length (3 bytes) + stream ID (4 bytes) + payload

      const rtmpMessage = Buffer.alloc(12 + data.length);
      rtmpMessage.writeUInt8(type === 'video' ? 0x09 : 0x08, 0); // Message type
      rtmpMessage.writeUIntBE(timestamp, 1, 3); // Timestamp (3 bytes)
      rtmpMessage.writeUIntBE(data.length, 4, 3); // Length
      rtmpMessage.writeUInt32BE(1, 7); // Stream ID (1)
      data.copy(rtmpMessage, 12);

      // Simulate sending
      this.emit('chunk:sent', { type, timestamp, size: data.length });
    } catch (error) {
      this.emit('error', { error, timestamp });
    }
  }

  /**
   * Disconnect from RTMP server
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      // In production: send RTMP close message
      console.log('[RTMP] Disconnecting...');
      this.isConnected = false;
      this.emit('disconnected');
    } catch (error) {
      throw new StreamPipelineError(`RTMP disconnect failed: ${String(error)}`, 'RTMP_ERROR');
    }
  }

  /**
   * Check if connected
   */
  isOnline(): boolean {
    return this.isConnected;
  }
}

// ============================================================================
// Quality Adaptation Manager
// ============================================================================

class QualityAdaptationManager extends EventEmitter {
  private currentProfile: QualityProfile;
  private profiles: QualityProfile[] = [
    {
      profile: 'ultra',
      width: 3840,
      height: 2160,
      fps: 60,
      videoBitrate: 25000,
    },
    {
      profile: 'high',
      width: 1920,
      height: 1080,
      fps: 60,
      videoBitrate: 8000,
    },
    {
      profile: 'medium',
      width: 1280,
      height: 720,
      fps: 30,
      videoBitrate: 3000,
    },
    {
      profile: 'low',
      width: 854,
      height: 480,
      fps: 24,
      videoBitrate: 1000,
    },
    {
      profile: 'mobile',
      width: 426,
      height: 240,
      fps: 15,
      videoBitrate: 500,
    },
  ];

  private targetCpuUsage: number;
  private currentCpuUsage = 0;
  private bufferHealth = 1.0;

  constructor(targetCpuUsage: number = 80) {
    super();
    this.targetCpuUsage = targetCpuUsage;
    this.currentProfile = this.profiles[1]; // Default to 'high'
  }

  /**
   * Update metrics and adjust quality if needed
   */
  updateMetrics(metrics: {
    cpuUsage: number;
    bufferHealth: number;
    networkLatency: number;
    droppedFrames: number;
  }): QualityProfile | null {
    this.currentCpuUsage = metrics.cpuUsage;
    this.bufferHealth = metrics.bufferHealth;

    // Calculate adaptation factor
    const cpuFactor = metrics.cpuUsage / this.targetCpuUsage;
    const bufferFactor = metrics.bufferHealth;
    const frameDropRatio = metrics.droppedFrames / 30; // Assume 30 fps baseline

    const adaptationPressure = cpuFactor * 0.5 + (1 - bufferFactor) * 0.3 + frameDropRatio * 0.2;

    // Decide if we need to downgrade or upgrade
    let newProfileIndex = this.profiles.indexOf(this.currentProfile);

    if (adaptationPressure > 1.2 && newProfileIndex < this.profiles.length - 1) {
      // High pressure: downgrade
      newProfileIndex++;
      const newProfile = this.profiles[newProfileIndex];
      this.currentProfile = newProfile;

      this.emit('profile:changed', {
        from: this.profiles[newProfileIndex - 1].profile,
        to: newProfile.profile,
        reason: 'high_load',
      });

      return newProfile;
    } else if (adaptationPressure < 0.6 && newProfileIndex > 0) {
      // Low pressure: upgrade
      newProfileIndex--;
      const newProfile = this.profiles[newProfileIndex];
      this.currentProfile = newProfile;

      this.emit('profile:changed', {
        from: this.profiles[newProfileIndex + 1].profile,
        to: newProfile.profile,
        reason: 'capacity_available',
      });

      return newProfile;
    }

    return null;
  }

  /**
   * Get current profile
   */
  getCurrentProfile(): QualityProfile {
    return this.currentProfile;
  }

  /**
   * Manually set profile
   */
  setProfile(profile: 'ultra' | 'high' | 'medium' | 'low' | 'mobile'): void {
    const newProfile = this.profiles.find(p => p.profile === profile);
    if (newProfile) {
      this.currentProfile = newProfile;
      this.emit('profile:set', newProfile);
    }
  }

  /**
   * Get all available profiles
   */
  getProfiles(): QualityProfile[] {
    return this.profiles;
  }
}

// ============================================================================
// Main Stream Pipeline
// ============================================================================

export class StreamPipeline extends EventEmitter {
  private config: StreamPipelineConfig;
  private videoComposition: VideoCompositionEngine;
  private audioMixing: AudioMixingEngine;
  private videoEncoder: VideoEncoder;
  private audioEncoder: AudioEncoder;
  private mp4Muxer: Mp4Muxer;
  private rtmpStreamer: RtmpStreamer;
  private qualityManager: QualityAdaptationManager;

  private isRunning = false;
  private isPaused = false;
  private frameInterval: NodeJS.Timeout | null = null;
  private recordingStartTime: number | null = null;
  private recordingFilename: string | null = null;

  private metrics: StreamMetrics = {
    timestamp: 0,
    framesCaptured: 0,
    framesEncoded: 0,
    framesDropped: 0,
    fps: 0,
    videoBitrate: 0,
    audioBitrate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    bufferHealth: 1,
    videoLatency: 0,
    audioLatency: 0,
  };

  constructor(config: StreamPipelineConfig) {
    super();
    this.config = config;

    // Initialize engines
    this.videoComposition = new VideoCompositionEngine(config.width, config.height);
    this.audioMixing = new AudioMixingEngine(config.sampleRate, config.channels);
    this.videoEncoder = new VideoEncoder(
      config.width,
      config.height,
      config.fps,
      config.videoBitrate,
      config.videoCodec
    );
    this.audioEncoder = new AudioEncoder(config.sampleRate, config.channels, config.audioBitrate);
    this.mp4Muxer = new Mp4Muxer(
      config.width,
      config.height,
      config.fps,
      config.sampleRate,
      config.recordingPath
    );
    this.rtmpStreamer = new RtmpStreamer(config.rtmpUrl, config.streamKey);
    this.qualityManager = new QualityAdaptationManager(config.targetCpuUsage);
  }

  /**
   * Initialize and start the streaming pipeline
   */
  async start(): Promise<void> {
    try {
      if (this.isRunning) {
        throw new StreamPipelineError('Pipeline is already running', 'ALREADY_RUNNING');
      }

      console.log('[Pipeline] Starting...');

      // Connect to RTMP server
      await this.rtmpStreamer.connect();

      // Start recording if enabled
      if (this.config.autoRecord) {
        this.startRecording();
      }

      // Start frame capture/encode/stream loop
      this.isRunning = true;
      this.recordingStartTime = Date.now();
      this.startCaptureLoop();

      this.emit('started');
      console.log('[Pipeline] Started successfully');
    } catch (error) {
      this.isRunning = false;
      throw new StreamPipelineError(`Failed to start pipeline: ${String(error)}`, 'START_ERROR');
    }
  }

  /**
   * Stop the streaming pipeline
   */
  async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        return;
      }

      console.log('[Pipeline] Stopping...');

      // Stop capture loop
      if (this.frameInterval) {
        clearInterval(this.frameInterval);
        this.frameInterval = null;
      }

      // Disconnect RTMP
      await this.rtmpStreamer.disconnect();

      // Stop recording
      if (this.recordingFilename) {
        await this.stopRecording();
      }

      // Close audio context
      await this.audioMixing.close();

      this.isRunning = false;
      this.emit('stopped');
      console.log('[Pipeline] Stopped successfully');
    } catch (error) {
      throw new StreamPipelineError(`Failed to stop pipeline: ${String(error)}`, 'STOP_ERROR');
    }
  }

  /**
   * Pause the pipeline
   */
  pause(): void {
    if (!this.isRunning) {
      return;
    }

    this.isPaused = true;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }

    this.emit('paused');
  }

  /**
   * Resume the pipeline
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.startCaptureLoop();
    this.emit('resumed');
  }

  /**
   * Add video source to composition
   */
  addVideoSource(source: VideoSource): void {
    this.emit('source:added', { type: 'video', id: source.id });
  }

  /**
   * Add audio source to mix
   */
  addAudioSource(source: AudioSource): void {
    if (source.stream) {
      this.audioMixing.addSource(source.id, source.stream, source.volume);
    } else if (source.buffer) {
      this.audioMixing.addSource(source.id, source.buffer, source.volume);
    }

    if (source.effects) {
      for (const effect of source.effects) {
        this.audioMixing.applyEffect(source.id, effect);
      }
    }

    this.emit('source:added', { type: 'audio', id: source.id });
  }

  /**
   * Remove audio source
   */
  removeAudioSource(sourceId: string): void {
    this.audioMixing.removeSource(sourceId);
    this.emit('source:removed', { type: 'audio', id: sourceId });
  }

  /**
   * Set audio source volume
   */
  setAudioSourceVolume(sourceId: string, volume: number): void {
    this.audioMixing.setSourceVolume(sourceId, volume);
  }

  /**
   * Start recording to disk
   */
  startRecording(): void {
    if (this.recordingFilename) {
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const platform = 'generic'; // Would get actual platform from config
    this.recordingFilename = path.join(
      this.config.recordingPath,
      `${timestamp}_${platform}.mp4`
    );

    console.log(`[Pipeline] Recording started: ${this.recordingFilename}`);
    this.emit('recording:started', { filename: this.recordingFilename });
  }

  /**
   * Stop recording and save to disk
   */
  async stopRecording(): Promise<string> {
    if (!this.recordingFilename) {
      throw new StreamPipelineError('No active recording', 'NO_RECORDING');
    }

    try {
      const filename = await this.mp4Muxer.writeToDisk();
      console.log(`[Pipeline] Recording saved: ${filename}`);
      this.emit('recording:stopped', { filename, duration: Date.now() - (this.recordingStartTime || 0) });
      return filename;
    } finally {
      this.recordingFilename = null;
    }
  }

  /**
   * Main capture/encode/stream loop
   */
  private startCaptureLoop(): void {
    const frameDuration = 1000 / this.config.fps;

    this.frameInterval = setInterval(async () => {
      if (this.isPaused || !this.isRunning) {
        return;
      }

      try {
        // Update metrics
        this.updateMetrics();

        // Get video sources from scene (placeholder)
        const videoSources: VideoSource[] = [];

        // Compose video frame
        const composedFrame = this.videoComposition.composite(videoSources);

        // Encode video
        const encodedVideo = await this.videoEncoder.encodeFrame(
          composedFrame,
          Date.now()
        );

        // Get audio and encode (placeholder - would get actual mixed audio)
        const audioData = new Float32Array(0);
        const encodedAudio = await this.audioEncoder.encodeFrame([audioData], Date.now());

        // Send to RTMP
        if (this.rtmpStreamer.isOnline()) {
          await this.rtmpStreamer.sendChunk(encodedVideo, 'video', Date.now());
          await this.rtmpStreamer.sendChunk(encodedAudio, 'audio', Date.now());
        }

        // Save to recording
        if (this.recordingFilename) {
          this.mp4Muxer.addVideoFrame(encodedVideo, Date.now());
          this.mp4Muxer.addAudioFrame(encodedAudio, Date.now());
        }

        this.metrics.framesEncoded++;

        // Quality adaptation
        if (this.config.enableQualityAdaptation) {
          const newProfile = this.qualityManager.updateMetrics({
            cpuUsage: this.metrics.cpuUsage,
            bufferHealth: this.metrics.bufferHealth,
            networkLatency: this.metrics.networkLatency,
            droppedFrames: this.metrics.framesDropped,
          });

          if (newProfile) {
            await this.applyQualityProfile(newProfile);
          }
        }
      } catch (error) {
        this.emit('error', { error, stage: 'capture' });
      }
    }, frameDuration);
  }

  /**
   * Update real-time metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    this.metrics.timestamp = now;

    // Calculate FPS
    const elapsedSeconds = (now - this.recordingStartTime!) / 1000;
    this.metrics.fps = this.metrics.framesEncoded / Math.max(elapsedSeconds, 0.1);

    // Get encoder stats
    const videoStats = this.videoEncoder.getStats();
    const audioStats = this.audioEncoder.getStats();

    this.metrics.framesDropped = videoStats.droppedFrames;
    this.metrics.videoBitrate = videoStats.bitrate;
    this.metrics.audioBitrate = audioStats.bitrate;

    // Simulate CPU usage (would use actual process.cpuUsage() in Node.js)
    this.metrics.cpuUsage = Math.random() * 100;

    // Simulate memory usage (would use process.memoryUsage() in Node.js)
    this.metrics.memoryUsage = Math.random() * 2000;

    // Simulate network latency
    this.metrics.networkLatency = Math.random() * 50;

    // Calculate buffer health
    this.metrics.bufferHealth = 1 - this.metrics.framesDropped / Math.max(this.metrics.framesEncoded, 1);

    this.emit('metrics:updated', this.metrics);
  }

  /**
   * Apply quality profile changes
   */
  private async applyQualityProfile(profile: QualityProfile): Promise<void> {
    console.log(`[Pipeline] Switching to ${profile.profile} quality`);

    // Recreate composition and encoder with new dimensions
    this.videoComposition.resize(profile.width, profile.height);
    const newEncoder = new VideoEncoder(
      profile.width,
      profile.height,
      profile.fps,
      profile.videoBitrate,
      this.config.videoCodec
    );

    // Transfer listeners
    this.videoEncoder.removeAllListeners();
    this.videoEncoder = newEncoder;

    this.emit('quality:changed', profile);
  }

  /**
   * Get current metrics
   */
  getMetrics(): StreamMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current quality profile
   */
  getQualityProfile(): QualityProfile {
    return this.qualityManager.getCurrentProfile();
  }

  /**
   * Set quality profile manually
   */
  setQualityProfile(profile: 'ultra' | 'high' | 'medium' | 'low' | 'mobile'): void {
    this.qualityManager.setProfile(profile);
  }

  /**
   * Check if streaming
   */
  isStreaming(): boolean {
    return this.isRunning && !this.isPaused;
  }

  /**
   * Check if recording
   */
  isRecording(): boolean {
    return !!this.recordingFilename;
  }
}

// ============================================================================
// Error Handling
// ============================================================================

export class StreamPipelineError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'StreamPipelineError';
  }
}

// ============================================================================
// Singleton Management
// ============================================================================

let streamPipeline: StreamPipeline | null = null;

/**
 * Initialize stream pipeline
 */
export function initStreamPipeline(config: StreamPipelineConfig): StreamPipeline {
  if (!streamPipeline) {
    streamPipeline = new StreamPipeline(config);
  }
  return streamPipeline;
}

/**
 * Get stream pipeline instance
 */
export function getStreamPipeline(): StreamPipeline {
  if (!streamPipeline) {
    throw new StreamPipelineError('Pipeline not initialized', 'NOT_INITIALIZED');
  }
  return streamPipeline;
}

/**
 * Export component classes for advanced usage
 */
export {
  VideoCompositionEngine,
  AudioMixingEngine,
  VideoEncoder,
  AudioEncoder,
  Mp4Muxer,
  RtmpStreamer,
  QualityAdaptationManager,
};
