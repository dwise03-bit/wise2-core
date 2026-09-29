/**
 * Streaming Audio Integration
 * Integrates audio mixing with Sound Lab, Suno tracks, microphone, and RTMP streaming
 *
 * Features:
 * - Aggregate audio from multiple sources:
 *   - Sound Lab master output
 *   - Generated Suno tracks
 *   - Microphone input
 *   - Desktop/system audio
 * - Route mixed audio to RTMP stream
 * - Manage audio context lifecycle
 * - Handle audio permissions and fallbacks
 */

import { StreamingAudioMixer, AudioDelayCompensator, StreamingAudioEncoder } from './AudioMixing';

/**
 * Audio Source Configuration
 */
export interface AudioSourceConfig {
  id: string;
  name: string;
  type: 'microphone' | 'system' | 'media' | 'soundlab' | 'suno' | 'aux';
  enabled: boolean;
  volume: number; // -60 to +6 dB
  pan: number; // -1 to 1
  muted: boolean;
  solo: boolean;
  delayMs?: number;
}

/**
 * Stream Encoding Settings
 */
export interface StreamEncodingSettings {
  bitrate: number; // 32-320 kbps
  sampleRate: number; // 44.1, 48, 96 kHz
  codec: 'aac' | 'mp3' | 'opus';
}

/**
 * Streaming Audio Manager
 */
export class StreamingAudioManager {
  private mixer: StreamingAudioMixer;
  private delayCompensator: AudioDelayCompensator;
  private encoder: StreamingAudioEncoder;
  private sources: Map<string, AudioSourceConfig> = new Map();
  private isRunning: boolean = false;
  private metersUpdateInterval: NodeJS.Timeout | null = null;
  private onMetersUpdate?: (meters: any) => void;

  constructor() {
    this.mixer = new StreamingAudioMixer();
    this.delayCompensator = new AudioDelayCompensator();
    this.encoder = new StreamingAudioEncoder();
  }

  /**
   * Initialize audio manager
   */
  public async initialize() {
    await this.mixer.resume();
    this.startMeteringUpdates();
  }

  /**
   * Add audio source from microphone
   */
  public async addMicrophoneSource(sourceId: string = 'mic-1'): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      this.mixer.addSource(sourceId, stream);
      this.sources.set(sourceId, {
        id: sourceId,
        name: 'Microphone',
        type: 'microphone',
        enabled: true,
        volume: -6,
        pan: 0,
        muted: false,
        solo: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      return false;
    }
  }

  /**
   * Add audio source from system audio (screen capture)
   */
  public async addSystemAudioSource(sourceId: string = 'system-1'): Promise<boolean> {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        audio: true,
        video: false,
      });

      this.mixer.addSource(sourceId, stream);
      this.sources.set(sourceId, {
        id: sourceId,
        name: 'System Audio',
        type: 'system',
        enabled: true,
        volume: -3,
        pan: 0,
        muted: false,
        solo: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to capture system audio:', error);
      return false;
    }
  }

  /**
   * Add Sound Lab master output
   */
  public addSoundLabSource(
    soundLabAudioContext: AudioContext,
    soundLabDestination: AudioNode,
    sourceId: string = 'soundlab-master'
  ) {
    try {
      // Create a media stream from Sound Lab's audio context
      const destination = soundLabAudioContext.createMediaStreamDestination();
      soundLabDestination.connect(destination);

      this.mixer.addSource(sourceId, destination.stream);
      this.sources.set(sourceId, {
        id: sourceId,
        name: 'Sound Lab',
        type: 'soundlab',
        enabled: true,
        volume: -6,
        pan: 0,
        muted: false,
        solo: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to add Sound Lab source:', error);
      return false;
    }
  }

  /**
   * Add Suno track (audio file)
   */
  public addSunoTrackSource(audioUrl: string, sourceId: string = `suno-${Date.now()}`): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(audioUrl);
        audio.crossOrigin = 'anonymous';

        audio.addEventListener('canplay', () => {
          this.mixer.addSource(sourceId, audio);
          this.sources.set(sourceId, {
            id: sourceId,
            name: `Suno Track ${this.sources.size}`,
            type: 'suno',
            enabled: true,
            volume: -6,
            pan: 0,
            muted: false,
            solo: false,
          });

          resolve(true);
        });

        audio.addEventListener('error', (error) => {
          console.error('Failed to load Suno track:', error);
          resolve(false);
        });

        // Start loading
        audio.load();
      } catch (error) {
        console.error('Failed to add Suno track:', error);
        resolve(false);
      }
    });
  }

  /**
   * Add media file source (audio or video)
   */
  public addMediaSource(mediaElement: HTMLMediaElement, sourceId?: string): boolean {
    try {
      const id = sourceId || `media-${Date.now()}`;
      this.mixer.addSource(id, mediaElement);
      this.sources.set(id, {
        id,
        name: 'Media',
        type: 'media',
        enabled: true,
        volume: -6,
        pan: 0,
        muted: false,
        solo: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to add media source:', error);
      return false;
    }
  }

  /**
   * Remove audio source
   */
  public removeSource(sourceId: string) {
    this.mixer.removeSource(sourceId);
    this.sources.delete(sourceId);
  }

  /**
   * Update source volume
   */
  public setSourceVolume(sourceId: string, volumeDb: number) {
    const source = this.sources.get(sourceId);
    if (source) {
      source.volume = volumeDb;
      this.mixer.setSourceVolume(sourceId, volumeDb);
    }
  }

  /**
   * Update source pan
   */
  public setSourcePan(sourceId: string, pan: number) {
    const source = this.sources.get(sourceId);
    if (source) {
      source.pan = pan;
      this.mixer.setSourcePan(sourceId, pan);
    }
  }

  /**
   * Toggle source mute
   */
  public setSourceMute(sourceId: string, muted: boolean) {
    const source = this.sources.get(sourceId);
    if (source) {
      source.muted = muted;
      this.mixer.setSourceMute(sourceId, muted);
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volumeDb: number) {
    this.mixer.setMasterVolume(volumeDb);
  }

  /**
   * Set audio delay for synchronization
   */
  public setAudioDelay(sourceId: string, delayMs: number) {
    const source = this.sources.get(sourceId);
    if (source) {
      source.delayMs = delayMs;
      this.delayCompensator.setDelay(sourceId, delayMs);
    }
  }

  /**
   * Start metering updates
   */
  private startMeteringUpdates() {
    if (this.metersUpdateInterval) {
      clearInterval(this.metersUpdateInterval);
    }

    this.metersUpdateInterval = setInterval(() => {
      this.mixer.updateMeters();

      if (this.onMetersUpdate) {
        const sourceMeters: Record<string, any> = {};
        this.sources.forEach((source) => {
          sourceMeters[source.id] = this.mixer.getSourceMetering(source.id);
        });

        this.onMetersUpdate({
          sources: sourceMeters,
          master: this.mixer.getMasterMetering(),
        });
      }
    }, 50); // Update 20x per second
  }

  /**
   * Set callback for meter updates
   */
  public setMetersUpdateCallback(callback: (meters: any) => void) {
    this.onMetersUpdate = callback;
  }

  /**
   * Get all sources
   */
  public getSources(): AudioSourceConfig[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get master metering
   */
  public getMasterMetering() {
    return this.mixer.getMasterMetering();
  }

  /**
   * Get audio context state
   */
  public getAudioState() {
    return this.mixer.getState();
  }

  /**
   * Clean up and close
   */
  public close() {
    if (this.metersUpdateInterval) {
      clearInterval(this.metersUpdateInterval);
    }

    this.sources.forEach((_, sourceId) => {
      this.mixer.removeSource(sourceId);
    });

    this.mixer.close();
    this.sources.clear();
    this.isRunning = false;
  }
}

/**
 * RTMP Stream Output
 * Manages connection and data flow to RTMP streaming service
 */
export class RTMPStreamOutput {
  private wsConnection: WebSocket | null = null;
  private streamKey: string = '';
  private isConnected: boolean = false;

  /**
   * Connect to RTMP server
   */
  public connect(serverUrl: string, streamKey: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.streamKey = streamKey;
        this.wsConnection = new WebSocket(serverUrl);

        this.wsConnection.onopen = () => {
          this.isConnected = true;
          console.log('Connected to RTMP server');
          resolve(true);
        };

        this.wsConnection.onerror = (error) => {
          console.error('RTMP connection error:', error);
          this.isConnected = false;
          resolve(false);
        };

        this.wsConnection.onclose = () => {
          this.isConnected = false;
          console.log('Disconnected from RTMP server');
        };
      } catch (error) {
        console.error('Failed to initialize RTMP connection:', error);
        resolve(false);
      }
    });
  }

  /**
   * Send audio data to stream
   */
  public sendAudioData(audioData: ArrayBuffer) {
    if (!this.isConnected || !this.wsConnection) return;

    try {
      this.wsConnection.send(audioData);
    } catch (error) {
      console.error('Failed to send audio data:', error);
    }
  }

  /**
   * Disconnect from RTMP server
   */
  public disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.isConnected = false;
    }
  }

  /**
   * Check connection status
   */
  public isStreamActive(): boolean {
    return this.isConnected && this.wsConnection?.readyState === WebSocket.OPEN;
  }
}

/**
 * Complete Streaming Audio System
 */
export class StreamingAudioSystem {
  private audioManager: StreamingAudioManager;
  private rtmpOutput: RTMPStreamOutput;

  constructor() {
    this.audioManager = new StreamingAudioManager();
    this.rtmpOutput = new RTMPStreamOutput();
  }

  /**
   * Initialize the complete streaming system
   */
  public async initialize(): Promise<boolean> {
    try {
      await this.audioManager.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize streaming audio system:', error);
      return false;
    }
  }

  /**
   * Connect to RTMP stream
   */
  public async connectToStream(serverUrl: string, streamKey: string): Promise<boolean> {
    return this.rtmpOutput.connect(serverUrl, streamKey);
  }

  /**
   * Get audio manager for source management
   */
  public getAudioManager(): StreamingAudioManager {
    return this.audioManager;
  }

  /**
   * Get RTMP output for stream control
   */
  public getRTMPOutput(): RTMPStreamOutput {
    return this.rtmpOutput;
  }

  /**
   * Close and cleanup
   */
  public close() {
    this.rtmpOutput.disconnect();
    this.audioManager.close();
  }
}

export default StreamingAudioManager;
