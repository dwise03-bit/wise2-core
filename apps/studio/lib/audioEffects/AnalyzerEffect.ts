/**
 * AnalyzerEffect
 *
 * Real-time audio analysis: spectrum analyzer (FFT), peak meter,
 * loudness metering (LUFS), and waveform display.
 *
 * Provides frequency response, peak detection, and loudness analysis
 * for monitoring and visualization.
 *
 * @module audioEffects/AnalyzerEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';
import { linearToDb, calculateRmsDb } from '../audio/db-conversion';

export interface SpectrumData {
  frequencies: number[];
  magnitudes: number[]; // in dB
  peaks: number[]; // peak values in current frame
}

export interface LoudnessData {
  lufs: number; // LUFS (perceived loudness)
  rms: number; // RMS level in dB
  peak: number; // Peak level in dB
  headroom: number; // dB to 0dBFS
}

/**
 * AnalyzerEffect - Real-time audio analyzer
 */
export class AnalyzerEffect extends BaseEffect {
  private analyser: AnalyserNode;
  private spectralData: Uint8Array;
  private timeData: Uint8Array;
  private peakLevel: number = -Infinity;
  private peakHoldTime: number = 1000; // ms
  private peakHoldStartTime: number = 0;
  private loudnessBuffer: number[] = [];
  private loudnessWindowSize: number = 2048;
  private rafId: number | null = null;

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Create analyser node
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048; // 2048-point FFT
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect passthrough
    (this.input as GainNode).connect(this.analyser);
    this.analyser.connect(this.output);

    // Allocate data arrays
    const frequencyBinCount = this.analyser.frequencyBinCount;
    this.spectralData = new Uint8Array(frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);

    // Register parameters (analyzer is passive, no real parameters)
    this.registerParameter({
      name: 'smoothing',
      value: 0.8,
      min: 0.1,
      max: 1,
      step: 0.1,
    });
    this.registerParameter({
      name: 'fftSize',
      value: 11, // log2(2048)
      min: 8, // 256
      max: 14, // 16384
      step: 1,
    });

    this.startAnalysis();
  }

  /**
   * Start continuous analysis loop
   */
  private startAnalysis(): void {
    const analyze = () => {
      // Update spectral data
      this.analyser.getByteFrequencyData(this.spectralData);

      // Update time domain data
      this.analyser.getByteTimeDomainData(this.timeData);

      // Calculate peak level
      let maxSample = 0;
      for (let i = 0; i < this.timeData.length; i++) {
        const sample = (this.timeData[i] - 128) / 128;
        maxSample = Math.max(maxSample, Math.abs(sample));
      }

      const peakDb = linearToDb(maxSample);

      // Peak hold logic
      if (peakDb > this.peakLevel) {
        this.peakLevel = peakDb;
        this.peakHoldStartTime = Date.now();
      } else if (
        Date.now() - this.peakHoldStartTime >
        this.peakHoldTime
      ) {
        this.peakLevel = peakDb;
      }

      // Calculate RMS loudness
      const samples = new Array(this.timeData.length);
      for (let i = 0; i < this.timeData.length; i++) {
        samples[i] = (this.timeData[i] - 128) / 128;
      }
      const rmsDb = calculateRmsDb(samples);

      // Add to loudness buffer
      if (this.loudnessBuffer.length < this.loudnessWindowSize) {
        this.loudnessBuffer.push(...samples);
      } else {
        this.loudnessBuffer.splice(0, samples.length);
        this.loudnessBuffer.push(...samples);
      }

      this.rafId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  /**
   * Get spectrum data for visualization
   */
  getSpectrum(): SpectrumData {
    const frequencies: number[] = [];
    const magnitudes: number[] = [];
    const peaks: number[] = [];

    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binCount = this.analyser.frequencyBinCount;

    for (let i = 0; i < binCount; i++) {
      const frequency = (i / binCount) * nyquist;
      const magnitude = this.spectralData[i];

      // Convert to dB (0-255 → -96 to 0 dBFS)
      const magnitudeDb = (magnitude / 255) * 96 - 96;

      frequencies.push(frequency);
      magnitudes.push(magnitudeDb);

      // Detect peaks (local maxima)
      if (
        i > 0 &&
        i < binCount - 1 &&
        magnitude > this.spectralData[i - 1] &&
        magnitude > this.spectralData[i + 1]
      ) {
        peaks.push(frequency);
      }
    }

    return { frequencies, magnitudes, peaks };
  }

  /**
   * Get loudness measurements
   */
  getLoudness(): LoudnessData {
    let maxSample = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const sample = (this.timeData[i] - 128) / 128;
      maxSample = Math.max(maxSample, Math.abs(sample));
    }

    const peakDb = linearToDb(maxSample);
    const rmsDb = calculateRmsDb(
      Array.from(this.timeData).map((val) => (val - 128) / 128)
    );

    // LUFS calculation (simplified)
    // Real LUFS requires K-weighting and integrated loudness over time
    // This is a simplified RMS-based approximation
    const lufs = rmsDb - 23; // ITU-R BS.1770-4 reference level adjustment

    return {
      lufs: isFinite(lufs) ? lufs : -Infinity,
      rms: rmsDb,
      peak: peakDb,
      headroom: 0 - peakDb,
    };
  }

  /**
   * Get peak meter level
   */
  getPeakLevel(): number {
    return this.peakLevel;
  }

  /**
   * Get waveform data for visualization
   */
  getWaveform(): number[] {
    const waveform: number[] = [];
    for (let i = 0; i < this.timeData.length; i++) {
      waveform.push((this.timeData[i] - 128) / 128);
    }
    return waveform;
  }

  /**
   * Get frequency bins for spectrum visualization
   */
  getFrequencyBins(binCount: number = 64): number[] {
    const bins: number[] = [];
    const stride = Math.floor(this.spectralData.length / binCount);

    for (let i = 0; i < binCount; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < stride && i * stride + j < this.spectralData.length; j++) {
        sum += this.spectralData[i * stride + j];
        count++;
      }
      const avg = count > 0 ? sum / count : 0;
      // Convert to dB
      const db = (avg / 255) * 96 - 96;
      bins.push(db);
    }

    return bins;
  }

  /**
   * Set FFT size
   */
  setFFTSize(log2Size: number): void {
    const fftSize = Math.pow(2, log2Size);
    if (fftSize >= 256 && fftSize <= 16384) {
      this.analyser.fftSize = fftSize;
      this.spectralData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);
      this.setParameter('fftSize', log2Size);
    }
  }

  /**
   * Set smoothing time constant
   */
  setSmoothing(value: number): void {
    this.analyser.smoothingTimeConstant = Math.max(0.1, Math.min(1, value));
    this.setParameter('smoothing', value);
  }

  /**
   * Handle parameter changes
   */
  protected onParameterChange(name: string, value: number): void {
    switch (name) {
      case 'smoothing':
        this.setSmoothing(value);
        break;
      case 'fftSize':
        this.setFFTSize(value);
        break;
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.analyser.disconnect();
  }
}
