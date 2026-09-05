/**
 * Suno Music Generation Types
 * Comprehensive type definitions for Suno integration
 */

export type SunoGenre =
  | 'Pop' | 'Electronic' | 'Hip-Hop' | 'Classical' | 'Jazz' | 'Ambient' | 'Folk'
  | 'Rock' | 'R&B' | 'Country' | 'Indie' | 'Alternative' | 'Reggae' | 'Blues'
  | 'Metal' | 'Punk' | 'Disco' | 'House' | 'Techno' | 'Trance' | 'Dubstep'
  | 'Trap' | 'K-Pop' | 'J-Pop' | 'Afrobeats' | 'Ska' | 'Grunge' | 'Emo'
  | 'Gospel' | 'Soul' | 'Funk' | 'Bossa Nova' | 'Latin' | 'Salsa' | 'Reggaeton'
  | 'Experimental' | 'Psychedelic' | 'Synthwave' | 'Lo-Fi' | 'Vaporwave' | 'Chillwave'
  | 'Orchestral' | 'Cinematic' | 'Ambient Electronic' | 'Industrial' | 'Post-Punk'
  | 'New Wave' | 'Synthpop' | 'Dream Pop' | 'Shoegaze' | 'Indie Pop';

export type SunoMood =
  | 'Happy' | 'Sad' | 'Energetic' | 'Calm' | 'Dark' | 'Uplifting'
  | 'Romantic' | 'Aggressive' | 'Melancholic' | 'Playful' | 'Mysterious' | 'Nostalgic';

export type SunoVoice =
  | 'Bella' | 'Marco' | 'Skye' | 'Bossa' | 'Guidian' | 'Zephyr'
  | 'Chorus' | 'Ivy' | 'River' | 'Alex' | 'Karl' | 'Luna'
  | 'Breeze' | 'Echo' | 'Harmony' | 'Vale' | 'Fox' | 'Nova';

export type SunoKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type SunoScale = 'Major' | 'Minor';

export type GenerationStatus =
  | 'Queued'
  | 'PendingOnline'
  | 'Generating'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';
export type VocalType = 'Vocal' | 'Instrumental';

export interface SunoGenerationParams {
  prompt: string;
  genre: SunoGenre;
  mood: SunoMood;
  tempo: number; // 40-200 BPM
  duration: number; // 10, 30, or 60 seconds
  voice: SunoVoice;
  vocalType: VocalType;
  key: SunoKey;
  scale: SunoScale;
  lyrics?: string; // Optional custom lyrics
  style?: string; // Optional style override
}

export interface SunoGeneration {
  id: string;
  params: SunoGenerationParams;
  status: GenerationStatus;
  createdAt: Date;
  completedAt?: Date;
  audioUrl?: string;
  waveformData?: number[];
  duration: number;
  bitrate: string;
  fileSize: string;
  error?: string;
  tags: string[];
  isFavorite: boolean;
  playCount: number;
  exportedFormats: ('mp3' | 'wav' | 'flac')[];
}

export interface SunoQueueItem {
  generationId: string;
  position: number;
  status: GenerationStatus;
  progress: number; // 0-100
  estimatedTime: number; // seconds
}

export interface SunoLibraryFilters {
  search?: string;
  dateRange?: { from: Date; to: Date };
  genres?: SunoGenre[];
  moods?: SunoMood[];
  durations?: number[];
  statuses?: GenerationStatus[];
  favorites?: boolean;
}

export interface SunoExportOptions {
  format: 'mp3' | 'wav' | 'flac';
  bitrate?: string;
  quality?: 'high' | 'medium' | 'low';
}

export interface SunoLibraryState {
  generations: SunoGeneration[];
  queue: SunoQueueItem[];
  currentGeneration?: SunoGeneration;
  isLoading: boolean;
  error?: string;
}
