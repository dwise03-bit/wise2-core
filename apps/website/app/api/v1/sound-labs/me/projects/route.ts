import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for demo (persists per session)
const projects = new Map<string, any>();

function extractUserId(token: string): string | null {
  if (token.startsWith('dev_token_')) {
    return 'dev_' + token.split('_')[2];
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const userId = extractUserId(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get projects for this user
    const userProjects = Array.from(projects.values()).filter((p) => p.userId === userId);
    const recordingCount = userProjects.reduce((sum, p) => sum + (p.recordingCount || 0), 0);
    const totalStorage = userProjects.reduce((sum, p) => sum + (p.projectSize || 0), 0);

    return NextResponse.json({
      projects: userProjects,
      count: userProjects.length,
      stats: {
        projectCount: userProjects.length,
        recordingCount,
        storageUsed: totalStorage,
      },
      success: true,
    });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const userId = extractUserId(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create mock project
    const projectId = `proj_${Date.now()}`;
    const newProject = {
      id: projectId,
      userId,
      name,
      description: description || null,
      lyrics: '',
      lyricsTitle: '',
      sunoJobId: null,
      sunoStatus: 'draft',
      generatedAudioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recordingCount: 0,
      recordings: [],
      projectSize: 0,
    };

    projects.set(projectId, newProject);

    return NextResponse.json({
      project: newProject,
      success: true,
    });
  } catch (error) {
    console.error('Sound Labs API error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
