export type TrackType =
  | 'vocal'
  | 'instrumental'
  | 'beat'
  | 'drums'
  | 'bass'
  | 'guitar'
  | 'keys'
  | 'midi'
  | 'sfx'
  | 'reference'
  | 'master';

export type EffectType =
  | 'eq'
  | 'compressor'
  | 'limiter'
  | 'gate'
  | 'reverb'
  | 'delay'
  | 'filter'
  | 'distortion'
  | 'width'
  | 'gain'
  | 'pitch';

export interface EffectInstance {
  id: string;
  type: EffectType;
  name: string;
  bypassed: boolean;
  params: Record<string, number>;
}

export interface AudioClip {
  id: string;
  trackId: string;
  name: string;
  url: string;
  recordingId?: string;
  galleryAssetId?: string;
  startTime: number;
  duration: number;
  displayStart: number;
  displayEnd: number;
  fadeIn: number;
  fadeOut: number;
  source: 'recorded' | 'imported' | 'generated' | 'live-studio' | 'midi';
  peaks?: number[];
}

export interface SoundTrack {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  effects: EffectInstance[];
  clips: AudioClip[];
}

export interface MixerState {
  bpm: number;
  timeSignature: [number, number];
  masterVolume: number;
  loop: { enabled: boolean; start: number; end: number };
  tracks: SoundTrack[];
  markers: { id: string; time: number; label: string }[];
  approval?: {
    status: 'draft' | 'pending' | 'approved' | 'revision';
    note?: string | null;
    by?: string;
    at?: string;
  };
  release?: {
    status: 'draft' | 'ready' | 'delivered';
    title?: string;
    artworkUrl?: string;
    notes?: string;
  };
  jingle?: {
    stage: string;
    brief?: string;
    lyrics?: string;
  };
  aiActions?: AIProductionAction[];
}

export interface AIProductionAction {
  id: string;
  prompt: string;
  summary: string;
  trackId?: string;
  effects: EffectInstance[];
  status: 'proposed' | 'previewing' | 'applied' | 'rejected';
  createdAt: string;
}

export interface SoundLabsProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  lyrics?: string;
  lyricsTitle?: string;
  generationEngine?: string;
  generationJobId?: string;
  generationStatus?: string;
  generatedAudioUrl?: string;
  mixerState?: MixerState | Record<string, unknown>;
  recordings?: Array<{
    id: string;
    name: string;
    s3Url: string;
    s3Key: string;
    fileSize: number;
    duration?: number;
    uploadStatus: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const TRACK_COLORS: Record<TrackType, string> = {
  vocal: '#39FF14',
  instrumental: '#27C7FF',
  beat: '#9d4edd',
  drums: '#ff6b35',
  bass: '#72FF3B',
  guitar: '#F2B632',
  keys: '#27C7FF',
  midi: '#BFC4C9',
  sfx: '#ff006e',
  reference: '#8D98A5',
  master: '#ffffff',
};

export const DEFAULT_MIXER_STATE: MixerState = {
  bpm: 120,
  timeSignature: [4, 4],
  masterVolume: 0.85,
  loop: { enabled: false, start: 0, end: 8 },
  tracks: [],
  markers: [],
};

export function normalizeMixerState(raw: unknown): MixerState {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Partial<MixerState>;
  return {
    bpm: typeof src.bpm === 'number' ? src.bpm : 120,
    timeSignature: Array.isArray(src.timeSignature) ? src.timeSignature : [4, 4],
    masterVolume: typeof src.masterVolume === 'number' ? src.masterVolume : 0.85,
    loop: src.loop || { enabled: false, start: 0, end: 8 },
    tracks: Array.isArray(src.tracks) ? src.tracks : [],
    markers: Array.isArray(src.markers) ? src.markers : [],
    approval: src.approval,
    release: src.release,
    jingle: src.jingle,
    aiActions: Array.isArray(src.aiActions) ? src.aiActions : [],
  };
}

export function createTrack(type: TrackType, name?: string): SoundTrack {
  return {
    id: `trk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name || type.toUpperCase(),
    type,
    color: TRACK_COLORS[type],
    volume: 0.85,
    pan: 0,
    muted: false,
    solo: false,
    armed: type === 'vocal',
    effects: [],
    clips: [],
  };
}
