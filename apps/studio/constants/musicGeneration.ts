/**
 * Music Generation Constants
 * Centralized data for genres, moods, instruments, voices, etc.
 */

// Genre Categories - Organized by style
export const GENRE_CATEGORIES = {
  'Electronic': ['EDM', 'Synthwave', 'Techno', 'House', 'Drum & Bass', 'Downtempo', 'Ambient', 'Chillwave', 'Electro', 'Industrial'],
  'Hip-Hop': ['Trap', 'Boom Bap', 'Mumble Rap', 'Conscious Hip-Hop', 'Drill', 'Phonk', 'Cloud Rap', 'UK Garage'],
  'Pop': ['K-Pop', 'J-Pop', 'Disco Pop', 'Dance-Pop', 'Pop Punk', 'Synth-Pop', 'Pop Rock', 'Electropop'],
  'Rock': ['Alternative Rock', 'Hard Rock', 'Indie Rock', 'Progressive Rock', 'Punk', 'Metal', 'Psychedelic Rock', 'Post-Punk'],
  'Classical': ['Symphony', 'Chamber', 'Baroque', 'Romantic', 'Contemporary', 'Minimalist', 'Opera', 'Concerto'],
  'Jazz': ['Bebop', 'Cool Jazz', 'Fusion', 'Smooth Jazz', 'Free Jazz', 'Modal Jazz', 'Hard Bop'],
  'Ambient': ['Dark Ambient', 'Cinematic', 'Drone', 'Experimental', 'Generative', 'Soundscape'],
  'Folk': ['Indie Folk', 'Traditional', 'Folk-Pop', 'Celtic', 'Americana', 'Psych Folk'],
  'EDM': ['Festival EDM', 'Minimal', 'Trance', 'Deep House', 'Progressive House', 'Dubstep'],
  'Metal': ['Death Metal', 'Black Metal', 'Progressive Metal', 'Symphonic Metal', 'Thrash Metal', 'Djent'],
  'Country': ['Outlaw Country', 'Honky-Tonk', 'Americana', 'Country Pop', 'Country Rock', 'Bluegrass'],
  'Reggae': ['Dancehall', 'Roots Reggae', 'Reggae Fusion', 'Dub', 'Ska'],
  'Latin': ['Reggaeton', 'Salsa', 'Bachata', 'Cumbia', 'Bossa Nova', 'Merengue', 'Mambo'],
  'R&B': ['Contemporary R&B', 'Neo-Soul', 'Funk', 'Soul', 'Quiet Storm', 'R&B Rap Fusion'],
  'Anime': ['Anime OP', 'Anime ED', 'VTuber Music', 'J-Pop Anime', 'Anime Soundtrack', 'Vocaloid'],
} as const;

// Get all genres as flat array
export const ALL_GENRES = Object.values(GENRE_CATEGORIES).flat();
export const POPULAR_GENRES = ['Pop', 'Electronic', 'Hip-Hop', 'Classical', 'Rock', 'Jazz'];

// Moods with metadata
export const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: 'from-yellow-500 to-orange-500',
    sample: '/samples/moods/happy.mp3',
    description: 'Uplifting and cheerful',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: 'from-blue-500 to-indigo-500',
    sample: '/samples/moods/sad.mp3',
    description: 'Melancholic and introspective',
  },
  {
    id: 'energetic',
    label: 'Energetic',
    emoji: '⚡',
    color: 'from-red-500 to-pink-500',
    sample: '/samples/moods/energetic.mp3',
    description: 'High-energy and driving',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    color: 'from-cyan-500 to-blue-400',
    sample: '/samples/moods/calm.mp3',
    description: 'Peaceful and relaxing',
  },
  {
    id: 'dark',
    label: 'Dark',
    emoji: '🌑',
    color: 'from-purple-900 to-black',
    sample: '/samples/moods/dark.mp3',
    description: 'Intense and moody',
  },
  {
    id: 'uplifting',
    label: 'Uplifting',
    emoji: '✨',
    color: 'from-green-400 to-cyan-500',
    sample: '/samples/moods/uplifting.mp3',
    description: 'Inspiring and motivational',
  },
  {
    id: 'melancholic',
    label: 'Melancholic',
    emoji: '🎻',
    color: 'from-slate-600 to-slate-800',
    sample: '/samples/moods/melancholic.mp3',
    description: 'Thoughtful and somber',
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    emoji: '🔥',
    color: 'from-red-700 to-orange-600',
    sample: '/samples/moods/aggressive.mp3',
    description: 'Intense and powerful',
  },
] as const;

export const MOOD_IDS = MOODS.map(m => m.id);
export type MoodId = typeof MOOD_IDS[number];

// Instruments with metadata
export const INSTRUMENTS = [
  { id: 'drums', label: 'Drums', emoji: '🥁', description: 'Percussion rhythm section' },
  { id: 'bass', label: 'Bass', emoji: '🎸', description: 'Low-end foundation' },
  { id: 'piano', label: 'Piano', emoji: '🎹', description: 'Melodic/harmonic element' },
  { id: 'guitar', label: 'Guitar', emoji: '🎸', description: 'Rhythmic or lead element' },
  { id: 'synth', label: 'Synth', emoji: '⌨️', description: 'Electronic synthesis' },
  { id: 'strings', label: 'Strings', emoji: '🎻', description: 'Orchestral element' },
  { id: 'brass', label: 'Brass', emoji: '🎺', description: 'Powerful horn section' },
  { id: 'woodwinds', label: 'Woodwinds', emoji: '🎷', description: 'Melodic wind instruments' },
  { id: 'vocals', label: 'Vocals', emoji: '🎤', description: 'Vocal elements' },
] as const;

export const INSTRUMENT_IDS = INSTRUMENTS.map(i => i.id);
export type InstrumentId = typeof INSTRUMENT_IDS[number];

// Musical Keys - All 12 chromatic keys
export const KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
] as const;

export type KeyType = typeof KEYS[number];

// Musical Scales
export const SCALES = [
  { id: 'major', name: 'Major', description: 'Bright and happy' },
  { id: 'minor', name: 'Minor', description: 'Dark and melancholic' },
  { id: 'harmonic-minor', name: 'Harmonic Minor', description: 'Eastern and exotic' },
  { id: 'dorian', name: 'Dorian', description: 'Modal and sophisticated' },
  { id: 'phrygian', name: 'Phrygian', description: 'Spanish and dramatic' },
  { id: 'lydian', name: 'Lydian', description: 'Dreamy and floaty' },
  { id: 'mixolydian', name: 'Mixolydian', description: 'Blues and funk' },
  { id: 'pentatonic', name: 'Pentatonic', description: 'Asian and folk' },
] as const;

export const SCALE_NAMES = SCALES.map(s => s.name);
export type ScaleName = typeof SCALE_NAMES[number];

// Tempo Presets
export const TEMPO_PRESETS = [
  { label: 'Slow', bpm: 60, icon: '🐢' },
  { label: 'Walking', bpm: 90, icon: '🚶' },
  { label: 'Moderate', bpm: 120, icon: '🎵' },
  { label: 'Upbeat', bpm: 140, icon: '🏃' },
  { label: 'Fast', bpm: 160, icon: '⚡' },
] as const;

// Tempo ranges
export const TEMPO_CONFIG = {
  min: 40,
  max: 200,
  step: 5,
  default: 120,
} as const;

// Duration ranges
export const DURATION_CONFIG = {
  min: 10,
  max: 120,
  default: 30,
  presets: [10, 30, 60] as const,
} as const;

// Pre-trained Voices
export const VOICES = [
  {
    id: 'voice-1',
    name: 'Sarah',
    gender: 'Female',
    accent: 'American',
    age: '20s',
    tone: 'Warm and bright',
    sample: '/samples/voices/sarah.mp3',
  },
  {
    id: 'voice-2',
    name: 'James',
    gender: 'Male',
    accent: 'British',
    age: '30s',
    tone: 'Deep and confident',
    sample: '/samples/voices/james.mp3',
  },
  {
    id: 'voice-3',
    name: 'Luna',
    gender: 'Female',
    accent: 'European',
    age: '20s',
    tone: 'Ethereal and angelic',
    sample: '/samples/voices/luna.mp3',
  },
  {
    id: 'voice-4',
    name: 'Chen',
    gender: 'Male',
    accent: 'Asian',
    age: '30s',
    tone: 'Smooth and melodic',
    sample: '/samples/voices/chen.mp3',
  },
  {
    id: 'voice-5',
    name: 'Alex',
    gender: 'Neutral',
    accent: 'American',
    age: '20s',
    tone: 'Clean and modern',
    sample: '/samples/voices/alex.mp3',
  },
  {
    id: 'voice-6',
    name: 'Sofia',
    gender: 'Female',
    accent: 'European',
    age: '40s',
    tone: 'Rich and mature',
    sample: '/samples/voices/sofia.mp3',
  },
] as const;

export const VOICE_GENDERS = ['Male', 'Female', 'Neutral'] as const;
export const VOICE_ACCENTS = ['American', 'British', 'European', 'Asian'] as const;

export type VoiceGender = typeof VOICE_GENDERS[number];
export type VoiceAccent = typeof VOICE_ACCENTS[number];

// Quality Presets
export const QUALITY_PRESETS = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Fast generation',
    baseTime: 45,
    multiplier: 1,
  },
  {
    id: 'high',
    label: 'High',
    description: 'Balanced quality',
    baseTime: 75,
    multiplier: 1.5,
  },
  {
    id: 'ultra',
    label: 'Ultra',
    description: 'Maximum quality',
    baseTime: 120,
    multiplier: 2,
  },
] as const;

export const QUALITY_LABELS = ['standard', 'high', 'ultra'] as const;
export type QualityLabel = typeof QUALITY_LABELS[number];

// Intensity Levels
export const INTENSITY_CONFIG = {
  min: 1,
  max: 10,
  default: 5,
  step: 1,
} as const;

// Variants to Generate
export const VARIANTS_CONFIG = {
  min: 1,
  max: 5,
  default: 1,
  options: [1, 2, 3, 4, 5] as const,
} as const;

// Character Limits
export const CHAR_LIMITS = {
  description: 500,
  minDescription: 10,
  promptName: 100,
} as const;

// API Configuration
export const API_CONFIG = {
  generateEndpoint: '/api/suno/generate',
  timeout: 300000, // 5 minutes
} as const;

// Key-Mood Suggestions
export const KEY_MOOD_SUGGESTIONS: Record<MoodId, { key: KeyType; scale: ScaleName }> = {
  happy: { key: 'C', scale: 'Major' },
  sad: { key: 'A', scale: 'Minor' },
  energetic: { key: 'E', scale: 'Major' },
  calm: { key: 'F', scale: 'Major' },
  dark: { key: 'D', scale: 'Minor' },
  uplifting: { key: 'G', scale: 'Major' },
  melancholic: { key: 'C', scale: 'Minor' },
  aggressive: { key: 'D', scale: 'Minor' },
};

// Instrument-Genre Suggestions
export const INSTRUMENT_GENRE_SUGGESTIONS: Record<string, InstrumentId[]> = {
  'Classical': ['piano', 'strings', 'woodwinds', 'brass'],
  'Jazz': ['piano', 'bass', 'drums', 'brass', 'woodwinds'],
  'Pop': ['drums', 'bass', 'guitar', 'synth', 'vocals'],
  'Rock': ['drums', 'bass', 'guitar', 'vocals'],
  'Hip-Hop': ['drums', 'bass', 'synth'],
  'Electronic': ['synth', 'drums', 'bass'],
  'Ambient': ['synth', 'strings', 'piano'],
  'Country': ['guitar', 'bass', 'drums', 'vocals'],
};

// Common Prompt Templates
export const PROMPT_TEMPLATES = [
  {
    id: 'upbeat-dance',
    name: 'Upbeat Dance',
    template: 'High-energy dance track with pumping beat and bright synths',
  },
  {
    id: 'chill-lofi',
    name: 'Chill Lo-Fi',
    template: 'Relaxing lo-fi beat with jazzy chords and vinyl crackle',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    template: 'Orchestral cinematic track with dramatic strings and brass',
  },
  {
    id: 'ambient-pad',
    name: 'Ambient Pad',
    template: 'Ethereal ambient soundscape with evolving pads and texture',
  },
  {
    id: 'trap-rap',
    name: 'Trap Rap',
    template: 'Hard-hitting trap beat with hi-hat rolls and deep bass',
  },
] as const;

/**
 * Get suggested key and scale for a mood
 */
export function getKeySuggestionsForMood(mood: MoodId) {
  return KEY_MOOD_SUGGESTIONS[mood];
}

/**
 * Get suggested instruments for a genre
 */
export function getInstrumentSuggestionsForGenre(genre: string): InstrumentId[] {
  return INSTRUMENT_GENRE_SUGGESTIONS[genre] || [];
}

/**
 * Format tempo with label
 */
export function formatTempo(bpm: number): string {
  if (bpm <= 60) return 'Slow';
  if (bpm <= 90) return 'Walking';
  if (bpm <= 120) return 'Moderate';
  if (bpm <= 140) return 'Upbeat';
  return 'Fast';
}

/**
 * Format duration to MM:SS
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get duration category
 */
export function getDurationCategory(seconds: number): string {
  if (seconds < 30) return 'short';
  if (seconds < 60) return 'medium';
  return 'full';
}

/**
 * Estimate generation time based on quality and duration
 */
export function estimateGenerationTime(
  quality: QualityLabel,
  duration: number
): number {
  const preset = QUALITY_PRESETS.find(p => p.id === quality);
  if (!preset) return 60;

  const baseTime = preset.baseTime;
  const durationFactor = (duration / 30) * 20; // Adjust by duration
  return baseTime + durationFactor;
}

export default {
  GENRE_CATEGORIES,
  ALL_GENRES,
  POPULAR_GENRES,
  MOODS,
  INSTRUMENTS,
  KEYS,
  SCALES,
  TEMPO_PRESETS,
  VOICES,
  QUALITY_PRESETS,
  VOICE_GENDERS,
  VOICE_ACCENTS,
  CHAR_LIMITS,
  API_CONFIG,
};
