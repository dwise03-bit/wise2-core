/**
 * Sound Lab provider adapters.
 * Switch local / GPU / future commercial providers here without rewriting the studio.
 */

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

export const PROVIDERS = {
  music: {
    id: 'musicgen-local',
    kind: 'MusicGenerationProvider',
    connected: true,
    note: 'WISE² MusicGen service via MUSICGEN_API_URL (default localhost:5000). Not Suno.',
  },
  voice: {
    id: 'voice-lab',
    kind: 'VoiceProvider',
    connected: false,
    note: 'Use existing Voice Lab / Hermes. Persona registry requires explicit authorization.',
  },
  stems: {
    id: 'none',
    kind: 'StemProvider',
    connected: false,
    note: 'BLOCKED — no Demucs or similar adapter is wired. Do not fake stems.',
  },
  mastering: {
    id: 'webaudio-limiter',
    kind: 'MasteringProvider',
    connected: true,
    note: 'Browser DynamicsCompressor limiter + EQ. Not a commercial mastering suite.',
  },
  processing: {
    id: 'webaudio',
    kind: 'AudioProcessingProvider',
    connected: true,
    note: 'EQ, compressor, reverb, delay, filter, distortion, gain in the browser.',
  },
  storage: {
    id: 'gallery-disk',
    kind: 'Storage',
    connected: true,
    note: 'Gallery local uploads. S3 service remains a stub.',
  },
} as const;
