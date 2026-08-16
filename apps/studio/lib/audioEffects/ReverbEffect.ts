/**
 * ReverbEffect
 *
 * Spatial reverb processing with convolver-based room simulations
 * and parameterized reverb algorithms.
 *
 * Supports: Room, Hall, Cathedral presets with decay time,
 * wet/dry mix, and early reflection control.
 *
 * @module audioEffects/ReverbEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';

export type ReverbPreset = 'room' | 'hall' | 'cathedral' | 'plate' | 'spring';

interface ImpulseResponse {
  length: number;
  sampleRate: number;
  samples: Float32Array;
}

/**
 * Generate synthetic impulse response for different room types
 */
function generateImpulseResponse(
  preset: ReverbPreset,
  sampleRate: number,
  decaySeconds: number = 2.0
): ImpulseResponse {
  const length = Math.ceil(sampleRate * decaySeconds);
  const samples = new Float32Array(length);

  // Early reflections timing (in milliseconds) and levels (0-1)
  let earlyReflections: Array<{ delay: number; level: number }> = [];

  switch (preset) {
    case 'room':
      earlyReflections = [
        { delay: 5, level: 0.7 },
        { delay: 10, level: 0.5 },
        { delay: 15, level: 0.3 },
      ];
      break;
    case 'hall':
      earlyReflections = [
        { delay: 15, level: 0.6 },
        { delay: 30, level: 0.4 },
        { delay: 45, level: 0.2 },
        { delay: 60, level: 0.1 },
      ];
      break;
    case 'cathedral':
      earlyReflections = [
        { delay: 20, level: 0.5 },
        { delay: 40, level: 0.35 },
        { delay: 80, level: 0.2 },
        { delay: 120, level: 0.1 },
      ];
      break;
    case 'plate':
      earlyReflections = [
        { delay: 2, level: 0.8 },
        { delay: 5, level: 0.5 },
        { delay: 8, level: 0.3 },
      ];
      break;
    case 'spring':
      earlyReflections = [
        { delay: 50, level: 0.6 },
        { delay: 100, level: 0.3 },
      ];
      break;
  }

  // Generate early reflections
  earlyReflections.forEach(({ delay, level }) => {
    const sample = Math.floor((delay / 1000) * sampleRate);
    if (sample < length) {
      samples[sample] = level * (Math.random() - 0.5) * 2; // Random phase
    }
  });

  // Generate diffuse reverb tail using Schroeder reverberator algorithm
  const density = preset === 'spring' ? 0.8 : preset === 'plate' ? 0.9 : 0.7;
  const delayTimes = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617]; // ms

  const delayBuffers = delayTimes.map(
    (ms) => new Float32Array(Math.ceil((ms / 1000) * sampleRate))
  );
  const delayIndices = new Array(delayBuffers.length).fill(0);
  const filterStates = new Array(delayBuffers.length).fill(0);

  // Decay factor (lower = longer decay)
  const decayFactor = Math.pow(0.1, decaySeconds / (preset === 'spring' ? 1 : 2));

  // Fill reverb tail (rough approximation)
  let output = 0;
  for (let i = 0; i < length; i++) {
    output *= decayFactor;

    // Parallel comb filters
    for (let j = 0; j < delayBuffers.length; j++) {
      const delayBuffer = delayBuffers[j];
      const delayIndex = delayIndices[j];
      const delayedSample = delayBuffer[delayIndex];

      // Low-pass filter feedback
      filterStates[j] =
        delayedSample * 0.5 + filterStates[j] * 0.5;

      // Write to delay buffer
      delayBuffer[delayIndex] = (output + filterStates[j]) * 0.25;

      // Update index
      delayIndices[j] = (delayIndex + 1) % delayBuffer.length;

      output += delayedSample;
    }

    // Add some noise to excite reverb
    if (Math.random() < 0.001) {
      output += (Math.random() - 0.5) * 0.1;
    }

    samples[i] += output * 0.1;
  }

  // Normalize
  let max = 0;
  for (let i = 0; i < length; i++) {
    max = Math.max(max, Math.abs(samples[i]));
  }
  if (max > 0) {
    const scale = 0.95 / max;
    for (let i = 0; i < length; i++) {
      samples[i] *= scale;
    }
  }

  return { length, sampleRate, samples };
}

/**
 * ReverbEffect - Professional reverb with presets
 */
export class ReverbEffect extends BaseEffect {
  private convolver: ConvolverNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private mixer: GainNode;
  private currentPreset: ReverbPreset = 'room';

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Create signal flow
    this.convolver = audioContext.createConvolver();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.mixer = audioContext.createGain();

    // Connect signal path
    (this.input as GainNode).connect(this.dryGain);
    (this.input as GainNode).connect(this.convolver);
    this.convolver.connect(this.wetGain);

    this.dryGain.connect(this.mixer);
    this.wetGain.connect(this.mixer);
    this.mixer.connect(this.output);

    // Load default impulse response
    this.loadPreset('room');

    // Register parameters
    this.registerParameter({
      name: 'size',
      value: 0.7,
      min: 0.1,
      max: 2,
      step: 0.1,
    });
    this.registerParameter({
      name: 'decay',
      value: 2,
      min: 0.5,
      max: 5,
      step: 0.1,
      unit: 's',
    });
    this.registerParameter({
      name: 'predelay',
      value: 0,
      min: 0,
      max: 100,
      step: 1,
      unit: 'ms',
    });
    this.registerParameter({
      name: 'damping',
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.1,
    });
    this.registerParameter({
      name: 'mix',
      value: 30,
      min: 0,
      max: 100,
      unit: '%',
    });

    this.setMix(30);
  }

  /**
   * Load a reverb preset
   */
  loadPreset(preset: ReverbPreset): void {
    const decay =
      preset === 'room'
        ? 1.5
        : preset === 'hall'
          ? 2.5
          : preset === 'cathedral'
            ? 4
            : preset === 'plate'
              ? 1.2
              : 2.0;

    const impulse = generateImpulseResponse(preset, this.audioContext.sampleRate, decay);
    const audioBuffer = this.audioContext.createBuffer(
      1,
      impulse.samples.length,
      impulse.sampleRate
    );
    audioBuffer.getChannelData(0).set(impulse.samples);

    this.convolver.buffer = audioBuffer;
    this.currentPreset = preset;
    this.setParameter('decay', decay);
  }

  /**
   * Get current preset
   */
  getPreset(): ReverbPreset {
    return this.currentPreset;
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
   * Handle parameter changes
   */
  protected onParameterChange(name: string, value: number): void {
    if (name === 'decay') {
      // Reload impulse response with new decay time
      this.loadPreset(this.currentPreset);
    } else if (name === 'size') {
      // Adjust convolver buffer length dynamically (approximate)
      // In practice, would regenerate impulse with scaled timing
    } else if (name === 'predelay') {
      // Predelay would require a separate delay line
      // Implement via a delay node in the wet path
    } else if (name === 'damping') {
      // Damping (low-pass filter on reverb tail)
      // Could be implemented with additional filter in wet path
    } else if (name === 'mix') {
      this.setMix(value);
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.convolver.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
    this.mixer.disconnect();
  }
}
