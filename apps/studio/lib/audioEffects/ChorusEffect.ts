/**
 * ChorusEffect
 *
 * Lush chorus, flanger, and phaser modulation effects.
 * Creates width and space through pitch modulation.
 *
 * Supports: Rate, Depth, Wet/Dry mix, Multiple modulation modes.
 *
 * @module audioEffects/ChorusEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';

export type ModulationType = 'chorus' | 'flanger' | 'phaser' | 'vibrato';

interface ModulationBuffer {
  buffer: Float32Array;
  index: number;
}

/**
 * ChorusEffect - Modulation processor
 */
export class ChorusEffect extends BaseEffect {
  private rate: number = 1.5; // Hz (LFO rate)
  private depth: number = 0.5; // 0-1 (modulation amount)
  private type: ModulationType = 'chorus';
  private dryGain: GainNode;
  private wetGain: GainNode;
  private delayLineL: ModulationBuffer;
  private delayLineR: ModulationBuffer;
  private lfoPhase: number = 0;
  private mixer: GainNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Initialize delay buffers for chorus/flanger (max 50ms)
    const maxDelayLength = Math.ceil(0.05 * audioContext.sampleRate);
    this.delayLineL = {
      buffer: new Float32Array(maxDelayLength),
      index: 0,
    };
    this.delayLineR = {
      buffer: new Float32Array(maxDelayLength),
      index: 0,
    };

    // Create nodes
    this.dryGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.mixer = audioContext.createGain();

    // Connect signal path
    (this.input as GainNode).connect(this.dryGain);
    (this.input as GainNode).connect(this.wetGain);
    this.dryGain.connect(this.mixer);
    this.wetGain.connect(this.mixer);
    this.mixer.connect(this.output);

    // Set defaults
    this.dryGain.gain.value = 1;
    this.wetGain.gain.value = 0.5;

    // Register parameters
    this.registerParameter({
      name: 'rate',
      value: 1.5,
      min: 0.1,
      max: 10,
      step: 0.1,
      unit: 'Hz',
    });
    this.registerParameter({
      name: 'depth',
      value: 50,
      min: 0,
      max: 100,
      unit: '%',
    });
    this.registerParameter({
      name: 'mix',
      value: 50,
      min: 0,
      max: 100,
      unit: '%',
    });
    this.registerParameter({
      name: 'spread',
      value: 0,
      min: 0,
      max: 180,
      unit: '°',
    });
  }

  /**
   * Set LFO rate (Hz)
   */
  setRate(hz: number): void {
    this.rate = Math.max(0.1, Math.min(10, hz));
    this.setParameter('rate', this.rate);
  }

  /**
   * Set modulation depth (0-100%)
   */
  setDepth(percent: number): void {
    this.depth = Math.max(0, Math.min(100, percent)) / 100;
    this.setParameter('depth', percent);
  }

  /**
   * Set modulation type
   */
  setType(type: ModulationType): void {
    this.type = type;
  }

  /**
   * Get current modulation type
   */
  getType(): ModulationType {
    return this.type;
  }

  /**
   * Set wet/dry mix
   */
  setMix(percent: number): void {
    const mix = Math.max(0, Math.min(100, percent)) / 100;
    this.wetGain.gain.value = mix;
    this.dryGain.gain.value = 1 - mix;
    this.setParameter('mix', percent);
  }

  /**
   * Generate LFO value (sine wave)
   */
  private getLFOValue(): number {
    return Math.sin(this.lfoPhase);
  }

  /**
   * Process frame with modulation (call from audio loop)
   * In production, this would be done in an AudioWorklet
   */
  processFrame(inputSample: number, sampleRate: number): number {
    const bufferLength = this.delayLineL.buffer.length;

    // Update LFO phase
    this.lfoPhase += (this.rate * 2 * Math.PI) / sampleRate;
    if (this.lfoPhase > 2 * Math.PI) {
      this.lfoPhase -= 2 * Math.PI;
    }

    let delayMs: number;
    let output = 0;

    switch (this.type) {
      case 'chorus':
        // Chorus: 20-50ms delay with slow modulation
        delayMs = 30 + this.getLFOValue() * this.depth * 15;
        output = this.readDelayLine(
          this.delayLineL,
          delayMs,
          sampleRate
        );
        this.writeDelayLine(this.delayLineL, inputSample);
        break;

      case 'flanger':
        // Flanger: 1-10ms delay with fast modulation and feedback
        delayMs = 5 + this.getLFOValue() * this.depth * 4;
        output = this.readDelayLine(
          this.delayLineL,
          delayMs,
          sampleRate
        );
        const flangerFeedback = output * 0.5;
        this.writeDelayLine(
          this.delayLineL,
          inputSample + flangerFeedback
        );
        break;

      case 'phaser':
        // Phaser: all-pass filter modulation
        delayMs = 1 + this.getLFOValue() * this.depth * 0.5;
        output = this.readDelayLine(
          this.delayLineL,
          delayMs,
          sampleRate
        );
        this.writeDelayLine(this.delayLineL, inputSample);
        // Mix with original for phase cancellation effect
        output = inputSample - output;
        break;

      case 'vibrato':
        // Vibrato: pitch modulation only (no delay mix)
        const pitchShift = this.getLFOValue() * this.depth * 2; // ±2% pitch
        // In production, would use pitch shifter
        output = inputSample * (1 + pitchShift * 0.01);
        break;
    }

    return output;
  }

  /**
   * Read from delay line with interpolation
   */
  private readDelayLine(
    delayLine: ModulationBuffer,
    delayMs: number,
    sampleRate: number
  ): number {
    const delaySamples = (delayMs / 1000) * sampleRate;
    const bufferLength = delayLine.buffer.length;

    let readIndex = delayLine.index - delaySamples;
    if (readIndex < 0) readIndex += bufferLength;

    const sample = delayLine.buffer[Math.floor(readIndex)];
    const nextIndex = (Math.floor(readIndex) + 1) % bufferLength;
    const frac = readIndex - Math.floor(readIndex);

    return sample * (1 - frac) + delayLine.buffer[nextIndex] * frac;
  }

  /**
   * Write to delay line
   */
  private writeDelayLine(
    delayLine: ModulationBuffer,
    sample: number
  ): void {
    delayLine.buffer[delayLine.index] = sample;
    delayLine.index = (delayLine.index + 1) % delayLine.buffer.length;
  }

  /**
   * Handle parameter changes
   */
  protected onParameterChange(name: string, value: number): void {
    switch (name) {
      case 'rate':
        this.setRate(value);
        break;
      case 'depth':
        this.setDepth(value);
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
    this.dryGain.disconnect();
    this.wetGain.disconnect();
    this.mixer.disconnect();
  }
}
