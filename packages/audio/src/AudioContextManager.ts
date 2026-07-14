/**
 * Singleton AudioContext manager
 * Handles Web Audio API initialization and lifecycle
 */

export class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isInitialized = false;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  /**
   * Initialize audio context (call once, usually on user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create audio context with highest available sample rate
    const sampleRate = this.detectSampleRate();
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate,
      latencyHint: 'interactive',
    });

    // Create master gain node
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.8; // Prevent clipping
    this.masterGain.connect(this.audioContext.destination);

    // Create analyser for metering
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.connect(this.masterGain);

    this.isInitialized = true;
    this.emit('initialized');
  }

  /**
   * Resume audio context (required by browsers after user gesture)
   */
  async resume(): Promise<void> {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'running') return;

    await this.audioContext.resume();
    this.emit('resumed');
  }

  /**
   * Get the audio context
   */
  getContext(): AudioContext {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized. Call initialize() first.');
    }
    return this.audioContext;
  }

  /**
   * Get master gain node (always connect audio to this)
   */
  getMasterGain(): GainNode {
    if (!this.masterGain) {
      throw new Error('AudioContext not initialized.');
    }
    return this.masterGain;
  }

  /**
   * Get analyser node for metering
   */
  getAnalyser(): AnalyserNode {
    if (!this.analyser) {
      throw new Error('AudioContext not initialized.');
    }
    return this.analyser;
  }

  /**
   * Get current sample rate
   */
  getSampleRate(): number {
    if (!this.audioContext) {
      return 44100; // default
    }
    return this.audioContext.sampleRate;
  }

  /**
   * Get current time in seconds
   */
  getCurrentTime(): number {
    if (!this.audioContext) {
      return 0;
    }
    return this.audioContext.currentTime;
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get master volume (0-1)
   */
  getMasterVolume(): number {
    if (!this.masterGain) return 0.8;
    return this.masterGain.gain.value;
  }

  /**
   * Get audio context state
   */
  getState(): AudioContextState {
    if (!this.audioContext) return 'closed';
    return this.audioContext.state;
  }

  /**
   * Check if audio context is running
   */
  isRunning(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running';
  }

  /**
   * Detect available sample rate
   */
  private detectSampleRate(): number {
    const offlineContext = new OfflineAudioContext(1, 1, 48000);
    const sampleRate = offlineContext.sampleRate;
    offlineContext.close();

    // Prefer 48kHz if available, fallback to 44.1kHz
    return sampleRate >= 48000 ? 48000 : 44100;
  }

  /**
   * Create a gain node
   */
  createGain(): GainNode {
    return this.getContext().createGain();
  }

  /**
   * Create a stereoPanner node
   */
  createPan(): StereoPannerNode {
    return this.getContext().createStereoPanner();
  }

  /**
   * Create a BiquadFilter node
   */
  createBiquadFilter(): BiquadFilterNode {
    return this.getContext().createBiquadFilter();
  }

  /**
   * Create a ConvolverNode for reverb
   */
  createConvolver(): ConvolverNode {
    return this.getContext().createConvolver();
  }

  /**
   * Create a DelayNode
   */
  createDelay(maxTime: number = 5): DelayNode {
    return this.getContext().createDelay(maxTime);
  }

  /**
   * Create an OscillatorNode for click track
   */
  createOscillator(): OscillatorNode {
    return this.getContext().createOscillator();
  }

  /**
   * Create an AnalyserNode
   */
  createAnalyser(): AnalyserNode {
    return this.getContext().createAnalyser();
  }

  /**
   * Close the audio context (cleanup)
   */
  async close(): Promise<void> {
    if (!this.audioContext) return;

    try {
      if (this.analyser) this.analyser.disconnect();
      if (this.masterGain) this.masterGain.disconnect();
      await this.audioContext.close();
    } catch (e) {
      console.error('Error closing audio context:', e);
    }

    this.audioContext = null;
    this.masterGain = null;
    this.analyser = null;
    this.isInitialized = false;
    this.emit('closed');
  }

  /**
   * Event emitter for lifecycle events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.delete(callback);
  }

  private emit(event: string): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach(callback => callback());
  }
}
