import { NextRequest, NextResponse } from 'next/server';

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

    // Create generation job ID
    const jobId = `${engine}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update project with generation info
    const updated = {
      ...project,
      generationEngine: engine,
      generationJobId: jobId,
      generationStatus: 'queued',
      generationMetadata: {
        lyrics,
        title,
        options,
        createdAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    projects.set(projectId, updated);

    // TODO: Route to actual generation engine
    // This will be implemented based on selected engine:
    // - MusicGen: Call Hugging Face API or local endpoint
    // - Ollama: Call local Ollama server
    // - Custom: Call your trained model

    return NextResponse.json({
      success: true,
      jobId,
      status: 'queued',
      engine,
      estimatedTime: engine === 'musicgen' ? '30-90 seconds' : '60-180 seconds',
      message: `Music generation queued with ${engine} engine`,
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
    let status = project.generationStatus || 'draft';
    let audioUrl = project.generatedAudioUrl;

    // TODO: Poll actual generation engine for real status
    // This will query:
    // - MusicGen API job status
    // - Ollama queue
    // - Custom model job tracker

    // For demo: simulate status progression
    if (status === 'queued') {
      status = 'processing';
    } else if (status === 'processing') {
      status = 'completed';
      audioUrl = `https://storage.googleapis.com/wise2-audio/${engine}/${projectId}_${Date.now()}.mp3`;
    }

    const updated = {
      ...project,
      generationStatus: status,
      generatedAudioUrl: audioUrl,
      generatedAt: status === 'completed' ? new Date().toISOString() : project.generatedAt,
      updatedAt: new Date().toISOString(),
    };

    projects.set(projectId, updated);

    return NextResponse.json({
      success: true,
      jobId: project.generationJobId,
      status,
      engine,
      audioUrl,
      generatedAt: updated.generatedAt,
    });
  } catch (error) {
    console.error('Sound Labs status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
