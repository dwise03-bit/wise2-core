/**
 * Track class - represents a single track in the DAW
 * Manages audio playback, recording, and processing
 */

import { AudioContextManager } from './AudioContextManager';
import { TrackConfig, EffectConfig } from './types';

export class Track {
  private id: string;
  private name: string;
  private color: string;
  private audioBuffers: Map<string, AudioBuffer> = new Map(); // clipId -> AudioBuffer
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private isMuted: boolean = false;
  private isSolo: boolean = false;
  private volume: number = 0.8; // 0-1
  private pan: number = 0; // -1 to 1
  private fadeIn: number = 0;
  private fadeOut: number = 0;
  private outputNode: GainNode; // Connects to bus or master
  private effectChain: GainNode[] = [];
  private analyser: AnalyserNode;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: TrackConfig) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color || '#00D9FF';
    this.isMuted = config.isMuted || false;
    this.isSolo = config.isSolo || false;
    this.volume = config.volume || 0.8;
    this.pan = config.pan || 0;
    this.fadeIn = config.fadeIn || 0;
    this.fadeOut = config.fadeOut || 0;

    const audioCtx = AudioContextManager.getInstance();

    // Create audio nodes
    this.gainNode = audioCtx.createGain();
    this.panNode = audioCtx.createPan();
    this.outputNode = audioCtx.createGain();
    this.analyser = audioCtx.createAnalyser();

    // Connect nodes: gainNode -> panNode -> analyser -> outputNode
    this.gainNode.connect(this.panNode);
    this.panNode.connect(this.analyser);
    this.analyser.connect(this.outputNode);

    // Apply initial settings
    this.setVolume(this.volume);
    this.setPan(this.pan);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
    this.emit('nameChanged');
  }

  getColor(): string {
    return this.color;
  }

  setColor(color: string): void {
    this.color = color;
    this.emit('colorChanged');
  }

  /**
   * Set track volume (0-1, where 1 is 0dB)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.gainNode.gain.value = this.volume;
    this.emit('volumeChanged', this.volume);
  }

  getVolume(): number {
    return this.volume;
  }

  /**
   * Convert volume 0-1 to dB
   */
  getVolumeInDB(): number {
    if (this.volume === 0) return -Infinity;
    return 20 * Math.log10(this.volume);
  }

  /**
   * Set track pan (-1 to 1, where 0 is center)
   */
  setPan(pan: number): void {
    this.pan = Math.max(-1, Math.min(1, pan));
    this.panNode.pan.value = this.pan;
    this.emit('panChanged', this.pan);
  }

  getPan(): number {
    return this.pan;
  }

  /**
   * Mute/unmute track
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.outputNode.gain.value = muted ? 0 : 1;
    this.emit('muteChanged', muted);
  }

  isMutedTrack(): boolean {
    return this.isMuted;
  }

  /**
   * Solo/unsolo track
   */
  setSolo(solo: boolean): void {
    this.isSolo = solo;
    this.emit('soloChanged', solo);
  }

  isSoloTrack(): boolean {
    return this.isSolo;
  }

  /**
   * Store audio buffer for a clip
   */
  setClipBuffer(clipId: string, buffer: AudioBuffer): void {
    this.audioBuffers.set(clipId, buffer);
    this.emit('clipBufferSet', clipId);
  }

  /**
   * Get audio buffer for a clip
   */
  getClipBuffer(clipId: string): AudioBuffer | undefined {
    return this.audioBuffers.get(clipId);
  }

  /**
   * Get total duration of all clips on this track
   */
  getTotalDuration(): number {
    let maxDuration = 0;
    this.audioBuffers.forEach(buffer => {
      const duration = buffer.duration;
      if (duration > maxDuration) maxDuration = duration;
    });
    return maxDuration;
  }

  /**
   * Get output node (connect this to bus/master)
   */
  getOutputNode(): GainNode {
    return this.outputNode;
  }

  /**
   * Get input node (for recording/processing)
   */
  getInputNode(): GainNode {
    return this.gainNode;
  }

  /**
   * Add effect to chain
   */
  addEffect(effect: EffectConfig): void {
    // Implementation depends on effect system
    // For now, we'll store config and apply later
    this.emit('effectAdded', effect);
  }

  /**
   * Remove effect from chain
   */
  removeEffect(effectId: string): void {
    this.emit('effectRemoved', effectId);
  }

  /**
   * Get peak level for metering
   */
  getPeakLevel(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let peak = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = dataArray[i] / 255;
      if (normalized > peak) peak = normalized;
    }

    // Convert to dB
    return peak === 0 ? -Infinity : 20 * Math.log10(peak);
  }

  /**
   * Get RMS level for metering
   */
  getRMSLevel(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / dataArray.length);
    return rms === 0 ? -Infinity : 20 * Math.log10(rms);
  }

  /**
   * Export track as WAV (all clips mixed down)
   */
  async exportAsWAV(): Promise<Blob> {
    // This will be implemented with WAV encoder
    // For now, return placeholder
    return new Blob([], { type: 'audio/wav' });
  }

  /**
   * Clear all audio buffers (cleanup)
   */
  clear(): void {
    this.audioBuffers.clear();
    this.gainNode.disconnect();
    this.panNode.disconnect();
    this.analyser.disconnect();
    this.outputNode.disconnect();
    this.emit('cleared');
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
