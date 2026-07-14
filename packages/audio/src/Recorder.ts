/**
 * Recorder class - handles microphone recording and audio capture
 */

import { AudioContextManager } from './AudioContextManager';

interface RecorderConfig {
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
}

export class Recorder {
  private audioContext: AudioContext;
  private mediaStream: MediaStream | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private recordedData: Float32Array[] = [];
  private listeners: Map<string, Set<Function>> = new Map();
  private sampleRate: number;
  private channels: number;
  private startTime: number = 0;
  private pausedTime: number = 0;

  constructor(config: RecorderConfig = {}) {
    this.audioContext = AudioContextManager.getInstance().getContext();
    this.sampleRate = config.sampleRate || this.audioContext.sampleRate;
    this.channels = config.channels || 2;
  }

  /**
   * Request microphone permission and prepare for recording
   */
  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Create audio source from microphone stream
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create script processor for capturing audio (deprecated but still widely supported)
      // In production, use AudioWorklet for better performance
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, this.channels, this.channels);

      this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
        if (this.isRecording && !this.isPaused) {
          this.captureAudioFrame(event);
        }
      };

      // Connect microphone to script processor
      this.mediaStreamSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize recorder:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start recording
   */
  startRecording(): void {
    if (this.isRecording) return;

    this.isRecording = true;
    this.isPaused = false;
    this.recordedData = [];
    this.startTime = this.audioContext.currentTime;
    this.pausedTime = 0;

    this.emit('recordingStarted');
  }

  /**
   * Stop recording and get audio buffer
   */
  stopRecording(): AudioBuffer | null {
    if (!this.isRecording) return null;

    this.isRecording = false;
    this.isPaused = false;

    // Create audio buffer from recorded data
    const buffer = this.createAudioBuffer();

    this.emit('recordingStopped');
    return buffer;
  }

  /**
   * Pause recording (can be resumed)
   */
  pauseRecording(): void {
    if (!this.isRecording) return;
    this.isPaused = true;
    this.pausedTime = this.audioContext.currentTime;
    this.emit('recordingPaused');
  }

  /**
   * Resume recording after pause
   */
  resumeRecording(): void {
    if (!this.isRecording || !this.isPaused) return;
    this.isPaused = false;
    this.emit('recordingResumed');
  }

  /**
   * Get current recording duration
   */
  getRecordingDuration(): number {
    if (!this.isRecording) return 0;
    const currentTime = this.audioContext.currentTime;
    return currentTime - this.startTime - (this.isPaused ? this.audioContext.currentTime - this.pausedTime : 0);
  }

  /**
   * Capture audio frame from script processor
   */
  private captureAudioFrame(event: AudioProcessingEvent): void {
    const inputData = event.inputBuffer.getChannelData(0);
    const frameData = new Float32Array(inputData);
    this.recordedData.push(frameData);
    this.emit('frameCapured', frameData);
  }

  /**
   * Create audio buffer from recorded data
   */
  private createAudioBuffer(): AudioBuffer {
    if (this.recordedData.length === 0) {
      return this.audioContext.createBuffer(this.channels, this.sampleRate, this.sampleRate);
    }

    const totalSamples = this.recordedData.reduce((sum, frame) => sum + frame.length, 0);
    const audioBuffer = this.audioContext.createBuffer(this.channels, totalSamples, this.sampleRate);

    const channelData = audioBuffer.getChannelData(0);
    let offset = 0;

    for (const frame of this.recordedData) {
      channelData.set(frame, offset);
      offset += frame.length;
    }

    return audioBuffer;
  }

  /**
   * Export audio as WAV blob
   */
  async exportAsWAV(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    // Get interleaved audio data
    const interleavedData = this.interleavChannels(audioBuffer);

    // Create WAV file header
    const headerSize = 44;
    const dataSize = interleavedData.length * bytesPerSample;
    const fileSize = headerSize + dataSize - 8;

    const header = new ArrayBuffer(headerSize);
    const view = new DataView(header);

    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, format, true); // AudioFormat
    view.setUint16(22, numberOfChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert float samples to 16-bit PCM
    const pcmData = this.floatTo16BitPCM(interleavedData);

    // Combine header and audio data
    const wavData = new Uint8Array(headerSize + pcmData.length);
    wavData.set(new Uint8Array(header));
    wavData.set(pcmData, headerSize);

    return new Blob([wavData], { type: 'audio/wav' });
  }

  /**
   * Interleave multi-channel audio data
   */
  private interleavChannels(audioBuffer: AudioBuffer): Float32Array {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const interleavedData = new Float32Array(length * numberOfChannels);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        interleavedData[i * numberOfChannels + channel] = channelData[i];
      }
    }

    return interleavedData;
  }

  /**
   * Convert float samples to 16-bit PCM
   */
  private floatTo16BitPCM(floatData: Float32Array): Uint8Array {
    const pcmData = new Uint8Array(floatData.length * 2);
    const dataView = new DataView(pcmData.buffer);

    for (let i = 0; i < floatData.length; i++) {
      const sample = Math.max(-1, Math.min(1, floatData[i]));
      dataView.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    return pcmData;
  }

  /**
   * Write string to DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Stop recording and cleanup
   */
  async cleanup(): Promise<void> {
    this.stopRecording();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    this.recordedData = [];
    this.emit('cleaned');
  }

  /**
   * Event emitter
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

  private emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach(callback => callback(data));
  }
}
