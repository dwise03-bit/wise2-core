/**
 * DistortionEffect
 *
 * Versatile distortion/saturation processing with multiple
 * clipping algorithms (soft clip, hard clip, fuzz).
 *
 * Supports: Drive amount, Tone control, Output level, Mix.
 *
 * @module audioEffects/DistortionEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';

export type DistortionType = 'soft' | 'hard' | 'fuzz' | 'sine' | 'tanh';

/**
 * Soft clipping (smooth, analog-like)
 * Uses tanh approximation for efficiency
 */
function softClip(sample: number): number {
  // Smooth clipping approximation
  return Math.tanh(sample);
}

/**
 * Hard clipping (digital, harsh)
 */
function hardClip(sample: number): number {
  return Math.max(-1, Math.min(1, sample));
}

/**
 * Fuzz distortion (aggressive, vintage)
 */
function fuzz(sample: number): number {
  const sign = sample < 0 ? -1 : 1;
  const abs = Math.abs(sample);

  // Fuzz creates multiple harmonics through hard asymmetric clipping
  if (abs < 0.3) {
    return sample * 3; // Pre-gain
  } else if (abs < 0.8) {
    return sign * (0.9 + 0.1 * (abs - 0.3) / 0.5);
  } else {
    return sign * 1;
  }
}

/**
 * Sine wave distortion (waveshaping)
 */
function sineWave(sample: number): number {
  return Math.sin((sample * Math.PI) / 2);
}

/**
 * DistortionEffect - Saturation and distortion processor
 */
export class DistortionEffect extends BaseEffect {
  private type: DistortionType = 'soft';
  private dryGain: GainNode;
  private distortionGain: GainNode; // Pre-distortion gain (drive)
  private outputGain: GainNode; // Post-distortion gain
  private toneFilter: BiquadFilterNode;
  private mixer: GainNode;
  private distortionProcessor: AudioWorkletNode | null = null;

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Create signal flow
    this.distortionGain = audioContext.createGain();
    this.outputGain = audioContext.createGain();
    this.toneFilter = audioContext.createBiquadFilter();
    this.dryGain = audioContext.createGain();
    this.mixer = audioContext.createGain();

    // Default tone filter (low-pass to remove high-frequency artifacts)
    this.toneFilter.type = 'lowpass';
    this.toneFilter.frequency.value = 8000; // 8kHz cutoff
    this.toneFilter.Q.value = 1;

    // Connect signal path
    (this.input as GainNode).connect(this.distortionGain);
    (this.input as GainNode).connect(this.dryGain);

    // For now, connect distortion through tone filter
    // In production, would use AudioWorklet for real-time waveshaping
    this.distortionGain.connect(this.toneFilter);
    this.toneFilter.connect(this.outputGain);

    this.outputGain.connect(this.mixer);
    this.dryGain.connect(this.mixer);
    this.mixer.connect(this.output);

    // Set defaults
    this.distortionGain.gain.value = 1;
    this.outputGain.gain.value = 1;
    this.dryGain.gain.value = 0;

    // Register parameters
    this.registerParameter({
      name: 'drive',
      value: 0,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
    });
    this.registerParameter({
      name: 'tone',
      value: 8000,
      min: 1000,
      max: 20000,
      step: 100,
      unit: 'Hz',
    });
    this.registerParameter({
      name: 'output',
      value: 0,
      min: -24,
      max: 12,
      step: 0.5,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'mix',
      value: 100,
      min: 0,
      max: 100,
      unit: '%',
    });
  }

  /**
   * Set distortion type
   */
  setType(type: DistortionType): void {
    this.type = type;
  }

  /**
   * Get current distortion type
   */
  getType(): DistortionType {
    return this.type;
  }

  /**
   * Set drive amount (0-100%)
   */
  setDrive(percent: number): void {
    const drive = Math.max(0, Math.min(100, percent));
    // Map 0-100% to 1-10x gain
    const gain = 1 + (drive / 100) * 9;
    this.distortionGain.gain.value = gain;
    this.setParameter('drive', drive);
  }

  /**
   * Set output gain to compensate for distortion
   */
  setOutput(db: number): void {
    const linear = Math.pow(10, db / 20);
    this.outputGain.gain.value = linear;
    this.setParameter('output', db);
  }

  /**
   * Set tone (low-pass filter cutoff)
   */
  setTone(hz: number): void {
    this.toneFilter.frequency.value = Math.max(1000, Math.min(20000, hz));
    this.setParameter('tone', hz);
  }

  /**
   * Set wet/dry mix
   */
  setMix(percent: number): void {
    const mix = Math.max(0, Math.min(100, percent)) / 100;
    this.distortionGain.gain.value > 1
      ? (this.dryGain.gain.value = 1 - mix)
      : (this.dryGain.gain.value = 0);
    this.setParameter('mix', percent);
  }

  /**
   * Apply distortion to a sample value (for real-time processing)
   * Note: This is a CPU-intensive operation. In production, use AudioWorklet.
   */
  processSample(sample: number): number {
    let distorted: number;

    switch (this.type) {
      case 'soft':
        distorted = softClip(sample * this.distortionGain.gain.value);
        break;
      case 'hard':
        distorted = hardClip(sample * this.distortionGain.gain.value);
        break;
      case 'fuzz':
        distorted = fuzz(sample * this.distortionGain.gain.value);
        break;
      case 'sine':
        distorted = sineWave(sample * this.distortionGain.gain.value);
        break;
      case 'tanh':
        distorted = Math.tanh(sample * this.distortionGain.gain.value * 2);
        break;
      default:
        distorted = softClip(sample);
    }

    return distorted * this.outputGain.gain.value;
  }

  /**
   * Get waveshaping lookup table for visualization
   */
  getWaveshapingCurve(resolution: number = 512): number[] {
    const curve = new Array(resolution);

    for (let i = 0; i < resolution; i++) {
      const x = (i / resolution) * 2 - 1; // -1 to 1
      curve[i] = this.processSample(x);
    }

    return curve;
  }

  /**
   * Handle parameter changes
   */
  protected onParameterChange(name: string, value: number): void {
    switch (name) {
      case 'drive':
        this.setDrive(value);
        break;
      case 'tone':
        this.setTone(value);
        break;
      case 'output':
        this.setOutput(value);
        break;
      case 'mix':
        this.setMix(value);
        break;
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.distortionGain.disconnect();
    this.toneFilter.disconnect();
    this.outputGain.disconnect();
    this.dryGain.disconnect();
    this.mixer.disconnect();
  }
}
