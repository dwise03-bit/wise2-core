import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET /api/v1/sound-labs/me/projects/[projectId]
 * Proxies to the real Prisma-backed backend (packages/api).
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
      `${API_BASE_URL}/v1/sound-labs/me/projects/${params.projectId}`,
      { headers: { Authorization: authHeader } }
    );
    const raw = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(raw, { status: upstream.status });
    }

    const project = { ...raw, recordingCount: raw.recordings?.length || 0 };
    return NextResponse.json({ project, success: true });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/sound-labs/me/projects/[projectId]
 * Proxies to the real Prisma-backed backend (packages/api).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const upstream = await fetch(
      `${API_BASE_URL}/v1/sound-labs/me/projects/${params.projectId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const project = { ...data.project, recordingCount: data.project?.recordings?.length || 0 };
    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/sound-labs/me/projects/[projectId]
 * Proxies to the real Prisma-backed backend (packages/api).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const upstream = await fetch(
      `${API_BASE_URL}/v1/sound-labs/me/projects/${params.projectId}`,
      { method: 'DELETE', headers: { Authorization: authHeader } }
    );
    const data = await upstream.json();

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
