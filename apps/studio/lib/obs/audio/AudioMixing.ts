/**
 * Web Audio API Mixer
 * Professional audio mixing engine for streaming
 *
 * Features:
 * - Multi-source audio mixing
 * - Per-source volume and pan control
 * - Master output level control
 * - Real-time peak and RMS metering
 * - Clipping detection
 * - Audio delay compensation
 * - Output routing to RTMP stream
 */

/**
 * Audio Source Interface
 */
export interface AudioSource {
  id: string;
  name: string;
  type: 'microphone' | 'system' | 'media' | 'soundlab' | 'suno' | 'aux';
  volume: number; // -60 to +6 dB
  pan: number; // -1 to 1
  isMuted: boolean;
  isSolo: boolean;
  peakLevel: number; // dB
  rmsLevel: number; // dB
  delayMs?: number; // Audio delay for sync
}

/**
 * Metering Data
 */
export interface MeteringData {
  peakLevel: number; // dB
  rmsLevel: number; // dB
  headroom: number; // dB (6dB - peak)
  isClipping: boolean;
}

/**
 * Streaming Audio Mixer
 */
export class StreamingAudioMixer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private sources: Map<string, {
    gain: GainNode;
    pan: StereoPannerNode;
    analyser: AnalyserNode;
    mediaElementAudio?: MediaElementAudioSourceNode;
    source?: MediaStreamAudioSourceNode;
  }> = new Map();
  private destination: AudioNode | null = null;
  private peakMeters: Map<string, number> = new Map();
  private rmsMeters: Map<string, number> = new Map();
  private masterPeak: number = -Infinity;
  private masterRMS: number = -Infinity;
  private isClipping: boolean = false;

  constructor() {
    this.initAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initAudioContext() {
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 48000, // Professional streaming sample rate
      latencyHint: 'interactive',
    });

    this.audioContext = audioContext;

    // Master gain
    this.masterGain = audioContext.createGain();
    this.masterGain.gain.value = 0.9; // -1dB default

    // Master analyser for metering
    this.masterAnalyser = audioContext.createAnalyser();
    this.masterAnalyser.fftSize = 2048;

    // Connect master chain
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(audioContext.destination);

    this.destination = this.masterGain;
  }

  /**
   * Add audio source to mixer
   */
  public addSource(sourceId: string, mediaElementOrStream: HTMLMediaElement | MediaStream) {
    if (!this.audioContext || !this.destination) return;

    try {
      // Create gain and pan for this source
      const gain = this.audioContext.createGain();
      const pan = this.audioContext.createStereoPanner();
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 2048;

      // Each branch keeps its concrete node type so the source map below can be
      // populated without re-narrowing a widened union.
      let mediaElementNode: MediaElementAudioSourceNode | undefined;
      let mediaStreamNode: MediaStreamAudioSourceNode | undefined;

      if (mediaElementOrStream instanceof HTMLMediaElement) {
        // Media element source (audio file, video)
        mediaElementNode = this.audioContext.createMediaElementSource(mediaElementOrStream);
      } else {
        // Media stream source (microphone, system audio)
        mediaStreamNode = this.audioContext.createMediaStreamSource(mediaElementOrStream);
      }

      const sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode =
        mediaElementNode ?? mediaStreamNode!;

      // Connect source -> gain -> pan -> analyser -> master
      sourceNode.connect(gain);
      gain.connect(pan);
      pan.connect(analyser);
      analyser.connect(this.destination);

      this.sources.set(sourceId, {
        gain,
        pan,
        analyser,
        mediaElementAudio: mediaElementNode,
        source: mediaStreamNode,
      });

      // Initialize meters
      this.peakMeters.set(sourceId, -Infinity);
      this.rmsMeters.set(sourceId, -Infinity);
    } catch (error) {
      console.error(`Failed to add audio source ${sourceId}:`, error);
    }
  }

  /**
   * Remove audio source from mixer
   */
  public removeSource(sourceId: string) {
    const source = this.sources.get(sourceId);
    if (!source) return;

    // Disconnect the chain
    source.gain.disconnect();
    source.pan.disconnect();
    source.analyser.disconnect();

    this.sources.delete(sourceId);
    this.peakMeters.delete(sourceId);
    this.rmsMeters.delete(sourceId);
  }

  /**
   * Set source volume in dB
   */
  public setSourceVolume(sourceId: string, volumeDb: number) {
    const source = this.sources.get(sourceId);
    if (!source) return;

    // Clamp to -60 to +6 dB range
    const clampedDb = Math.max(-60, Math.min(6, volumeDb));
    const linear = Math.pow(10, clampedDb / 20);
    source.gain.gain.setTargetAtTime(linear, this.audioContext?.currentTime ?? 0, 0.01);
  }

  /**
   * Set source pan
   */
  public setSourcePan(sourceId: string, pan: number) {
    const source = this.sources.get(sourceId);
    if (!source) return;

    // Clamp to -1 to 1
    const clampedPan = Math.max(-1, Math.min(1, pan));
    source.pan.pan.setTargetAtTime(clampedPan, this.audioContext?.currentTime ?? 0, 0.01);
  }

  /**
   * Toggle source mute
   */
  public setSourceMute(sourceId: string, isMuted: boolean) {
    const source = this.sources.get(sourceId);
    if (!source) return;

    source.gain.gain.setTargetAtTime(isMuted ? 0 : 1, this.audioContext?.currentTime ?? 0, 0.01);
  }

  /**
   * Set master volume in dB
   */
  public setMasterVolume(volumeDb: number) {
    if (!this.masterGain) return;

    const clampedDb = Math.max(-60, Math.min(6, volumeDb));
    const linear = Math.pow(10, clampedDb / 20);
    this.masterGain.gain.setTargetAtTime(linear, this.audioContext?.currentTime ?? 0, 0.01);
  }

  /**
   * Update metering for all sources
   */
  public updateMeters() {
    // Update individual source meters
    this.sources.forEach((source, sourceId) => {
      const peakDb = this.getAnalyserPeak(source.analyser);
      const rmsDb = this.getAnalyserRMS(source.analyser);

      this.peakMeters.set(sourceId, peakDb);
      this.rmsMeters.set(sourceId, rmsDb);
    });

    // Update master meters
    if (this.masterAnalyser) {
      this.masterPeak = this.getAnalyserPeak(this.masterAnalyser);
      this.masterRMS = this.getAnalyserRMS(this.masterAnalyser);
      this.isClipping = this.masterPeak >= 0;
    }
  }

  /**
   * Get peak level from analyser
   */
  private getAnalyserPeak(analyser: AnalyserNode): number {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    let maxValue = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i];
      }
    }

    // Convert to dB (-96dB to 0dB range)
    return (maxValue / 255) * 96 - 96;
  }

  /**
   * Get RMS level from analyser
   */
  private getAnalyserRMS(analyser: AnalyserNode): number {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] / 255) * 2 - 1;
      sumSquares += normalized * normalized;
    }

    const rms = Math.sqrt(sumSquares / data.length);
    return Math.log10(Math.max(rms, 0.001)) * 20;
  }

  /**
   * Get metering data for source
   */
  public getSourceMetering(sourceId: string): MeteringData {
    const peakLevel = this.peakMeters.get(sourceId) ?? -Infinity;
    const rmsLevel = this.rmsMeters.get(sourceId) ?? -Infinity;

    return {
      peakLevel,
      rmsLevel,
      headroom: 6 - peakLevel,
      isClipping: peakLevel >= 0,
    };
  }

  /**
   * Get master metering data
   */
  public getMasterMetering(): MeteringData {
    return {
      peakLevel: this.masterPeak,
      rmsLevel: this.masterRMS,
      headroom: 6 - this.masterPeak,
      isClipping: this.isClipping,
    };
  }

  /**
   * Get audio context state
   */
  public getState() {
    return {
      state: this.audioContext?.state ?? 'not-initialized',
      sampleRate: this.audioContext?.sampleRate ?? 0,
      baseLatency: this.audioContext?.baseLatency ?? 0,
      outputLatency: this.audioContext?.outputLatency ?? 0,
    };
  }

  /**
   * Resume audio context (required for user interaction)
   */
  public async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Close and clean up audio context
   */
  public close() {
    // Disconnect all sources
    this.sources.forEach((_, sourceId) => {
      this.removeSource(sourceId);
    });

    // Disconnect master chain
    this.masterAnalyser?.disconnect();
    this.masterGain?.disconnect();

    // Close context
    this.audioContext?.close();

    this.sources.clear();
    this.peakMeters.clear();
    this.rmsMeters.clear();
  }
}

/**
 * Audio delay compensation for sync
 */
export class AudioDelayCompensator {
  private delays: Map<string, number> = new Map(); // sourceId -> delayMs

  public setDelay(sourceId: string, delayMs: number) {
    // Clamp delay to 0-500ms
    const clampedDelay = Math.max(0, Math.min(500, delayMs));
    this.delays.set(sourceId, clampedDelay);
  }

  public getDelay(sourceId: string): number {
    return this.delays.get(sourceId) ?? 0;
  }

  public clearAll() {
    this.delays.clear();
  }
}

/**
 * Stream output encoder
 * Encodes mixed audio for RTMP output
 */
export class StreamingAudioEncoder {
  private sampleRate: number = 48000;
  private bitrate: number = 128000; // 128kbps

  public setSampleRate(rate: number) {
    this.sampleRate = rate;
  }

  public setBitrate(rate: number) {
    // Clamp to 32-320 kbps
    this.bitrate = Math.max(32000, Math.min(320000, rate));
  }

  public getAudioConfig() {
    return {
      sampleRate: this.sampleRate,
      bitrate: this.bitrate,
      bitsPerSample: 16,
      channels: 2,
    };
  }

  /**
   * Convert PCM audio data to appropriate format for streaming
   */
  public encodePCM(pcmData: Float32Array): ArrayBuffer {
    // This would typically convert to AAC or MP3 for streaming
    // For now, return raw PCM
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new Int16Array(buffer);

    for (let i = 0; i < pcmData.length; i++) {
      // Convert float (-1 to 1) to 16-bit PCM
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      view[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    return buffer;
  }
}

export default StreamingAudioMixer;
