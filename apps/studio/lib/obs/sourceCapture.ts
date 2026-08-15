/**
 * Source Capture & Composition
 * Handles capture of screen, webcam, browser windows, and audio mixing
 *
 * Composes multiple sources into single video/audio stream
 */

import { EventEmitter } from 'events';

export type CaptureSourceType = 'screen' | 'webcam' | 'browser' | 'audio' | 'window' | 'media';

export interface ScreenCaptureOptions {
  displayId?: string;
  cursor?: 'always' | 'motion' | 'never';
  audioCapture?: boolean;
}

export interface WebcamCaptureOptions {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  mirror?: boolean;
}

export interface BrowserSourceOptions {
  url: string;
  width?: number;
  height?: number;
  fps?: number;
  audioCapture?: boolean;
  css?: string;
}

export interface AudioMixOptions {
  masterVolume?: number; // 0-100
  sampleRate?: number; // 44100, 48000, etc
  channels?: number; // 1 (mono), 2 (stereo)
}

export interface CaptureSource {
  id: string;
  type: CaptureSourceType;
  name: string;
  isActive: boolean;
  isVisible: boolean;
  volume?: number; // for audio sources
  properties?: Record<string, any>;
}

export interface CompositionFrame {
  timestamp: number;
  width: number;
  height: number;
  frameBuffer: ArrayBuffer;
  metadata?: {
    fps: number;
    bitrate: number;
    droppedFrames: number;
  };
}

/**
 * Screen Capture Handler
 * Uses Screen Capture API (browser) or native screen capture
 */
export class ScreenCaptureSource extends EventEmitter {
  private stream: MediaStream | null = null;
  private isCapturing = false;
  private options: Required<ScreenCaptureOptions>;

  constructor(options?: ScreenCaptureOptions) {
    super();
    this.options = {
      displayId: options?.displayId || '',
      cursor: options?.cursor || 'motion',
      audioCapture: options?.audioCapture || false,
    };
  }

  /**
   * Start screen capture
   */
  async start(): Promise<MediaStream> {
    if (this.isCapturing) {
      throw new SourceCaptureError('Screen capture already active', 'ALREADY_CAPTURING');
    }

    try {
      // Use native screen capture API
      const constraints: any = {
        video: {
          cursor: this.options.cursor,
          displaySurface: this.options.displayId ? 'monitor' : 'window',
        },
        audio: this.options.audioCapture,
      };

      this.stream = await (navigator as any).mediaDevices.getDisplayMedia(constraints);
      this.isCapturing = true;

      this.stream.getTracks().forEach(track => {
        track.onended = () => {
          this.isCapturing = false;
          this.emit('stopped');
        };
      });

      this.emit('started', this.stream);
      return this.stream;
    } catch (error) {
      throw new SourceCaptureError(
        `Screen capture failed: ${String(error)}`,
        'CAPTURE_FAILED'
      );
    }
  }

  /**
   * Stop screen capture
   */
  async stop(): Promise<void> {
    if (!this.stream) {
      return;
    }

    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.isCapturing = false;
    this.emit('stopped');
  }

  /**
   * Get current stream
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Check if capturing
   */
  isActive(): boolean {
    return this.isCapturing;
  }
}

/**
 * Webcam Capture Handler
 * Uses getUserMedia API
 */
export class WebcamCaptureSource extends EventEmitter {
  private stream: MediaStream | null = null;
  private isCapturing = false;
  private options: Required<WebcamCaptureOptions>;

  constructor(options?: WebcamCaptureOptions) {
    super();
    this.options = {
      deviceId: options?.deviceId || '',
      width: options?.width || 1280,
      height: options?.height || 720,
      frameRate: options?.frameRate || 30,
      mirror: options?.mirror !== false,
    };
  }

  /**
   * Start webcam capture
   */
  async start(): Promise<MediaStream> {
    if (this.isCapturing) {
      throw new SourceCaptureError('Webcam capture already active', 'ALREADY_CAPTURING');
    }

    try {
      const constraints: any = {
        video: {
          width: { ideal: this.options.width },
          height: { ideal: this.options.height },
          frameRate: { ideal: this.options.frameRate },
        },
        audio: false,
      };

      if (this.options.deviceId) {
        constraints.video.deviceId = this.options.deviceId;
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.isCapturing = true;

      this.stream.getTracks().forEach(track => {
        track.onended = () => {
          this.isCapturing = false;
          this.emit('stopped');
        };
      });

      this.emit('started', this.stream);
      return this.stream;
    } catch (error) {
      throw new SourceCaptureError(
        `Webcam capture failed: ${String(error)}`,
        'CAPTURE_FAILED'
      );
    }
  }

  /**
   * Stop webcam capture
   */
  async stop(): Promise<void> {
    if (!this.stream) {
      return;
    }

    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.isCapturing = false;
    this.emit('stopped');
  }

  /**
   * Get current stream
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Check if capturing
   */
  isActive(): boolean {
    return this.isCapturing;
  }

  /**
   * List available webcams
   */
  static async listDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      throw new SourceCaptureError(
        `Failed to list devices: ${String(error)}`,
        'DEVICE_ENUM_FAILED'
      );
    }
  }
}

/**
 * Browser Source Handler
 * Captures browser window or iframe via headless browser or canvas
 */
export class BrowserSourceCapture extends EventEmitter {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isCapturing = false;
  private options: Required<BrowserSourceOptions>;
  private animationFrameId: number | null = null;

  constructor(options?: BrowserSourceOptions) {
    super();
    this.options = {
      url: options?.url || 'about:blank',
      width: options?.width || 1920,
      height: options?.height || 1080,
      fps: options?.fps || 30,
      audioCapture: options?.audioCapture || false,
      css: options?.css || '',
    };
  }

  /**
   * Start browser source capture
   */
  async start(): Promise<HTMLCanvasElement> {
    if (this.isCapturing) {
      throw new SourceCaptureError('Browser capture already active', 'ALREADY_CAPTURING');
    }

    try {
      // Create canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.options.width;
      this.canvas.height = this.options.height;
      this.context = this.canvas.getContext('2d');

      if (!this.context) {
        throw new Error('Failed to get canvas context');
      }

      this.isCapturing = true;

      // Start rendering loop
      this.renderLoop();

      this.emit('started', this.canvas);
      return this.canvas;
    } catch (error) {
      throw new SourceCaptureError(
        `Browser capture failed: ${String(error)}`,
        'CAPTURE_FAILED'
      );
    }
  }

  /**
   * Stop browser source capture
   */
  async stop(): Promise<void> {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isCapturing = false;
    this.canvas = null;
    this.context = null;
    this.emit('stopped');
  }

  /**
   * Render loop for canvas capture
   */
  private renderLoop(): void {
    if (!this.isCapturing || !this.context || !this.canvas) {
      return;
    }

    // Draw to canvas (implementation depends on source)
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw browser content (would require iframe or headless browser)
    this.context.fillStyle = '#FFFFFF';
    this.context.font = '20px Arial';
    this.context.fillText('Browser Source', 10, 30);

    this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Check if capturing
   */
  isActive(): boolean {
    return this.isCapturing;
  }
}

/**
 * Audio Mixer
 * Mixes multiple audio sources with volume control
 */
export class AudioMixer extends EventEmitter {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sources = new Map<string, {
    source: MediaStreamAudioSourceNode;
    gain: GainNode;
    volume: number;
  }>();
  private isMixing = false;
  private options: Required<AudioMixOptions>;

  constructor(options?: AudioMixOptions) {
    super();
    this.options = {
      masterVolume: options?.masterVolume || 100,
      sampleRate: options?.sampleRate || 48000,
      channels: options?.channels || 2,
    };
  }

  /**
   * Initialize audio context
   */
  async initialize(): Promise<void> {
    if (this.audioContext) {
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.options.sampleRate,
      });

      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.options.masterVolume / 100;
      this.masterGain.connect(this.audioContext.destination);

      this.isMixing = true;
      this.emit('initialized');
    } catch (error) {
      throw new SourceCaptureError(
        `Audio mixer initialization failed: ${String(error)}`,
        'INIT_FAILED'
      );
    }
  }

  /**
   * Add audio source to mix
   */
  addSource(sourceId: string, stream: MediaStream, volume: number = 100): void {
    if (!this.audioContext || !this.masterGain) {
      throw new SourceCaptureError('Audio mixer not initialized', 'NOT_INITIALIZED');
    }

    // Create audio source from stream
    const source = this.audioContext.createMediaStreamSource(stream);
    const gain = this.audioContext.createGain();

    gain.gain.value = volume / 100;
    source.connect(gain);
    gain.connect(this.masterGain);

    this.sources.set(sourceId, { source, gain, volume });
    this.emit('source:added', sourceId);
  }

  /**
   * Remove audio source from mix
   */
  removeSource(sourceId: string): void {
    const entry = this.sources.get(sourceId);
    if (entry) {
      entry.source.disconnect();
      entry.gain.disconnect();
      this.sources.delete(sourceId);
      this.emit('source:removed', sourceId);
    }
  }

  /**
   * Set source volume
   */
  setSourceVolume(sourceId: string, volume: number): void {
    const entry = this.sources.get(sourceId);
    if (entry) {
      entry.gain.gain.value = Math.max(0, Math.min(1, volume / 100));
      entry.volume = volume;
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume / 100));
      this.options.masterVolume = volume;
    }
  }

  /**
   * Get mixed audio stream
   */
  getAudioStream(): MediaStream | null {
    if (!this.audioContext) {
      return null;
    }

    return this.audioContext.createMediaStreamDestination().stream;
  }

  /**
   * Stop mixing
   */
  async stop(): Promise<void> {
    for (const [sourceId] of this.sources) {
      this.removeSource(sourceId);
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }

    this.isMixing = false;
    this.emit('stopped');
  }

  /**
   * Check if mixing
   */
  isActive(): boolean {
    return this.isMixing;
  }
}

/**
 * Source Composition Engine
 * Combines multiple sources (video + audio) into composite stream
 */
export class SourceComposition extends EventEmitter {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private videoSources = new Map<string, { stream: MediaStream; visible: boolean }>();
  private audioMixer: AudioMixer;
  private isCompositing = false;
  private animationFrameId: number | null = null;
  private width: number;
  private height: number;

  constructor(width: number = 1920, height: number = 1080) {
    super();
    this.width = width;
    this.height = height;
    this.audioMixer = new AudioMixer();
  }

  /**
   * Initialize composition engine
   */
  async initialize(): Promise<void> {
    try {
      await this.audioMixer.initialize();

      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.context = this.canvas.getContext('2d');

      if (!this.context) {
        throw new Error('Failed to get canvas context');
      }

      this.emit('initialized');
    } catch (error) {
      throw new SourceCaptureError(
        `Composition initialization failed: ${String(error)}`,
        'INIT_FAILED'
      );
    }
  }

  /**
   * Add video source to composition
   */
  addVideoSource(sourceId: string, stream: MediaStream, visible: boolean = true): void {
    this.videoSources.set(sourceId, { stream, visible });
    this.emit('source:added', sourceId);
  }

  /**
   * Add audio source to composition
   */
  addAudioSource(sourceId: string, stream: MediaStream, volume: number = 100): void {
    this.audioMixer.addSource(sourceId, stream, volume);
  }

  /**
   * Start compositing
   */
  async start(): Promise<MediaStream> {
    if (this.isCompositing || !this.canvas) {
      throw new SourceCaptureError('Composition already active', 'ALREADY_COMPOSITING');
    }

    this.isCompositing = true;
    this.renderLoop();

    // Return canvas stream
    const stream = (this.canvas as any).captureStream(30);
    this.emit('started', stream);

    return stream;
  }

  /**
   * Stop compositing
   */
  async stop(): Promise<void> {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isCompositing = false;
    await this.audioMixer.stop();
    this.emit('stopped');
  }

  /**
   * Render loop
   */
  private renderLoop(): void {
    if (!this.isCompositing || !this.context || !this.canvas) {
      return;
    }

    // Clear canvas
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render visible video sources
    let sourceIndex = 0;
    for (const [sourceId, { visible }] of this.videoSources) {
      if (!visible) continue;

      // Simple grid layout
      const cols = 2;
      const row = Math.floor(sourceIndex / cols);
      const col = sourceIndex % cols;

      const sourceWidth = this.canvas.width / cols;
      const sourceHeight = this.canvas.height / Math.ceil(this.videoSources.size / cols);

      const x = col * sourceWidth;
      const y = row * sourceHeight;

      // Draw placeholder for source
      this.context.fillStyle = '#333333';
      this.context.fillRect(x, y, sourceWidth, sourceHeight);

      this.context.fillStyle = '#FFFFFF';
      this.context.font = '14px Arial';
      this.context.fillText(sourceId, x + 10, y + 30);

      sourceIndex++;
    }

    this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
  }

  /**
   * Get composition stream
   */
  getStream(): MediaStream | null {
    if (!this.canvas) {
      return null;
    }

    return (this.canvas as any).captureStream(30);
  }

  /**
   * Check if compositing
   */
  isActive(): boolean {
    return this.isCompositing;
  }
}

/**
 * Custom error class for source capture errors
 */
export class SourceCaptureError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SourceCaptureError';
  }
}
