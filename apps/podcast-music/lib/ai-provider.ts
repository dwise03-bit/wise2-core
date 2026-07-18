/**
 * Provider-agnostic AI audio generation layer.
 *
 * The rest of the app depends ONLY on the `AudioProvider` interface, never on a
 * specific vendor. Swap providers via the `AUDIO_PROVIDER` env var without
 * touching business logic. A `mock` provider ships by default so the app runs
 * end-to-end with zero API keys; real providers activate when their keys exist.
 */

export type ProviderJobStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface GenerationParams {
  prompt: string;
  aiModel: string;
  seed?: number;
  /** Target length in seconds (best-effort; providers may clamp). */
  durationSeconds?: number;
}

export interface SubmitResult {
  /** Provider-side job identifier used for later polling. */
  jobId: string;
  status: ProviderJobStatus;
}

export interface JobResult {
  jobId: string;
  status: ProviderJobStatus;
  progress: number; // 0-100
  audioUrl?: string;
  durationSeconds?: number;
  errorMessage?: string;
}

export interface AudioProvider {
  readonly name: string;
  submit(params: GenerationParams): Promise<SubmitResult>;
  getStatus(jobId: string): Promise<JobResult>;
}

/**
 * Mock provider — no external calls. Deterministically "completes" a job based
 * on elapsed time encoded in the jobId, so status polling shows realistic
 * PENDING -> PROCESSING -> COMPLETED progression. Returns a royalty-free sample
 * so the full download/playback flow works in dev and CI.
 */
class MockProvider implements AudioProvider {
  readonly name = 'mock';

  private static readonly SAMPLE_URL =
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  private static readonly COMPLETE_AFTER_MS = 8000;

  async submit(_params: GenerationParams): Promise<SubmitResult> {
    // Encode submit time in the jobId so getStatus is stateless.
    const jobId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return { jobId, status: 'QUEUED' };
  }

  async getStatus(jobId: string): Promise<JobResult> {
    const submittedAt = Number(jobId.split('_')[1]) || 0;
    const elapsed = Date.now() - submittedAt;
    const pct = Math.min(
      100,
      Math.round((elapsed / MockProvider.COMPLETE_AFTER_MS) * 100)
    );

    if (pct >= 100) {
      return {
        jobId,
        status: 'COMPLETED',
        progress: 100,
        audioUrl: MockProvider.SAMPLE_URL,
        durationSeconds: 30,
      };
    }
    return {
      jobId,
      status: pct > 0 ? 'PROCESSING' : 'QUEUED',
      progress: pct,
    };
  }
}

/**
 * Suno provider skeleton. Wire real endpoints when SUNO_API_KEY is set. The
 * request/response mapping is isolated here so vendor changes never leak out.
 */
class SunoProvider implements AudioProvider {
  readonly name = 'suno';
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.SUNO_API_BASE_URL || 'https://api.suno.ai/v1';
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async submit(params: GenerationParams): Promise<SubmitResult> {
    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        prompt: params.prompt,
        model: params.aiModel === 'default' ? undefined : params.aiModel,
        make_instrumental: false,
        seed: params.seed,
        duration: params.durationSeconds,
      }),
    });

    if (!res.ok) {
      throw new Error(`Suno submit failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { id: string };
    return { jobId: data.id, status: 'QUEUED' };
  }

  async getStatus(jobId: string): Promise<JobResult> {
    const res = await fetch(`${this.baseUrl}/generate/${jobId}`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new Error(`Suno status failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      status: string;
      audio_url?: string;
      duration?: number;
      error?: string;
    };

    const statusMap: Record<string, ProviderJobStatus> = {
      submitted: 'QUEUED',
      queued: 'QUEUED',
      streaming: 'PROCESSING',
      processing: 'PROCESSING',
      complete: 'COMPLETED',
      completed: 'COMPLETED',
      error: 'FAILED',
      failed: 'FAILED',
    };
    const status = statusMap[data.status] || 'PROCESSING';

    return {
      jobId,
      status,
      progress: status === 'COMPLETED' ? 100 : status === 'PROCESSING' ? 50 : 10,
      audioUrl: data.audio_url,
      durationSeconds: data.duration,
      errorMessage: data.error,
    };
  }
}

let cached: AudioProvider | null = null;

/**
 * Returns the configured provider. Selection order:
 *   1. AUDIO_PROVIDER env ('mock' | 'suno')
 *   2. auto: 'suno' if SUNO_API_KEY exists, else 'mock'
 */
export function getAudioProvider(): AudioProvider {
  if (cached) return cached;

  const configured = (process.env.AUDIO_PROVIDER || 'auto').toLowerCase();
  const sunoKey = process.env.SUNO_API_KEY;

  if (configured === 'suno' || (configured === 'auto' && sunoKey)) {
    if (!sunoKey) {
      throw new Error('AUDIO_PROVIDER=suno but SUNO_API_KEY is not set');
    }
    cached = new SunoProvider(sunoKey);
  } else {
    cached = new MockProvider();
  }
  return cached;
}
