/**
 * Server-side client for the WISE² MusicGen inference service
 * (apps/musicgen-service/musicgen_server.py).
 *
 * Mirrors apps/studio/lib/musicgen-client.ts. Duplicated rather than shared
 * because packages/api (NestJS) and apps/studio (Next.js) don't share a
 * runtime module boundary; keep both in sync if the upstream API changes.
 */

const MUSICGEN_API_URL = process.env.MUSICGEN_API_URL || 'http://localhost:5000';

export class MusicGenServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 502,
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
  downloadPath: string;
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
      503,
    );
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new MusicGenServiceError(
      `MusicGen service returned ${response.status}: ${body.slice(0, 300)}`,
      response.status,
    );
  }
  return response;
}

export async function generateMusic(
  params: MusicGenGenerateParams,
): Promise<MusicGenGenerateResult> {
  const res = await musicGenFetch('/api/v1/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as {
    generation_id: string;
    prompt: string;
    duration: number;
    sample_rate: number;
    genre?: string;
    mood?: string;
    timestamp: string;
    download_url: string;
  };
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

export async function fetchMusicGenAudio(
  generationId: string,
): Promise<Response | null> {
  const res = await fetch(
    `${MUSICGEN_API_URL}/api/v1/download/${encodeURIComponent(generationId)}`,
    { signal: AbortSignal.timeout(30_000) },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new MusicGenServiceError(
      `MusicGen service returned ${res.status} for download`,
      res.status,
    );
  }
  return res;
}
