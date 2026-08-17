import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch projects from database based on authenticated user
    const projects = [
      {
        id: '1',
        title: 'Brand Jingle - WISE² Enterprise',
        type: 'jingle',
        duration: 15,
        genre: 'Electronic',
        mood: 'Professional',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 1),
        status: 'ready',
      },
      {
        id: '2',
        title: 'Podcast Intro - Tech Talk Daily',
        type: 'podcast',
        duration: 30,
        genre: 'Electronic',
        mood: 'Energetic',
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(Date.now() - 86400000 * 3),
        status: 'ready',
      },
    ];

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, genre, mood, duration, useVocals } = body;

    // Validate required fields
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Create project in database
    const newProject = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      type,
      genre,
      mood,
      duration,
      useVocals,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ id: newProject.id, project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
