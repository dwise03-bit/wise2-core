import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.SOUND_LABS_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

/**
 * GET /api/v1/sound-labs/me/projects
 * Proxies to the real Prisma-backed backend (packages/api).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const upstream = await fetch(`${API_BASE_URL}/v1/sound-labs/me/projects`, {
      headers: { Authorization: authHeader },
    });
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const rawProjects = data.projects || [];
    const projects = rawProjects.map((p: any) => ({
      ...p,
      recordingCount: p.recordings?.length || 0,
    }));
    const recordingCount = projects.reduce(
      (sum: number, p: any) => sum + p.recordingCount,
      0
    );
    const storageUsed = projects.reduce((sum: number, p: any) => sum + (p.projectSize || 0), 0);

    return NextResponse.json({
      projects,
      count: projects.length,
      stats: {
        projectCount: projects.length,
        recordingCount,
        storageUsed,
      },
      success: true,
    });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/**
 * POST /api/v1/sound-labs/me/projects
 * Proxies to the real Prisma-backed backend (packages/api).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const body = await request.json();

    const upstream = await fetch(`${API_BASE_URL}/v1/sound-labs/me/projects`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
