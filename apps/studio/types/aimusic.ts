/**
 * AI Music Generator Types - Complete Suno-like Feature Set
 */

// Generation Modes
export type GenerationMode = 'text-to-song' | 'sounds' | 'audio-to-song';
export type SoundType = 'foley' | 'percussion' | 'synth' | 'ambience' | 'vocal';
export type LoopLength = 1 | 2 | 4 | 8 | 16;
export type TimeSignature = '2/4' | '3/4' | '4/4' | '5/4' | '7/8';
export type ExportFormat = 'mp3' | 'wav' | 'stems' | 'midi';

// Text-to-Song
export interface TextToSongParams {
  mode: 'text-to-song';
  description: string;
  genre: string;
  mood: string;
  tempo: number;
  instruments: string[];
  duration: number;
  customVoiceId?: string;
  customModelId?: string;
}

// Sounds/One-shots & Loops
export interface SoundsParams {
  mode: 'sounds';
  prompt: string;
  soundType: SoundType;
  loopLength: LoopLength;
  bpm: number;
  tag: string;
}

// Audio-to-Song
export interface AudioToSongParams {
  mode: 'audio-to-song';
  audioUrl: string;
  audioFile?: File;
  transformType: 'extend' | 'remix' | 'transform';
  prompt: string;
  duration: number;
}

export type GenerationParams = TextToSongParams | SoundsParams | AudioToSongParams;

// Voice Management
export interface CustomVoice {
  id: string;
  name: string;
  type: 'recorded' | 'uploaded';
  characterName?: string;
  description: string;
  sampleUrl?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface VoiceRecordingSession {
  id: string;
  startTime: Date;
  duration: number;
  waveformData: number[];
  isRecording: boolean;
  audioUrl?: string;
}

// Custom Models
export interface CustomModel {
  id: string;
  name: string;
  referenceTrackId: string;
  description: string;
  trainingProgress: number;
  status: 'training' | 'ready' | 'failed';
  createdAt: Date;
  characteristics: string[];
}

// Generated Track with Extended Metadata
export interface GeneratedTrack {
  id: string;
  type: 'song' | 'sound';
  title?: string;
  description?: string;
  genre: string;
  mood: string;
  tempo: number;
  timeSignature?: TimeSignature;
  duration: number;
  instruments: string[];
  lyrics?: string;
  lyricLine?: LyricLine[];
  prompt: string;
  url?: string;
  waveformData?: number[];
  stems?: StemTrack[];
  createdAt: Date;
  modifiedAt: Date;
  status: 'generating' | 'complete' | 'failed';
  progress: number;
  estimatedTime?: number;
  customVoiceId?: string;
  customModelId?: string;
  isFavorite: boolean;
  persona?: PersonaStyle;
  tags: string[];
}

// Stem Extraction
export interface StemTrack {
  id: string;
  name: 'vocals' | 'drums' | 'bass' | 'synths' | 'instruments' | 'effects' | 'ambience';
  url?: string;
  waveformData?: number[];
  volume: number;
  pan: number;
  isDry: boolean;
}

// Lyrics Editor
export interface LyricLine {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  emotion?: string;
  highlighted?: boolean;
  suggestions?: string[];
}

export interface LyricsEditorState {
  lyrics: string;
  lines: LyricLine[];
  selectedLineId?: string;
  rhymeScheme?: string;
}

// Mashup
export interface Mashup {
  id: string;
  name: string;
  track1Id: string;
  track2Id: string;
  mixRatio: number; // 0-100, where 50 is 50/50
  createdAt: Date;
  preview?: string;
}

// Multitrack Timeline
export interface TimelineClip {
  id: string;
  trackId: string;
  startTime: number;
  endTime: number;
  sourceTrackId: string;
  pitch: number; // -12 to +12 semitones
  speed: number; // 0.5 to 2.0
  volume: number; // 0 to 1
  pan: number; // -1 (left) to 1 (right)
  fadeIn?: { duration: number };
  fadeOut?: { duration: number };
}

export interface TimelineTrack {
  id: string;
  name: string;
  clips: TimelineClip[];
  volume: number;
  pan: number;
  isMuted: boolean;
  isSoloed: boolean;
  color: string;
}

export interface MultitrackTimeline {
  id: string;
  name: string;
  bpm: number;
  timeSignature: TimeSignature;
  tracks: TimelineTrack[];
  quantizeGrid: '1/4' | '1/8' | '1/16';
  tempoRamps?: TempoRamp[];
}

export interface TempoRamp {
  startTime: number;
  startBpm: number;
  endTime: number;
  endBpm: number;
}

// Personas (Style Learning)
export interface PersonaStyle {
  id: string;
  name: string;
  description: string;
  tags: string[];
  referenceTrackIds: string[];
  genrePreference: string;
  moodPreference: string;
  instrumentPreferences: string[];
  tempoRange: [number, number];
  characteristics: string[];
  createdAt: Date;
  usageCount: number;
}

// My Taste (User Preferences)
export interface UserTaste {
  favoriteGenres: string[];
  favoriteMoods: string[];
  preferredTempoRange: [number, number];
  preferredDuration: number;
  favoriteInstruments: string[];
  generationHistory: {
    trackId: string;
    timestamp: Date;
    rating: number; // 1-5
  }[];
  magicWandEnabled: boolean;
}

// Generation History & Library
export interface MusicLibrary {
  tracks: GeneratedTrack[];
  personas: PersonaStyle[];
  customVoices: CustomVoice[];
  customModels: CustomModel[];
  favorites: string[]; // track IDs
  playlists: Playlist[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

// Advanced Editing
export interface AdvancedEditingSession {
  id: string;
  trackId: string;
  originalTrack: GeneratedTrack;
  currentState: GeneratedTrack;
  warpMarkers: WarpMarker[];
  history: EditHistory[];
  historyIndex: number;
}

export interface WarpMarker {
  id: string;
  position: number;
  newPosition: number;
}

export interface EditHistory {
  id: string;
  action: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// State Management
export interface AIGeneratorState {
  library: MusicLibrary;
  currentGenerationMode: GenerationMode;
  currentGeneration: GeneratedTrack | null;
  generatingTracks: Map<string, GeneratedTrack>;
  isGenerating: boolean;
  activeTab: 'generate' | 'voices' | 'models' | 'edit' | 'lyrics' | 'library' | 'export';
  userTaste: UserTaste;
  voiceRecordingSession: VoiceRecordingSession | null;
  currentTimeline: MultitrackTimeline | null;
  currentLyricsEditor: LyricsEditorState | null;
  error: string | null;
}

// Export Options
export interface ExportOptions {
  format: ExportFormat;
  bitrate?: 'standard' | 'high' | 'lossless';
  sampleRate?: 44100 | 48000 | 96000;
  channels?: 'mono' | 'stereo';
  stems?: string[]; // stem IDs to export
  includeMetadata?: boolean;
}
