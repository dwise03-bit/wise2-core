import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SoundLabsProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recordingCount: number;
  recordings: Array<{ id: string; name: string; duration: number }>;
  projectSize: number;
}

// Mock projects for demonstration
const mockProjects: SoundLabsProject[] = [
  {
    id: 'proj_001',
    userId: 'user_dev',
    name: 'Managers for Managers',
    description: 'Morgan Wallen & Young MA inspired track - 389 words, 95 BPM',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    recordingCount: 3,
    recordings: [
      { id: 'rec_001', name: 'Main Vocals', duration: 270 },
      { id: 'rec_002', name: 'Beat Layer 1', duration: 270 },
      { id: 'rec_003', name: 'Production Mix', duration: 270 },
    ],
    projectSize: 45 * 1024 * 1024, // 45 MB
  },
  {
    id: 'proj_002',
    userId: 'user_dev',
    name: 'Brand Jingle - WISE²',
    description: 'Professional sonic logo for WISE² brand',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recordingCount: 2,
    recordings: [
      { id: 'rec_004', name: 'Jingle Version 1', duration: 15 },
      { id: 'rec_005', name: 'Jingle Version 2 (Extended)', duration: 30 },
    ],
    projectSize: 12 * 1024 * 1024, // 12 MB
  },
  {
    id: 'proj_003',
    userId: 'user_dev',
    name: 'Interview Podcast - Episode 1',
    description: 'Recorded interview with embedded background music',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    recordingCount: 1,
    recordings: [
      { id: 'rec_006', name: 'Full Episode', duration: 3600 },
    ],
    projectSize: 250 * 1024 * 1024, // 250 MB
  },
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      );
    }

    // Extract and validate token (format: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Return mock projects for any valid token
    // In production, this would query a database filtered by userId
    return NextResponse.json({
      projects: mockProjects,
      count: mockProjects.length,
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

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create a mock new project
    const newProject: SoundLabsProject = {
      id: `proj_${Date.now()}`,
      userId: 'user_dev',
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recordingCount: 0,
      recordings: [],
      projectSize: 0,
    };

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
