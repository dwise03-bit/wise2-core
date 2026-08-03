/**
 * CompressorEffect
 *
 * Professional dynamic range compressor with real-time metering
 * and automatic makeup gain calculation.
 *
 * Supports: Threshold, Ratio, Attack, Release, Makeup Gain, Soft-knee
 *
 * @module audioEffects/CompressorEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';
import { linearToDb, dbToLinear } from '../audio/db-conversion';

/**
 * CompressorEffect - Dynamic range processor
 */
export class CompressorEffect extends BaseEffect {
  private compressor: DynamicsCompressorNode;
  private dryGain: GainNode;
  private makeupGain: GainNode;
  private mixer: GainNode;
  private gainReductionMeter: number = 0;
  private inputLevelMeter: number = 0;
  private outputLevelMeter: number = 0;
  private analyser: AnalyserNode;
  private rafId: number | null = null;

  // Manual compression parameters (for soft-knee, advanced mode)
  private softKnee: boolean = false;
  private kneeWidth: number = 6; // dB

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Create compressor node (Web Audio API built-in)
    this.compressor = audioContext.createDynamicsCompressor();

    // Create makeup gain
    this.makeupGain = audioContext.createGain();
    this.makeupGain.gain.value = 1;

    // Create mixer for dry/wet
    this.dryGain = audioContext.createGain();
    this.mixer = audioContext.createGain();

    // Create analyser for metering
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Connect signal flow: input → compressor → makeup gain → output
    (this.input as GainNode).connect(this.analyser); // Measure input
    (this.input as GainNode).connect(this.compressor);
    this.compressor.connect(this.makeupGain);

    // Measure output
    const outputAnalyser = audioContext.createAnalyser();
    this.makeupGain.connect(outputAnalyser);
    outputAnalyser.connect(this.mixer);

    this.mixer.connect(this.output);
    (this.input as GainNode).connect(this.dryGain);
    this.dryGain.connect(this.mixer);

    // Set default compressor values
    this.compressor.threshold.value = -20;
    this.compressor.knee.value = 12; // dB (soft knee width)
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003; // seconds
    this.compressor.release.value = 0.25; // seconds

    // Register parameters
    this.registerParameter({
      name: 'threshold',
      value: -20,
      min: -100,
      max: 0,
      step: 1,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'ratio',
      value: 4,
      min: 1,
      max: 16,
      step: 0.5,
    });
    this.registerParameter({
      name: 'attack',
      value: 3,
      min: 0.1,
      max: 100,
      step: 0.1,
      unit: 'ms',
    });
    this.registerParameter({
      name: 'release',
      value: 250,
      min: 10,
      max: 1000,
      step: 10,
      unit: 'ms',
    });
    this.registerParameter({
      name: 'makeupGain',
      value: 0,
      min: -24,
      max: 24,
      step: 0.5,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'knee',
      value: 12,
      min: 0,
      max: 40,
      step: 1,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'mix',
      value: 100,
      min: 0,
      max: 100,
      unit: '%',
    });

    this.startMetering();
  }

  /**
   * Start real-time metering
   */
  private startMetering(): void {
    const measure = () => {
      // Get input level
      const inputData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(inputData);

      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.inputLevelMeter = (rms / 255) * 2 - 1; // Normalize to ±1

      // Calculate gain reduction (approximation)
      // In ideal case, would measure difference between input and compressed output
      const threshold = this.compressor.threshold.value;
      const ratio = this.compressor.ratio.value;
      const inputDb = linearToDb(Math.abs(this.inputLevelMeter));

      if (inputDb > threshold) {
        const excess = inputDb - threshold;
        this.gainReductionMeter = -excess * (1 - 1 / ratio);
      } else {
        this.gainReductionMeter = 0;
      }

      this.rafId = requestAnimationFrame(measure);
    };
    measure();
  }

  /**
   * Get current gain reduction in dB
   */
  getGainReduction(): number {
    return this.gainReductionMeter;
  }

  /**
   * Get input level meter
   */
  getInputLevel(): number {
    return this.inputLevelMeter;
  }

  /**
   * Get output level meter
   */
  getOutputLevel(): number {
    return this.outputLevelMeter;
  }

  /**
   * Auto-calculate makeup gain based on threshold and ratio
   */
  autoMakeupGain(): void {
    const threshold = this.compressor.threshold.value;
    const ratio = this.compressor.ratio.value;

    // Makeup gain = -1 * max gain reduction
    // Max gain reduction occurs at high input levels
    // Assume maximum signal is 0 dBFS (1.0 linear)
    const maxExcess = 0 - threshold; // dBFS above threshold
    const maxGainReduction = -maxExcess * (1 - 1 / ratio);

    // Set makeup gain to compensate
    this.setParameter('makeupGain', -maxGainReduction);
  }

  /**
   * Enable soft-knee compression
   */
  setSoftKnee(enabled: boolean): void {
    this.softKnee = enabled;
    if (enabled) {
      this.compressor.knee.value = this.kneeWidth;
    } else {
      this.compressor.knee.value = 0;
    }
  }

  /**
   * Set knee width for soft-knee
   */
  setKneeWidth(dB: number): void {
    this.kneeWidth = dB;
    if (this.softKnee) {
      this.compressor.knee.value = dB;
    }
  }

  /**
   * Set wet/dry mix
   */
  setMix(percent: number): void {
    const mix = Math.max(0, Math.min(100, percent)) / 100;
    this.compressor.connect(this.makeupGain);
    this.dryGain.gain.value = 1 - mix;
    this.setParameter('mix', percent);
  }

  /**
   * Handle parameter changes
   */
  protected onParameterChange(name: string, value: number): void {
    switch (name) {
      case 'threshold':
        this.compressor.threshold.value = value;
        break;
      case 'ratio':
        this.compressor.ratio.value = value;
        break;
      case 'attack':
        // Parameter stored in ms, Web Audio uses seconds
        this.compressor.attack.value = Math.max(0.001, value / 1000);
        break;
      case 'release':
        // Parameter stored in ms, Web Audio uses seconds
        this.compressor.release.value = Math.max(0.01, value / 1000);
        break;
      case 'makeupGain':
        this.makeupGain.gain.value = dbToLinear(value);
        break;
      case 'knee':
        this.compressor.knee.value = value;
        break;
      case 'mix':
        this.setMix(value);
        break;
    }
  }

  /**
   * Get compression state for visualization
   */
  getState(): {
    gainReduction: number;
    inputLevel: number;
    outputLevel: number;
    threshold: number;
    ratio: number;
  } {
    return {
      gainReduction: this.gainReductionMeter,
      inputLevel: this.inputLevelMeter,
      outputLevel: this.outputLevelMeter,
      threshold: this.compressor.threshold.value,
      ratio: this.compressor.ratio.value,
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.compressor.disconnect();
    this.makeupGain.disconnect();
    this.dryGain.disconnect();
    this.mixer.disconnect();
    this.analyser.disconnect();
  }
}
