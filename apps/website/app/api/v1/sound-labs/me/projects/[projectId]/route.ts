import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for demo
const projects = new Map<string, any>();

function extractUserId(token: string): string | null {
  if (token.startsWith('dev_token_')) {
    return 'dev_' + token.split('_')[2];
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    return NextResponse.json({ project, success: true });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const { projectId } = params;
    const body = await request.json();

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

    const { name, description, mixerState, lyrics, lyricsTitle, sunoJobId, sunoStatus, generatedAudioUrl } = body;
    const updated = {
      ...project,
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(mixerState && { mixerState }),
      ...(lyrics !== undefined && { lyrics }),
      ...(lyricsTitle !== undefined && { lyricsTitle }),
      ...(sunoJobId !== undefined && { sunoJobId }),
      ...(sunoStatus !== undefined && { sunoStatus }),
      ...(generatedAudioUrl !== undefined && { generatedAudioUrl }),
      updatedAt: new Date().toISOString(),
    };

    projects.set(projectId, updated);

    return NextResponse.json({ project: updated, success: true });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    projects.delete(projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
