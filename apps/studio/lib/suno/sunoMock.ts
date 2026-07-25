/**
 * Suno API Mock Implementation
 * Provides realistic mock data for MVP testing when API is unavailable
 *
 * Features:
 * - Realistic mock generation responses
 * - Simulated generation time (30-60 seconds)
 * - Mock audio file data
 * - Consistent mock data seeding for reproducibility
 */

import { SunoGenerationRequest, SunoGenerationResponse, SunoStatusResponse } from '@/types/api';

// ============================================================================
// CONSTANTS
// ============================================================================

// Sample prompts for better mock data
const SAMPLE_PROMPTS = [
  'upbeat pop track with catchy hooks and modern production',
  'ambient electronic music with atmospheric pads and gentle beats',
  'high-energy hip-hop with strong bass and rhythmic elements',
  'classical orchestral piece with dramatic strings',
  'relaxing lo-fi beats perfect for studying',
  'funk track with groovy bassline and smooth vocals',
  'indie rock with guitar-driven melodies',
  'synthwave music with nostalgic 80s vibes',
];

const SAMPLE_STYLES = [
  'pop',
  'electronic',
  'hip-hop',
  'classical',
  'ambient',
  'funk',
  'rock',
  'synthwave',
];

const MOCK_AUDIO_URLS = [
  'https://d.mock-cdn.local/gen_mock_001.mp3',
  'https://d.mock-cdn.local/gen_mock_002.mp3',
  'https://d.mock-cdn.local/gen_mock_003.mp3',
  'https://d.mock-cdn.local/gen_mock_004.mp3',
  'https://d.mock-cdn.local/gen_mock_005.mp3',
];

// ============================================================================
// TYPES
// ============================================================================

export interface MockGenerationData {
  id: string;
  prompt: string;
  style: string;
  duration: number;
  createdAt: string;
  simulatedCompletionTime: number; // milliseconds
  mockAudioUrl: string;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Simple hash function for consistent mock data
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Create a mock generation response
 */
export function createMockGeneration(
  generationId: string,
  params: SunoGenerationRequest
): MockGenerationData {
  const seed = hashString(generationId);
  const random = seededRandom(seed);

  // Use provided prompt or pick a random sample
  const prompt = params.prompt && params.prompt.length > 0
    ? params.prompt
    : SAMPLE_PROMPTS[Math.floor(random * SAMPLE_PROMPTS.length)];

  // Use provided style or pick a random sample
  const style = params.style || SAMPLE_STYLES[Math.floor(random * SAMPLE_STYLES.length)];

  // Duration defaults to 30 seconds
  const duration = params.duration || 30;

  // Simulate generation time between 30-60 seconds
  const simulatedCompletionTime = 30000 + (random * 30000);

  // Pick a mock audio URL based on seed
  const mockAudioUrl = MOCK_AUDIO_URLS[Math.floor((seed % 5))];

  return {
    id: generationId,
    prompt,
    style,
    duration,
    createdAt: new Date().toISOString(),
    simulatedCompletionTime,
    mockAudioUrl,
  };
}

/**
 * Create a mock generation response (API response format)
 */
export function createMockGenerationResponse(
  generationId: string,
  params: SunoGenerationRequest
): SunoGenerationResponse {
  const mockData = createMockGeneration(generationId, params);

  return {
    id: mockData.id,
    prompt: mockData.prompt,
    style: mockData.style,
    status: 'pending',
    createdAt: mockData.createdAt,
    updatedAt: mockData.createdAt,
  };
}

/**
 * Create a mock status response
 */
export function createMockStatusResponse(
  generationId: string,
  elapsedMs: number,
  mockData: MockGenerationData
): SunoStatusResponse {
  // Calculate progress based on elapsed time
  const progress = Math.min(99, Math.round((elapsedMs / mockData.simulatedCompletionTime) * 100));

  // Determine status
  let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
  if (progress >= 100) {
    status = 'completed';
  } else if (progress < 20) {
    status = 'pending';
  }

  const response: SunoStatusResponse = {
    id: generationId,
    prompt: mockData.prompt,
    style: mockData.style,
    status,
    progress,
    duration: mockData.duration,
    createdAt: mockData.createdAt,
    updatedAt: new Date().toISOString(),
  };

  // Add music URL and completion time when complete
  if (status === 'completed') {
    response.musicUrl = mockData.mockAudioUrl;
    response.completedAt = new Date().toISOString();
  }

  return response;
}

/**
 * Generate mock audio data (WAV format header + silence)
 * This creates a valid WAV file with the correct format but no actual audio
 */
export function generateMockAudio(durationSeconds: number): ArrayBuffer {
  const sampleRate = 44100;
  const channels = 2;
  const bytesPerSample = 2;
  const numSamples = sampleRate * durationSeconds * channels;

  // WAV file header (44 bytes)
  const buffer = new ArrayBuffer(44 + (numSamples * bytesPerSample));
  const view = new DataView(buffer);
  const offset = 0;

  // Helper function to write string to DataView
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // WAV header
  writeString(offset, 'RIFF');
  view.setUint32(offset + 4, 36 + (numSamples * bytesPerSample), true); // File size - 8
  writeString(offset + 8, 'WAVE');

  // fmt subchunk
  writeString(offset + 12, 'fmt ');
  view.setUint32(offset + 16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(offset + 20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(offset + 22, channels, true); // NumChannels
  view.setUint32(offset + 24, sampleRate, true); // SampleRate
  view.setUint32(offset + 28, sampleRate * channels * bytesPerSample, true); // ByteRate
  view.setUint16(offset + 32, channels * bytesPerSample, true); // BlockAlign
  view.setUint16(offset + 34, 16, true); // BitsPerSample

  // data subchunk
  writeString(offset + 36, 'data');
  view.setUint32(offset + 40, numSamples * bytesPerSample, true); // Subchunk2Size

  // Fill with silence (zeros)
  const dataView = new Uint16Array(buffer, 44);
  for (let i = 0; i < dataView.length; i++) {
    dataView[i] = 0;
  }

  return buffer;
}

/**
 * Create mock generation history
 */
export function createMockGenerationHistory(
  userId: string,
  count: number = 10
) {
  const history = [];

  for (let i = 0; i < count; i++) {
    const seed = hashString(`${userId}-${i}`);
    const random = seededRandom(seed);

    history.push({
      id: `gen_mock_${i}_${Date.now()}`,
      prompt: SAMPLE_PROMPTS[Math.floor(random * SAMPLE_PROMPTS.length)],
      style: SAMPLE_STYLES[Math.floor((random * 100) % SAMPLE_STYLES.length)],
      status: 'completed' as const,
      musicUrl: MOCK_AUDIO_URLS[i % MOCK_AUDIO_URLS.length],
      duration: 30 + Math.floor(random * 30),
      createdAt: new Date(Date.now() - i * 60000 * 1000).toISOString(), // Spread over time
      favorite: random > 0.8,
      qualityScore: 75 + Math.floor(random * 25),
    });
  }

  return history;
}

/**
 * Create mock export response
 */
export function createMockExportResponse(
  generationId: string,
  format: 'mp3' | 'wav' | 'flac'
) {
  return {
    id: generationId,
    format,
    downloadUrl: `https://d.mock-cdn.local/${generationId}.${format}`,
    expiresIn: 86400, // 24 hours
  };
}

/**
 * Create mock usage statistics
 */
export function createMockUsageStats() {
  return {
    generationsThisMonth: 42,
    generationsThisDay: 5,
    maxGenerationsPerDay: 10,
    totalGenerationsAllTime: 127,
    averageQualityScore: 82,
    storageUsedMb: 245,
    storageQuotaMb: 1000,
  };
}

// ============================================================================
// MOCK CLIENT CLASS
// ============================================================================

/**
 * Mock Suno client for testing without API access
 */
export class MockSunoClient {
  private generations: Map<string, MockGenerationData> = new Map();
  private generationStartTimes: Map<string, number> = new Map();

  /**
   * Generate mock music
   */
  async generate(request: SunoGenerationRequest) {
    const generationId = `gen_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockData = createMockGeneration(generationId, request);

    this.generations.set(generationId, mockData);
    this.generationStartTimes.set(generationId, Date.now());

    return createMockGenerationResponse(generationId, request);
  }

  /**
   * Get mock generation status
   */
  async getStatus(id: string) {
    const mockData = this.generations.get(id);
    if (!mockData) {
      throw new Error(`Mock generation ${id} not found`);
    }

    const startTime = this.generationStartTimes.get(id) || Date.now();
    const elapsedMs = Date.now() - startTime;

    return createMockStatusResponse(id, elapsedMs, mockData);
  }

  /**
   * Get mock history
   */
  async getHistory(options?: any) {
    return {
      items: createMockGenerationHistory('user123', 20),
      total: 20,
      page: 1,
      pageSize: 20,
      hasMore: false,
    };
  }

  /**
   * Mock export
   */
  async export(id: string, format: 'mp3' | 'wav' | 'flac', options?: any) {
    return createMockExportResponse(id, format);
  }

  /**
   * Mock cancel
   */
  async cancel(id: string) {
    const mockData = this.generations.get(id);
    if (!mockData) {
      throw new Error(`Mock generation ${id} not found`);
    }
    this.generations.delete(id);
    this.generationStartTimes.delete(id);
    return { cancelled: true };
  }

  /**
   * Mock delete
   */
  async delete(id: string) {
    this.generations.delete(id);
    this.generationStartTimes.delete(id);
    return { deleted: true };
  }

  /**
   * Mock usage
   */
  async getUsage() {
    return createMockUsageStats();
  }

  /**
   * Mock styles
   */
  async getStyles() {
    return {
      styles: SAMPLE_STYLES,
      genres: [
        'Pop', 'Electronic', 'Hip-Hop', 'Classical', 'Jazz', 'Ambient', 'Folk',
        'Rock', 'R&B', 'Country', 'Indie', 'Alternative',
      ],
    };
  }
}

/**
 * Create and export a mock Suno client
 */
export function createMockClient(): MockSunoClient {
  return new MockSunoClient();
}
