/**
 * EqualizerEffect
 *
 * Professional 3-band, 10-band graphic, and parametric equalization.
 * Supports multiple EQ modes, presets, and real-time parameter automation.
 *
 * @module audioEffects/EqualizerEffect
 */

import { BaseEffect, EffectParameter } from './BaseEffect';

export type EQMode = '3-band' | '10-band' | 'parametric';

export type EQPreset =
  | 'flat'
  | 'warmth'
  | 'brightness'
  | 'bass-boost'
  | 'vocal-enhance'
  | 'sizzle'
  | 'presence'
  | 'de-esser'
  | 'telephone'
  | 'radio';

interface BiquadFilterConfig {
  frequency: number;
  gain: number;
  Q: number;
  type: BiquadFilterType;
}

const EQ_PRESETS: Record<EQPreset, BiquadFilterConfig[]> = {
  flat: [
    { frequency: 100, gain: 0, Q: 0.5, type: 'peaking' },
    { frequency: 1000, gain: 0, Q: 0.5, type: 'peaking' },
    { frequency: 10000, gain: 0, Q: 0.5, type: 'peaking' },
  ],
  warmth: [
    { frequency: 100, gain: 4, Q: 0.5, type: 'peaking' },
    { frequency: 300, gain: 2, Q: 0.5, type: 'peaking' },
    { frequency: 10000, gain: -2, Q: 0.5, type: 'peaking' },
  ],
  brightness: [
    { frequency: 100, gain: -2, Q: 0.5, type: 'peaking' },
    { frequency: 1000, gain: 1, Q: 0.5, type: 'peaking' },
    { frequency: 10000, gain: 4, Q: 0.5, type: 'peaking' },
  ],
  'bass-boost': [
    { frequency: 60, gain: 6, Q: 0.5, type: 'peaking' },
    { frequency: 1000, gain: 0, Q: 0.5, type: 'peaking' },
    { frequency: 10000, gain: -2, Q: 0.5, type: 'peaking' },
  ],
  'vocal-enhance': [
    { frequency: 100, gain: -1, Q: 0.5, type: 'peaking' },
    { frequency: 1000, gain: 3, Q: 0.5, type: 'peaking' },
    { frequency: 5000, gain: 2, Q: 0.5, type: 'peaking' },
  ],
  sizzle: [
    { frequency: 100, gain: -2, Q: 0.5, type: 'peaking' },
    { frequency: 1000, gain: -1, Q: 0.5, type: 'peaking' },
    { frequency: 15000, gain: 5, Q: 0.5, type: 'peaking' },
  ],
  presence: [
    { frequency: 100, gain: -1, Q: 0.5, type: 'peaking' },
    { frequency: 2000, gain: 4, Q: 0.5, type: 'peaking' },
    { frequency: 10000, gain: 2, Q: 0.5, type: 'peaking' },
  ],
  'de-esser': [
    { frequency: 100, gain: 0, Q: 0.5, type: 'peaking' },
    { frequency: 1000, gain: 0, Q: 0.5, type: 'peaking' },
    { frequency: 8000, gain: -6, Q: 1.5, type: 'peaking' },
  ],
  telephone: [
    { frequency: 100, gain: -6, Q: 0.5, type: 'highpass' },
    { frequency: 3000, gain: 4, Q: 0.5, type: 'peaking' },
    { frequency: 8000, gain: -8, Q: 0.5, type: 'lowpass' },
  ],
  radio: [
    { frequency: 100, gain: -8, Q: 0.5, type: 'highpass' },
    { frequency: 500, gain: 6, Q: 0.5, type: 'peaking' },
    { frequency: 4000, gain: 3, Q: 0.5, type: 'peaking' },
  ],
};

/**
 * 10-band graphic EQ standard center frequencies (1/3 octave spacing)
 */
const GRAPHIC_EQ_BANDS = [
  60, 125, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000,
];

/**
 * EqualizerEffect - Multi-mode professional EQ
 */
export class EqualizerEffect extends BaseEffect {
  private mode: EQMode = '3-band';
  private filterNodes: BiquadFilterNode[] = [];
  private wetGain: GainNode;
  private dryGain: GainNode;
  private mixer: GainNode;

  constructor(audioContext: AudioContext) {
    super(audioContext);

    // Create signal flow: input → filters → output
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.mixer = audioContext.createGain();

    (this.input as GainNode).connect(this.dryGain);
    (this.input as GainNode).connect(this.wetGain);

    this.dryGain.connect(this.mixer);
    this.mixer.connect(this.output);

    // Initialize 3-band EQ
    this.initializeMode('3-band');

    // Register parameters
    this.registerParameter({
      name: 'lowGain',
      value: 0,
      min: -12,
      max: 12,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'midGain',
      value: 0,
      min: -12,
      max: 12,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'highGain',
      value: 0,
      min: -12,
      max: 12,
      unit: 'dB',
    });

    // 10-band graphic EQ
    for (let i = 0; i < 10; i++) {
      this.registerParameter({
        name: `band${i}`,
        value: 0,
        min: -12,
        max: 12,
        unit: 'dB',
      });
    }

    // Parametric EQ
    this.registerParameter({
      name: 'paramFreq',
      value: 1000,
      min: 20,
      max: 20000,
      step: 10,
      unit: 'Hz',
    });
    this.registerParameter({
      name: 'paramGain',
      value: 0,
      min: -12,
      max: 12,
      unit: 'dB',
    });
    this.registerParameter({
      name: 'paramQ',
      value: 1,
      min: 0.1,
      max: 10,
      step: 0.1,
    });

    this.registerParameter({
      name: 'mix',
      value: 100,
      min: 0,
      max: 100,
      unit: '%',
    });

    this.setMix(100);
  }

  /**
   * Initialize EQ for a specific mode
   */
  private initializeMode(mode: EQMode): void {
    // Clear existing filters
    this.filterNodes.forEach((filter) => {
      filter.disconnect();
    });
    this.filterNodes = [];

    this.mode = mode;

    if (mode === '3-band') {
      this.create3BandEQ();
    } else if (mode === '10-band') {
      this.create10BandEQ();
    } else if (mode === 'parametric') {
      this.createParametricEQ();
    }
  }

  /**
   * Create 3-band EQ (Low, Mid, High)
   */
  private create3BandEQ(): void {
    const low = this.audioContext.createBiquadFilter();
    low.type = 'peaking';
    low.frequency.value = 100;
    low.Q.value = 0.5;

    const mid = this.audioContext.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 0.5;

    const high = this.audioContext.createBiquadFilter();
    high.type = 'peaking';
    high.frequency.value = 10000;
    high.Q.value = 0.5;

    this.wetGain.connect(low);
    low.connect(mid);
    mid.connect(high);
    high.connect(this.mixer);

    this.filterNodes = [low, mid, high];
  }

  /**
   * Create 10-band graphic EQ
   */
  private create10BandEQ(): void {
    let prev = this.wetGain;

    for (let i = 0; i < 10; i++) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = GRAPHIC_EQ_BANDS[i];
      filter.Q.value = 1; // Narrower for graphic EQ
      filter.gain.value = 0;

      prev.connect(filter);
      prev = filter;
      this.filterNodes.push(filter);
    }

    prev.connect(this.mixer);
  }

  /**
   * Create parametric EQ (single peak filter with editable parameters)
   */
  private createParametricEQ(): void {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = 1000;
    filter.Q.value = 1;
    filter.gain.value = 0;

    this.wetGain.connect(filter);
    filter.connect(this.mixer);

    this.filterNodes = [filter];
  }

  /**
   * Set EQ mode
   */
  setMode(mode: EQMode): void {
    this.initializeMode(mode);
  }

  /**
   * Get current EQ mode
   */
  getMode(): EQMode {
    return this.mode;
  }

  /**
   * Apply a preset
   */
  applyPreset(preset: EQPreset): void {
    const config = EQ_PRESETS[preset];
    this.initializeMode('3-band');

    config.forEach((filter, i) => {
      if (i < this.filterNodes.length) {
        this.filterNodes[i].frequency.value = filter.frequency;
        this.filterNodes[i].gain.value = filter.gain;
        this.filterNodes[i].Q.value = filter.Q;
      }
    });

    // Update parameter values to reflect preset
    this.setParameter('lowGain', config[0].gain);
    this.setParameter('midGain', config[1].gain);
    this.setParameter('highGain', config[2].gain);
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
    if (this.mode === '3-band') {
      if (name === 'lowGain' && this.filterNodes[0]) {
        this.filterNodes[0].gain.value = value;
      } else if (name === 'midGain' && this.filterNodes[1]) {
        this.filterNodes[1].gain.value = value;
      } else if (name === 'highGain' && this.filterNodes[2]) {
        this.filterNodes[2].gain.value = value;
      }
    } else if (this.mode === '10-band') {
      // 10-band: band0 through band9
      const bandIndex = parseInt(name.replace('band', ''));
      if (!isNaN(bandIndex) && bandIndex < this.filterNodes.length) {
        this.filterNodes[bandIndex].gain.value = value;
      }
    } else if (this.mode === 'parametric') {
      const filter = this.filterNodes[0];
      if (name === 'paramFreq') {
        filter.frequency.value = value;
      } else if (name === 'paramGain') {
        filter.gain.value = value;
      } else if (name === 'paramQ') {
        filter.Q.value = value;
      }
    }

    if (name === 'mix') {
      this.setMix(value);
    }
  }

  /**
   * Get EQ curve data for visualization (frequency response)
   */
  getFrequencyResponse(): { frequencies: number[]; magnitudes: number[] } {
    const frequencies = new Float32Array(256);
    const magnitudes = new Float32Array(256);

    // Generate log-spaced frequencies (20Hz to 20kHz)
    for (let i = 0; i < 256; i++) {
      frequencies[i] = 20 * Math.pow(1000, i / 255);
    }

    // Get combined frequency response
    const magResponse = new Float32Array(256);
    const phaseResponse = new Float32Array(256);

    // Start with flat response
    magResponse.fill(1);

    // Apply each filter's response
    this.filterNodes.forEach((filter) => {
      const filterMag = new Float32Array(256);
      const filterPhase = new Float32Array(256);
      filter.getFrequencyResponse(frequencies, filterMag, filterPhase);

      for (let i = 0; i < 256; i++) {
        magResponse[i] *= filterMag[i];
      }
    });

    // Convert to dB
    for (let i = 0; i < 256; i++) {
      const db = 20 * Math.log10(magResponse[i]);
      magnitudes[i] = db;
    }

    return {
      frequencies: Array.from(frequencies),
      magnitudes: Array.from(magnitudes),
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.filterNodes.forEach((filter) => filter.disconnect());
    this.filterNodes = [];
    this.wetGain.disconnect();
    this.dryGain.disconnect();
    this.mixer.disconnect();
  }
}
