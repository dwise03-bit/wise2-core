/**
 * Mixer class - manages master bus, track routing, and metering
 */

import { AudioContextManager } from './AudioContextManager';
import { Track } from './Track';
import { MeterReading } from './types';

export class Mixer {
  private masterBus: GainNode;
  private masterAnalyser: AnalyserNode;
  private tracks: Map<string, Track> = new Map();
  private soloedTracks: Set<string> = new Set();
  private masterVolume: number = 0.8;
  private dataArray: Uint8Array;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    const audioCtx = AudioContextManager.getInstance();

    this.masterBus = audioCtx.createGain();
    this.masterAnalyser = audioCtx.createAnalyser();
    this.masterAnalyser.fftSize = 2048;

    // Connect to output
    this.masterBus.connect(this.masterAnalyser);
    this.masterAnalyser.connect(audioCtx.getMasterGain());

    this.dataArray = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.setMasterVolume(this.masterVolume);
  }

  /**
   * Add track to mixer
   */
  addTrack(track: Track): void {
    this.tracks.set(track.getId(), track);
    // Connect track output to master bus
    track.getOutputNode().connect(this.masterBus);
    this.emit('trackAdded', track.getId());
  }

  /**
   * Remove track from mixer
   */
  removeTrack(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    track.getOutputNode().disconnect(this.masterBus);
    this.tracks.delete(trackId);
    this.soloedTracks.delete(trackId);
    this.emit('trackRemoved', trackId);
  }

  /**
   * Get track by ID
   */
  getTrack(trackId: string): Track | undefined {
    return this.tracks.get(trackId);
  }

  /**
   * Get all tracks
   */
  getTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Get number of tracks
   */
  getTrackCount(): number {
    return this.tracks.size;
  }

  /**
   * Update track solo state and recalculate mute states
   */
  updateSoloState(trackId: string, solo: boolean): void {
    if (solo) {
      this.soloedTracks.add(trackId);
    } else {
      this.soloedTracks.delete(trackId);
    }

    // If any tracks are soloed, mute all others
    const hasSoloedTracks = this.soloedTracks.size > 0;

    this.tracks.forEach((track, id) => {
      if (hasSoloedTracks && !this.soloedTracks.has(id)) {
        // Mute tracks that aren't soloed
        track.setMuted(true);
      } else {
        // Unmute all other tracks
        track.setMuted(track.isMutedTrack());
      }
    });

    this.emit('soloStateChanged');
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.masterBus.gain.value = this.masterVolume;
    this.emit('masterVolumeChanged', this.masterVolume);
  }

  /**
   * Get master volume (0-1)
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Get master volume in dB
   */
  getMasterVolumeInDB(): number {
    if (this.masterVolume === 0) return -Infinity;
    return 20 * Math.log10(this.masterVolume);
  }

  /**
   * Get master bus node
   */
  getMasterBus(): GainNode {
    return this.masterBus;
  }

  /**
   * Get meter readings for master bus
   */
  getMeterReading(): MeterReading {
    this.masterAnalyser.getByteFrequencyData(this.dataArray);

    // Calculate peak (max frequency)
    let peak = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = this.dataArray[i] / 255;
      if (normalized > peak) peak = normalized;
    }

    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = this.dataArray[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);

    return {
      peak: peak === 0 ? -Infinity : 20 * Math.log10(peak),
      rms: rms === 0 ? -Infinity : 20 * Math.log10(rms),
      lufs: this.calculateLUFS(), // Simplified LUFS calculation
    };
  }

  /**
   * Simplified LUFS calculation
   * True LUFS requires time-weighted measurement, this is a simplification
   */
  private calculateLUFS(): number {
    const timeDomainData = new Uint8Array(this.masterAnalyser.fftSize);
    this.masterAnalyser.getByteTimeDomainData(timeDomainData);

    let sum = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const normalized = (timeDomainData[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / timeDomainData.length);

    if (rms === 0) return -Infinity;

    // Approximate LUFS (not true ITU-R BS.1770-4, but close)
    return -0.691 + 10 * Math.log10(rms + 1e-10);
  }

  /**
   * Get spectrum data for analyzer
   */
  getSpectrumData(): Uint8Array {
    const dataArray = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.masterAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Get time domain data for waveform visualization
   */
  getWaveformData(): Uint8Array {
    const dataArray = new Uint8Array(this.masterAnalyser.fftSize);
    this.masterAnalyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  /**
   * Get correlation meter data (stereo imaging)
   * Returns value between -1 (fully mono) and 1 (stereo)
   */
  getCorrelation(): number {
    // Simplified correlation calculation
    // Full implementation would require left/right channel separation
    const waveform = this.getWaveformData();
    let correlation = 0;

    // This is a placeholder - real implementation needs stereo analysis
    for (let i = 0; i < waveform.length / 2; i++) {
      const left = (waveform[i * 2] - 128) / 128;
      const right = (waveform[i * 2 + 1] - 128) / 128;
      correlation += left * right;
    }

    return correlation / (waveform.length / 2);
  }

  /**
   * Clear all tracks (cleanup)
   */
  clear(): void {
    this.tracks.forEach(track => track.clear());
    this.tracks.clear();
    this.soloedTracks.clear();
    this.masterAnalyser.disconnect();
    this.masterBus.disconnect();
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
