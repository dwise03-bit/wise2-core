/**
 * Factory for creating audio effects
 */

import { EffectBase } from './EffectBase';
import { EQEffect } from './EQEffect';
import { CompressorEffect } from './CompressorEffect';
import { ReverbEffect } from './ReverbEffect';
import { DelayEffect } from './DelayEffect';
import { EffectConfig } from '../types';

export class EffectFactory {
  static createEffect(config: EffectConfig): EffectBase {
    switch (config.type) {
      case 'eq':
        return new EQEffect(config);
      case 'compressor':
        return new CompressorEffect(config);
      case 'reverb':
        return new ReverbEffect(config);
      case 'delay':
        return new DelayEffect(config);
      default:
        throw new Error(`Unknown effect type: ${config.type}`);
    }
  }

  /**
   * Get default parameters for an effect type
   */
  static getDefaultParameters(type: string): Record<string, number> {
    switch (type) {
      case 'eq':
        return {
          lowGain: 0,
          lowFreq: 200,
          midGain: 0,
          midFreq: 1000,
          midQ: 1,
          highGain: 0,
          highFreq: 5000,
        };
      case 'compressor':
        return {
          threshold: -24,
          ratio: 4,
          attack: 0.003,
          release: 0.25,
          knee: 30,
          makeupGain: 0,
        };
      case 'reverb':
        return {
          mix: 0.5,
          roomSize: 0.5,
          width: 1,
        };
      case 'delay':
        return {
          time: 500,
          feedback: 0.5,
          mix: 0.5,
        };
      default:
        return {};
    }
  }
}
