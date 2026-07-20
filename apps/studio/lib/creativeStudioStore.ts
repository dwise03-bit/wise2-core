import { create } from 'zustand';

export type PageId = 'command' | 'sound' | 'live' | 'jingle' | 'voice' | 'factory' | 'showcase';
export type CommandTag = 'GO TO' | 'AI' | 'RUN' | 'EXPORT' | 'PAY';

export interface Track {
  name: string;
  vol: number; // 0–1
  mute: boolean;
  solo: boolean;
}

export interface FXUnit {
  name: string;
  on: boolean;
  amt: number; // 0–100
}

export interface AudioChannel {
  name: string;
  vol: number; // 0–100
  mute: boolean;
}

export interface VideoSource {
  name: string;
  kind: 'SDI' | 'CAPTURE' | 'WEB' | 'FILE' | 'WRTC';
  on: boolean;
}

export interface Overlay {
  name: string;
  on: boolean;
}

export interface StreamOutput {
  name: string;
  on: boolean;
  viewers: string;
}

export interface ChatMessage {
  user: string;
  text: string;
  color: string;
}

export interface AIActivityItem {
  tag: 'SWITCH' | 'CLIP' | 'MOD' | 'CAPTION' | 'CHAPTER';
  t: string;
  when: string; // "now", "2m", "5m", etc.
}

export interface Jingle {
  name: string;
  meta: string;
  len: string;
}

export interface FactoryItem {
  name: string;
  kind: string;
  meta: string;
  status: 'RENDERING' | 'READY' | 'LIVE';
  rendering: boolean;
}

export interface CaseStudy {
  title: string;
  client: string;
  cat: string; // category
  f: string; // filter
  year: string;
  img?: string; // image path
  slot?: string; // image slot ref
  slotHint?: string;
  pos?: string; // background-position
  metric: string;
  metricLabel: string;
  modules: string;
}

export interface CreativeStudioState {
  // Navigation
  page: PageId;
  goToPage: (page: PageId) => void;

  // Command palette
  paletteOpen: boolean;
  paletteQ: string;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteQuery: (q: string) => void;

  // Dropdowns
  notifOpen: boolean;
  profileOpen: boolean;
  toggleNotif: () => void;
  toggleProfile: () => void;
  closeDropdowns: () => void;

  // Assistant
  assistantOpen: boolean;
  showAssistant: boolean;
  toggleAssistant: () => void;

  // Global metrics
  credits: number;
  viewers: number;
  chatRate: number;
  playing: boolean;
  isLive: boolean;
  liveSecs: number;

  // Sound Lab
  tempoRaw: number;
  durationRaw: number;
  ph: number; // playhead 0–1
  tracks: Track[];
  fx: FXUnit[];
  updateTrackVol: (index: number, vol: number) => void;
  toggleTrackMute: (index: number) => void;
  toggleTrackSolo: (index: number) => void;
  toggleFXUnit: (index: number) => void;
  setFXAmount: (index: number, amt: number) => void;

  // Live Studio
  sceneSel: number;
  previewSel: number;
  transSel: number;
  sources: VideoSource[];
  overlays: Overlay[];
  outputs: StreamOutput[];
  audioChans: AudioChannel[];
  chat: ChatMessage[];
  aiFeed: AIActivityItem[];
  chatDraft: string;
  setChatDraft: (text: string) => void;
  sendChat: () => void;

  // Jingle Lab
  genActive: boolean;
  genPct: number;
  jingles: Jingle[];
  startGeneration: () => void;

  // Voice Lab
  voiceSel: number;
  pauses: boolean;
  vParams: Record<string, number>;
  setVoiceParam: (name: string, val: number) => void;
  setVoiceSel: (index: number) => void;
  togglePauses: () => void;

  // Content Factory
  factorySel: number;
  factoryPrompt: string;
  factoryItems: FactoryItem[];
  setFactoryPrompt: (text: string) => void;
  submitFactoryJob: () => void;

  // Client Showcase
  gFilter: 'All' | 'Audio' | 'Video' | 'Live' | 'Brand';
  setGalleryFilter: (filter: 'All' | 'Audio' | 'Video' | 'Live' | 'Brand') => void;

  // Checkout
  checkoutOpen: boolean;
  packSel: number;
  paying: boolean;
  payDone: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  selectPack: (index: number) => void;
  payNow: () => void;
}

// Mock data
const INITIAL_TRACKS: Track[] = [
  { name: '808', vol: 0.82, mute: false, solo: false },
  { name: 'Snare', vol: 0.66, mute: false, solo: false },
  { name: 'Hats', vol: 0.58, mute: false, solo: false },
  { name: 'Bass', vol: 0.74, mute: false, solo: false },
  { name: 'Keys', vol: 0.52, mute: true, solo: false },
  { name: 'Melody', vol: 0.61, mute: false, solo: false },
  { name: 'Vocal', vol: 0.88, mute: false, solo: true },
];

const INITIAL_FX: FXUnit[] = [
  { name: 'Parametric EQ', on: true, amt: 62 },
  { name: 'Compressor', on: true, amt: 45 },
  { name: 'De-Noise AI', on: true, amt: 80 },
  { name: 'Saturator', on: false, amt: 25 },
];

const INITIAL_AUDIO_CHANS: AudioChannel[] = [
  { name: 'Mic — SM7B', vol: 82, mute: false },
  { name: 'Guest — Daniel', vol: 71, mute: false },
  { name: 'Music Bed', vol: 38, mute: false },
  { name: 'System / VT', vol: 55, mute: true },
];

const INITIAL_SOURCES: VideoSource[] = [
  { name: 'Camera A — FX6', kind: 'SDI', on: true },
  { name: 'Camera B — Wide', kind: 'SDI', on: true },
  { name: 'Screen — Sound Lab', kind: 'CAPTURE', on: true },
  { name: 'Browser — Alerts', kind: 'WEB', on: true },
  { name: 'Media — Intro Loop', kind: 'FILE', on: false },
  { name: 'Guest — Daniel', kind: 'WRTC', on: true },
];

const INITIAL_OVERLAYS: Overlay[] = [
  { name: 'Lower Third — Host', on: true },
  { name: 'Brand Frame', on: true },
  { name: 'News Ticker', on: true },
  { name: 'Chat on Screen', on: false },
];

const INITIAL_OUTPUTS: StreamOutput[] = [
  { name: 'YouTube', on: true, viewers: '842 watching' },
  { name: 'Twitch', on: true, viewers: '511 watching' },
  { name: 'TikTok Live', on: true, viewers: '389 watching' },
  { name: 'Facebook', on: false, viewers: 'off' },
  { name: 'Custom RTMP', on: false, viewers: 'off' },
];

const INITIAL_CHAT: ChatMessage[] = [
  { user: 'BeatSmith_LA', text: 'that 808 pattern is disgusting 🔥', color: '#39FF14' },
  { user: 'nova.creates', text: 'What DAW is this??', color: '#9be07c' },
  { user: 'MOD·Kira', text: 'Welcome new viewers — drop your city', color: '#e0a83c' },
  { user: 'trapgod_musik', text: 'ran the replay 4 times already', color: '#39FF14' },
  { user: 'sf_hustler', text: 'Bay Area checking in', color: '#9be07c' },
  { user: 'audiowerks', text: 'AI mastering demo when?', color: '#39FF14' },
];

const INITIAL_AI_FEED: AIActivityItem[] = [
  { tag: 'SWITCH', t: 'Cut to Cam A — Darrin speaking', when: 'now' },
  { tag: 'CLIP', t: 'Highlight detected — beat drop reaction', when: '2m' },
  { tag: 'MOD', t: 'Removed 2 spam messages from chat', when: '5m' },
  { tag: 'CAPTION', t: 'Transcript synced to cloud', when: '9m' },
];

const INITIAL_JINGLES: Jingle[] = [
  { name: 'Ironclad Fitness — Anthem Cut', meta: 'Hip Hop · Deep Male · exported today', len: '0:30' },
  { name: 'Northside HVAC — Radio Sweep', meta: 'Funk · Duo Harmony · Jul 17', len: '0:15' },
  { name: 'Elite Detail Co. — Hold Loop', meta: 'Lo-fi · Instrumental · Jul 16', len: '1:00' },
  { name: 'Wise Defense — Podcast Intro', meta: 'Cinematic · Deep Male · Jul 14', len: '0:20' },
  { name: 'Casa Verde — Summer Spot', meta: 'Pop · Bright Female · Jul 12', len: '0:30' },
];

const INITIAL_FACTORY_ITEMS: FactoryItem[] = [
  { name: 'Summer Promo — Vertical Cut', kind: 'VIDEO 9:16', meta: 'Reels · TikTok', status: 'RENDERING', rendering: true },
  { name: 'Ironclad Launch Email', kind: 'EMAIL', meta: '3 variants', status: 'RENDERING', rendering: true },
  { name: 'Gym Floor Hero Shot', kind: 'IMAGE 16:9', meta: '4K upscaled', status: 'READY', rendering: false },
  { name: 'Trainer Spotlight Short', kind: 'SHORT 0:22', meta: 'YouTube Shorts', status: 'READY', rendering: false },
  { name: 'July Blog — Recovery Guide', kind: 'BLOG POST', meta: '1,840 words', status: 'READY', rendering: false },
  { name: 'Membership Ad Set', kind: 'AD · 4 SIZES', meta: 'Meta + Google', status: 'READY', rendering: false },
  { name: 'Podcast Ep. 12 Voiceover', kind: 'VOICEOVER', meta: 'Wise Deep · 14:02', status: 'READY', rendering: false },
  { name: 'Landing Page — Summer', kind: 'LANDING', meta: 'Published', status: 'LIVE', rendering: false },
];

export const useCreativeStudioStore = create<CreativeStudioState>((set) => ({
  // Navigation
  page: 'command',
  goToPage: (page) => set({ page, paletteOpen: false, notifOpen: false, profileOpen: false }),

  // Command palette
  paletteOpen: false,
  paletteQ: '',
  openPalette: () => set({ paletteOpen: true, paletteQ: '' }),
  closePalette: () => set({ paletteOpen: false }),
  setPaletteQuery: (q) => set({ paletteQ: q }),

  // Dropdowns
  notifOpen: false,
  profileOpen: false,
  toggleNotif: () => set((s) => ({ notifOpen: !s.notifOpen, profileOpen: false })),
  toggleProfile: () => set((s) => ({ profileOpen: !s.profileOpen, notifOpen: false })),
  closeDropdowns: () => set({ notifOpen: false, profileOpen: false }),

  // Assistant
  assistantOpen: true,
  showAssistant: true,
  toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),

  // Global metrics
  credits: 7214,
  viewers: 1742,
  chatRate: 96,
  playing: true,
  isLive: true,
  liveSecs: 1937,

  // Sound Lab
  tempoRaw: 124,
  durationRaw: 30,
  ph: 0.28,
  tracks: INITIAL_TRACKS,
  fx: INITIAL_FX,
  updateTrackVol: (index, vol) =>
    set((s) => {
      const tracks = s.tracks.slice();
      tracks[index] = { ...tracks[index], vol };
      return { tracks };
    }),
  toggleTrackMute: (index) =>
    set((s) => {
      const tracks = s.tracks.slice();
      tracks[index] = { ...tracks[index], mute: !tracks[index].mute };
      return { tracks };
    }),
  toggleTrackSolo: (index) =>
    set((s) => {
      const tracks = s.tracks.slice();
      tracks[index] = { ...tracks[index], solo: !tracks[index].solo };
      return { tracks };
    }),
  toggleFXUnit: (index) =>
    set((s) => {
      const fx = s.fx.slice();
      fx[index] = { ...fx[index], on: !fx[index].on };
      return { fx };
    }),
  setFXAmount: (index, amt) =>
    set((s) => {
      const fx = s.fx.slice();
      fx[index] = { ...fx[index], amt };
      return { fx };
    }),

  // Live Studio
  sceneSel: 1,
  previewSel: 3,
  transSel: 1,
  sources: INITIAL_SOURCES,
  overlays: INITIAL_OVERLAYS,
  outputs: INITIAL_OUTPUTS,
  audioChans: INITIAL_AUDIO_CHANS,
  chat: INITIAL_CHAT,
  aiFeed: INITIAL_AI_FEED,
  chatDraft: '',
  setChatDraft: (text) => set({ chatDraft: text }),
  sendChat: () =>
    set((s) => {
      if (!s.chatDraft.trim()) return { chatDraft: '' };
      return {
        chat: [...s.chat, { user: 'WISE² Studio', text: s.chatDraft, color: '#fff' }],
        chatDraft: '',
      };
    }),

  // Jingle Lab
  genActive: false,
  genPct: 0,
  jingles: INITIAL_JINGLES,
  startGeneration: () => set({ genActive: true, genPct: 0 }),

  // Voice Lab
  voiceSel: 0,
  pauses: true,
  vParams: { Stability: 72, Similarity: 85, 'Style Exaggeration': 40, Energy: 66, Confidence: 78 },
  setVoiceParam: (name, val) =>
    set((s) => ({
      vParams: { ...s.vParams, [name]: val },
    })),
  setVoiceSel: (index) => set({ voiceSel: index }),
  togglePauses: () => set((s) => ({ pauses: !s.pauses })),

  // Content Factory
  factorySel: 0,
  factoryPrompt: '',
  factoryItems: INITIAL_FACTORY_ITEMS,
  setFactoryPrompt: (text) => set({ factoryPrompt: text }),
  submitFactoryJob: () =>
    set((s) => {
      if (!s.factoryPrompt.trim()) return {};
      const types = ['IMAGES', 'VIDEOS', 'SHORTS', 'ADS', 'VOICEOVERS', 'EMAILS', 'BLOGS', 'LANDING PAGES'];
      const kind = types[s.factorySel];
      const item: FactoryItem = {
        name: s.factoryPrompt,
        kind,
        meta: 'queued just now',
        status: 'RENDERING',
        rendering: true,
      };
      return {
        factoryItems: [item, ...s.factoryItems].slice(0, 8),
        factoryPrompt: '',
      };
    }),

  // Client Showcase
  gFilter: 'All',
  setGalleryFilter: (filter) => set({ gFilter: filter }),

  // Checkout
  checkoutOpen: false,
  packSel: 1,
  paying: false,
  payDone: false,
  openCheckout: () => set({ checkoutOpen: true, payDone: false, paying: false }),
  closeCheckout: () => set({ checkoutOpen: false }),
  selectPack: (index) => set({ packSel: index }),
  payNow: () =>
    set((s) => {
      if (s.paying) return {};
      return {
        paying: true,
      };
    }),
}));
