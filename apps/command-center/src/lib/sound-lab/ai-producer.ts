import { EffectInstance, EffectType } from './types';

export interface ProducerProposal {
  summary: string;
  intent: string;
  trackHint: 'vocal' | 'drums' | 'bass' | 'master' | 'any';
  effects: EffectInstance[];
  blocked?: string;
}

const PRESETS: Record<string, Omit<EffectInstance, 'id'>[]> = {
  vocalChain: [
    { type: 'gate', name: 'Gate', bypassed: false, params: { threshold: -42, reduction: 12 } },
    { type: 'eq', name: 'Vocal EQ', bypassed: false, params: { lowGain: -2, midGain: 2, highGain: 3, presence: 4 } },
    { type: 'compressor', name: 'Vocal Comp', bypassed: false, params: { threshold: -18, ratio: 4, attack: 0.008, release: 0.18 } },
    { type: 'reverb', name: 'Short Plate', bypassed: false, params: { mix: 0.18, roomSize: 0.35 } },
  ],
  warmVocal: [
    { type: 'eq', name: 'Warmth', bypassed: false, params: { lowGain: 3, midGain: 1, highGain: -1 } },
    { type: 'compressor', name: 'Gentle Comp', bypassed: false, params: { threshold: -20, ratio: 3, attack: 0.02, release: 0.25 } },
  ],
  clean: [
    { type: 'gate', name: 'Noise Gate', bypassed: false, params: { threshold: -48, reduction: 18 } },
    { type: 'filter', name: 'HPF', bypassed: false, params: { frequency: 80, type: 0 } },
  ],
  drumsForward: [
    { type: 'eq', name: 'Punch', bypassed: false, params: { lowGain: 3, midGain: 2, highGain: 1 } },
    { type: 'compressor', name: 'Drum Bus', bypassed: false, params: { threshold: -16, ratio: 5, attack: 0.004, release: 0.12 } },
  ],
  bassHit: [
    { type: 'eq', name: 'Bass Body', bypassed: false, params: { lowGain: 4, midGain: 0, highGain: -2 } },
    { type: 'compressor', name: 'Bass Glue', bypassed: false, params: { threshold: -22, ratio: 4, attack: 0.03, release: 0.2 } },
    { type: 'limiter', name: 'Safety Limit', bypassed: false, params: { threshold: -1, makeup: 1 } },
  ],
  cinematic: [
    { type: 'eq', name: 'Air', bypassed: false, params: { lowGain: 1, midGain: 0, highGain: 4 } },
    { type: 'reverb', name: 'Hall', bypassed: false, params: { mix: 0.35, roomSize: 0.8 } },
    { type: 'delay', name: 'Wide Delay', bypassed: false, params: { time: 0.28, feedback: 0.25, mix: 0.18 } },
    { type: 'width', name: 'Stereo Width', bypassed: false, params: { width: 1.35 } },
  ],
  streamingMaster: [
    { type: 'eq', name: 'Tilt', bypassed: false, params: { lowGain: 1, midGain: 0.5, highGain: 1.5 } },
    { type: 'compressor', name: 'Glue', bypassed: false, params: { threshold: -14, ratio: 2.5, attack: 0.015, release: 0.2 } },
    { type: 'limiter', name: 'Streaming Limit', bypassed: false, params: { threshold: -1, makeup: 3 } },
  ],
  energy: [
    { type: 'eq', name: 'Presence', bypassed: false, params: { lowGain: 0, midGain: 3, highGain: 4 } },
    { type: 'distortion', name: 'Saturation', bypassed: false, params: { drive: 0.18, mix: 0.22 } },
    { type: 'compressor', name: 'Push', bypassed: false, params: { threshold: -18, ratio: 3, attack: 0.006, release: 0.12 } },
  ],
};

function fx(list: Omit<EffectInstance, 'id'>[]): EffectInstance[] {
  return list.map((item, i) => ({ ...item, id: `ai-${item.type}-${i}` }));
}

export function proposeProduction(prompt: string): ProducerProposal {
  const text = prompt.toLowerCase();

  if (/separat|stem|acapella|isolate vocal/.test(text)) {
    return {
      summary: 'Stem separation is not connected. No provider is installed in WISE².',
      intent: 'stems',
      trackHint: 'any',
      effects: [],
      blocked: 'Stem separation requires a local Demucs/GPU adapter that is not wired. Import stems manually.',
    };
  }

  if (/noise|hiss|hum|click|clean this vocal|remove background/.test(text)) {
    return {
      summary: 'Propose a cleanup chain: high-pass, gate, light de-ess EQ. Preview before apply.',
      intent: 'clean',
      trackHint: 'vocal',
      effects: fx(PRESETS.clean),
    };
  }

  if (/warmer|warm/.test(text)) {
    return {
      summary: 'Add low-shelf warmth and gentle compression.',
      intent: 'warm',
      trackHint: 'vocal',
      effects: fx(PRESETS.warmVocal),
    };
  }

  if (/radio-ready|vocal chain|enhance vocal/.test(text)) {
    return {
      summary: 'Radio-ready vocal chain: gate → EQ → compressor → short plate.',
      intent: 'vocal-chain',
      trackHint: 'vocal',
      effects: fx(PRESETS.vocalChain),
    };
  }

  if (/drum|snare|kick/.test(text) && /forward|front|punch/.test(text)) {
    return {
      summary: 'Bring drums forward with punch EQ and bus compression.',
      intent: 'drums',
      trackHint: 'drums',
      effects: fx(PRESETS.drumsForward),
    };
  }

  if (/bass/.test(text)) {
    return {
      summary: 'Add bass body with safety limiting so peaks stay under 0 dBFS.',
      intent: 'bass',
      trackHint: 'bass',
      effects: fx(PRESETS.bassHit),
    };
  }

  if (/master|streaming|loud/.test(text)) {
    return {
      summary: 'Streaming master chain: tilt EQ, glue compressor, limiter at -1 dBTP.',
      intent: 'master',
      trackHint: 'master',
      effects: fx(PRESETS.streamingMaster),
    };
  }

  if (/cinematic/.test(text)) {
    return {
      summary: 'Cinematic space: hall reverb, delay, stereo width.',
      intent: 'cinematic',
      trackHint: 'any',
      effects: fx(PRESETS.cinematic),
    };
  }

  if (/energy|hook/.test(text)) {
    return {
      summary: 'Add presence, saturation, and faster compression for hook energy.',
      intent: 'energy',
      trackHint: 'vocal',
      effects: fx(PRESETS.energy),
    };
  }

  return {
    summary: 'No matching recipe. I can still apply a gentle polish chain you can inspect and undo.',
    intent: 'generic',
    trackHint: 'any',
    effects: fx([
      { type: 'eq' as EffectType, name: 'Polish EQ', bypassed: false, params: { lowGain: 0, midGain: 1, highGain: 1.5 } },
      { type: 'compressor' as EffectType, name: 'Polish Comp', bypassed: false, params: { threshold: -18, ratio: 2.5, attack: 0.01, release: 0.2 } },
    ]),
  };
}

export const MASTERING_PRESETS = [
  'streaming',
  'hip-hop',
  'r&b',
  'pop',
  'podcast',
  'cinematic',
  'commercial',
  'voiceover',
  'custom',
] as const;

export function masteringProposal(preset: string): ProducerProposal {
  if (preset === 'podcast' || preset === 'voiceover') {
    return {
      summary: `${preset} master: speech HPF, compression, limiter.`,
      intent: 'master',
      trackHint: 'master',
      effects: fx([
        { type: 'filter', name: 'Speech HPF', bypassed: false, params: { frequency: 80 } },
        { type: 'compressor', name: 'Speech Comp', bypassed: false, params: { threshold: -20, ratio: 4, attack: 0.01, release: 0.15 } },
        { type: 'limiter', name: 'Limiter', bypassed: false, params: { threshold: -1, makeup: 2 } },
      ]),
    };
  }
  if (preset === 'cinematic') return proposeProduction('cinematic master');
  if (preset === 'hip-hop') {
    return {
      summary: 'Hip-hop master: bass body, glue, limiter.',
      intent: 'master',
      trackHint: 'master',
      effects: fx([...PRESETS.bassHit.slice(0, 2), ...PRESETS.streamingMaster.slice(2)]),
    };
  }
  return proposeProduction('master this for streaming');
}
