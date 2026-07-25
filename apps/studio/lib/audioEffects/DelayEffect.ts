/**
 * DelayEffect
 *
 * Professional time-based delay processor with tempo sync,
 * stereo delay, and feedback control.
 *
 * Supports: Delay time (tempo-synced), Feedback, Wet/Dry mix,
 * Stereo spread, Filter tone.
 *
 * @module audioEffects/DelayEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';

export type DelayTimeUnit = 'ms' | 'note' | 'sync';

interface DelayLineBuffer {
  buffer: Float32Array;
  index: number;
}

/**
 * DelayEffect - Professional delay processor
 */
export class DelayEffect extends BaseEffect {
  private delayTime: number = 500; // ms
  private feedback: number = 0.3;
  private stereoSpread: number = 0; // ms (L/R delay difference)
  private delayL: DelayLineBuffer;
  private delayR: DelayLineBuffer;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private toneFilter: BiquadFilterNode;
  private feedbackNode: GainNode;
  private mixer: GainNode;
  private tempo: number = 120; // BPM
  private tempoSync: boolean = false;

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Initialize delay buffers (max 4 seconds at 48kHz)
    const maxDelayLength = Math.ceil(4 * audioContext.sampleRate);
    this.delayL = {
      buffer: new Float32Array(maxDelayLength),
      index: 0,
    };
    this.delayR = {
      buffer: new Float32Array(maxDelayLength),
      index: 0,
    };

    // Create nodes
    this.dryGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.feedbackNode = audioContext.createGain();
    this.toneFilter = audioContext.createBiquadFilter();
    this.mixer = audioContext.createGain();

    // Setup tone filter (low-pass)
    this.toneFilter.type = 'lowpass';
    this.toneFilter.frequency.value = 8000;
    this.toneFilter.Q.value = 1;

    // Connect signal path
    (this.input as GainNode).connect(this.dryGain);
    (this.input as GainNode).connect(this.toneFilter);
    this.toneFilter.connect(this.wetGain);
    this.wetGain.connect(this.feedbackNode);
    this.feedbackNode.connect(this.toneFilter); // Feedback loop

    this.dryGain.connect(this.mixer);
    this.wetGain.connect(this.mixer);
    this.mixer.connect(this.output);

    // Set defaults
    this.dryGain.gain.value = 1;
    this.wetGain.gain.value = 0.3;
    this.feedbackNode.gain.value = 0.3;

    // Register parameters
    this.registerParameter({
      name: 'delayTime',
      value: 500,
      min: 10,
      max: 4000,
      step: 10,
      unit: 'ms',
    });
    this.registerParameter({
      name: 'delayNote',
      value: 3, // 1/8 note (0=1/16, 1=1/8T, 2=1/8, 3=1/4T, 4=1/4, etc.)
      min: 0,
      max: 8,
      step: 1,
    });
    this.registerParameter({
      name: 'feedback',
      value: 30,
      min: 0,
      max: 99,
      step: 1,
      unit: '%',
    });
    this.registerParameter({
      name: 'stereoSpread',
      value: 0,
      min: 0,
      max: 100,
      step: 10,
      unit: 'ms',
    });
    this.registerParameter({
      name: 'tone',
      value: 8000,
      min: 500,
      max: 20000,
      step: 100,
      unit: 'Hz',
    });
    this.registerParameter({
      name: 'mix',
      value: 30,
      min: 0,
      max: 100,
      unit: '%',
    });
  }

  /**
   * Convert note length to milliseconds at given tempo
   */
  private noteToMs(noteIndex: number, bpm: number = 120): number {
    // Note index: 0=1/16, 1=1/8T, 2=1/8, 3=1/4T, 4=1/4, 5=1/2T, 6=1/2, 7=dotted 1/2, 8=whole
    const noteValues = [
      0.25, // 1/16
      0.333, // 1/8 triplet
      0.5, // 1/8
      0.667, // 1/4 triplet
      1, // 1/4
      1.333, // 1/2 triplet
      2, // 1/2
      3, // dotted 1/2
      4, // whole
    ];

    const beatMs = (60000 / bpm) * 4; // Convert BPM to ms per quarter note
    const noteMs = beatMs * noteValues[noteIndex];

    return noteMs;
  }

  /**
   * Set delay time in milliseconds
   */
  setDelayTime(ms: number): void {
    this.delayTime = Math.max(10, Math.min(4000, ms));
    this.setParameter('delayTime', this.delayTime);
  }

  /**
   * Set delay time using note quantization
   */
  setDelayNote(noteIndex: number): void {
    const ms = this.noteToMs(noteIndex, this.tempo);
    this.setDelayTime(ms);
    this.setParameter('delayNote', noteIndex);
  }

  /**
   * Set tempo for note-synced delays (BPM)
   */
  setTempo(bpm: number): void {
    this.tempo = Math.max(30, Math.min(300, bpm));
    if (this.tempoSync) {
      const delayNote = this.getParameter('delayNote');
      if (delayNote !== undefined) {
        this.setDelayNote(delayNote);
      }
    }
  }

  /**
   * Enable/disable tempo sync
   */
  setTempoSync(enabled: boolean): void {
    this.tempoSync = enabled;
  }

  /**
   * Set feedback amount (0-99%)
   */
  setFeedback(percent: number): void {
    const feedback = Math.max(0, Math.min(99, percent)) / 100;
    this.feedbackNode.gain.value = feedback;
    this.setParameter('feedback', percent);
  }

  /**
   * Set stereo spread (L/R delay difference)
   */
  setStereoSpread(ms: number): void {
    this.stereoSpread = Math.max(0, Math.min(100, ms));
    this.setParameter('stereoSpread', this.stereoSpread);
  }

  /**
   * Set tone (low-pass filter cutoff)
   */
  setTone(hz: number): void {
    this.toneFilter.frequency.value = Math.max(500, Math.min(20000, hz));
    this.setParameter('tone', hz);
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
   * Process audio frame (call from audio rendering loop)
   * In production, this would be done in an AudioWorklet
   */
  processFrame(inputSample: number): number {
    const delaySamples = Math.ceil(
      (this.delayTime / 1000) * this.audioContext.sampleRate
    );
    const bufferLength = this.delayL.buffer.length;

    // Read delayed sample
    let readIndex = this.delayL.index - delaySamples;
    if (readIndex < 0) readIndex += bufferLength;

    const delayedSample = this.delayL.buffer[Math.floor(readIndex)];

    // Linear interpolation for fractional delay
    const frac = readIndex - Math.floor(readIndex);
    const nextIndex = (Math.floor(readIndex) + 1) % bufferLength;
    const interpolated =
      delayedSample * (1 - frac) +
      this.delayL.buffer[nextIndex] * frac;

    // Write input + feedback to delay buffer
    const toWrite = inputSample + interpolated * this.feedbackNode.gain.value;
    this.delayL.buffer[this.delayL.index] = toWrite;
    this.delayL.index = (this.delayL.index + 1) % bufferLength;

    return interpolated;
  }

  /**
   * Handle parameter changes
   */
  protected onParameterChange(name: string, value: number): void {
    switch (name) {
      case 'delayTime':
        this.setDelayTime(value);
        break;
      case 'delayNote':
        this.setDelayNote(Math.round(value));
        break;
      case 'feedback':
        this.setFeedback(value);
        break;
      case 'stereoSpread':
        this.setStereoSpread(value);
        break;
      case 'tone':
        this.setTone(value);
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
    this.feedbackNode.disconnect();
    this.toneFilter.disconnect();
    this.mixer.disconnect();
  }
}
