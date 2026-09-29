/**
 * Server-side client for the WISE² MusicGen inference service
 * (apps/musicgen-service/musicgen_server.py). Replaces the previous
 * Suno-based mock generation flow.
 *
 * Base URL is configurable via MUSICGEN_API_URL since the deployed
 * instance's host/port can change (local dev vs. VPS). Defaults to the
 * Flask service's own default port (5000) for local development.
 */

const MUSICGEN_API_URL = process.env.MUSICGEN_API_URL || 'http://localhost:5000';

export class MusicGenServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 502
  ) {
    super(message);
    this.name = 'MusicGenServiceError';
  }
}

export interface MusicGenGenerateParams {
  prompt: string;
  duration?: number;
  genre?: string;
  mood?: string;
  tempo?: number;
  temperature?: number;
  seed?: number;
}

export interface MusicGenGenerateResult {
  generationId: string;
  prompt: string;
  duration: number;
  sampleRate: number;
  genre?: string;
  mood?: string;
  timestamp: string;
  downloadPath: string; // path on the MusicGen service, e.g. /api/v1/download/<id>
}

async function musicGenFetch(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${MUSICGEN_API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      signal: AbortSignal.timeout(180_000),
    });
  } catch (err) {
    throw new MusicGenServiceError(
      `MusicGen service unreachable at ${MUSICGEN_API_URL}: ${(err as Error).message}`,
      503
    );
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new MusicGenServiceError(
      `MusicGen service returned ${response.status}: ${body.slice(0, 300)}`,
      response.status
    );
  }
  return response;
}

export async function checkMusicGenHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${MUSICGEN_API_URL}/health`, { signal: AbortSignal.timeout(5_000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateMusic(
  params: MusicGenGenerateParams
): Promise<MusicGenGenerateResult> {
  const res = await musicGenFetch('/api/v1/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return {
    generationId: data.generation_id,
    prompt: data.prompt,
    duration: data.duration,
    sampleRate: data.sample_rate,
    genre: data.genre,
    mood: data.mood,
    timestamp: data.timestamp,
    downloadPath: data.download_url,
  };
}

export async function getMusicGenResult(generationId: string) {
  const res = await fetch(
    `${MUSICGEN_API_URL}/api/v1/result/${encodeURIComponent(generationId)}`,
    { signal: AbortSignal.timeout(10_000) }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new MusicGenServiceError(`MusicGen service returned ${res.status} for result lookup`, res.status);
  }
  return res.json();
}

export async function fetchMusicGenAudio(generationId: string): Promise<Response | null> {
  const res = await fetch(
    `${MUSICGEN_API_URL}/api/v1/download/${encodeURIComponent(generationId)}`,
    { signal: AbortSignal.timeout(30_000) }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new MusicGenServiceError(`MusicGen service returned ${res.status} for download`, res.status);
  }
  return res;
}
