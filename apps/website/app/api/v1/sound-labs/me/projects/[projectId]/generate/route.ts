import { NextRequest, NextResponse } from 'next/server';
import { generateMusic, getMusicGenResult, MusicGenServiceError } from '@/lib/musicgen-client';

export const dynamic = 'force-dynamic';

// In-memory storage reference for demo
const projects = new Map<string, any>();

interface GenerationRequest {
  lyrics: string;
  title: string;
  engine?: string; // musicgen, ollama, custom, etc.
  options?: Record<string, any>; // Engine-specific options
}

interface GenerationResponse {
  success: boolean;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  engine: string;
  estimatedTime?: string;
  audioUrl?: string;
  message?: string;
}

function extractUserId(token: string): string | null {
  if (token.startsWith('dev_token_')) {
    return 'dev_' + token.split('_')[2];
  }
  return null;
}

/**
 * POST /api/v1/sound-labs/me/projects/{projectId}/generate
 * Start a new music generation job
 *
 * Currently only the "musicgen" engine is wired to a real backend
 * (apps/musicgen-service). Other engine values are rejected rather than
 * silently faked.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<NextResponse<GenerationResponse>> {
  try {
    const authHeader = request.headers.get('Authorization');
    const { projectId } = params;
    const body: GenerationRequest = await request.json();

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as any,
        { status: 401 }
      );
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const userId = extractUserId(token);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' } as any,
        { status: 401 }
      );
    }

    const project = projects.get(projectId);
    if (!project || project.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Project not found' } as any,
        { status: 404 }
      );
    }

    const {
      lyrics,
      title,
      engine = process.env.MUSIC_GEN_ENGINE || 'musicgen',
      options = {},
    } = body;

    if (!lyrics) {
      return NextResponse.json(
        { success: false, message: 'Lyrics required' } as any,
        { status: 400 }
      );
    }

    if (engine !== 'musicgen') {
      return NextResponse.json(
        {
          success: false,
          message: `Engine "${engine}" is not wired to a real generation backend yet. Only "musicgen" is currently supported.`,
        } as any,
        { status: 400 }
      );
    }

    const jobId = `${engine}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mark as processing before the (synchronous, potentially slow) call so
    // a concurrent GET during generation reflects real state, not a guess.
    projects.set(projectId, {
      ...project,
      generationEngine: engine,
      generationJobId: jobId,
      generationStatus: 'processing',
      generationMetadata: { lyrics, title, options, createdAt: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
    });

    // MusicGen generates instrumental audio from a text prompt — it does not
    // sing lyrics. We fold the title + lyrics into a descriptive prompt
    // until the product supports a real vocal/lyrics pipeline.
    const prompt = [title, lyrics].filter(Boolean).join(' — ').slice(0, 500);

    let result;
    try {
      result = await generateMusic({
        prompt,
        duration: options.duration,
        genre: options.genre,
        mood: options.mood,
        tempo: options.tempo,
        temperature: options.temperature,
        seed: options.seed,
      });
    } catch (err) {
      const message =
        err instanceof MusicGenServiceError
          ? err.message
          : 'Music generation failed unexpectedly';
      projects.set(projectId, {
        ...projects.get(projectId),
        generationStatus: 'failed',
        generationError: message,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json(
        { success: false, jobId, status: 'failed', engine, message } as GenerationResponse,
        { status: 502 }
      );
    }

    const audioUrl = `/api/v1/sound-labs/audio/${result.generationId}`;
    const current = projects.get(projectId);
    projects.set(projectId, {
      ...current,
      generationStatus: 'completed',
      generatedAudioUrl: audioUrl,
      generationResult: result,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      jobId,
      status: 'completed',
      engine,
      audioUrl,
      message: `Music generated with ${engine} engine`,
    });
  } catch (error) {
    console.error('Sound Labs generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start generation' } as any,
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/sound-labs/me/projects/{projectId}/generate
 * Poll generation job status
 *
 * Since apps/musicgen-service generates synchronously inside POST above,
 * this reflects the real stored status rather than simulating progress.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<NextResponse<any>> {
  try {
    const authHeader = request.headers.get('Authorization');
    const { projectId } = params;

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const userId = extractUserId(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const project = projects.get(projectId);
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const engine = project.generationEngine || 'musicgen';
    const status = project.generationStatus || 'draft';
    let audioUrl = project.generatedAudioUrl;

    // If we believe it's completed, confirm the result still exists on the
    // MusicGen service (its cache can expire) rather than trusting stale state.
    if (status === 'completed' && project.generationResult?.generationId) {
      const stillCached = await getMusicGenResult(project.generationResult.generationId).catch(
        () => null
      );
      if (!stillCached) {
        audioUrl = undefined;
      }
    }

    return NextResponse.json({
      success: true,
      jobId: project.generationJobId,
      status,
      engine,
      audioUrl,
      error: project.generationError,
      generatedAt: project.generatedAt,
    });
  } catch (error) {
    console.error('Sound Labs status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
