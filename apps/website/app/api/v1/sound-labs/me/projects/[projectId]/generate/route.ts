import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface GenerationRequest {
  lyrics: string;
  title?: string;
  options?: Record<string, any>;
}

/**
 * POST /api/v1/sound-labs/me/projects/{projectId}/generate
 * Proxies to the real Prisma-backed generation endpoint (packages/api),
 * folding the page's lyrics/title fields into the prompt MusicGen expects
 * (it generates instrumental audio from a text prompt, not sung lyrics).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerationRequest = await request.json();
    if (!body.lyrics) {
      return NextResponse.json({ success: false, message: 'Lyrics required' }, { status: 400 });
    }

    const prompt = [body.title, body.lyrics].filter(Boolean).join(' — ').slice(0, 500);
    const options = body.options || {};

    const upstream = await fetch(
      `${API_BASE_URL}/v1/sound-labs/me/projects/${params.projectId}/generate`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          duration: options.duration,
          genre: options.genre,
          mood: options.mood,
          tempo: options.tempo,
          temperature: options.temperature,
          seed: options.seed,
        }),
      }
    );
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to start generation' },
        { status: upstream.status }
      );
    }

    const project = data.project;
    return NextResponse.json({
      success: true,
      jobId: project.generationJobId,
      status: project.generationStatus,
      engine: project.generationEngine,
      audioUrl: project.generatedAudioUrl,
    });
  } catch (error) {
    console.error('Sound Labs generation error:', error);
    return NextResponse.json({ success: false, message: 'Failed to start generation' }, { status: 500 });
  }
}

/**
 * GET /api/v1/sound-labs/me/projects/{projectId}/generate
 * Poll generation job status. Proxies to packages/api.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const upstream = await fetch(
      `${API_BASE_URL}/v1/sound-labs/me/projects/${params.projectId}/generate`,
      { headers: { Authorization: authHeader } }
    );
    const data = await upstream.json();

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('Sound Labs status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
