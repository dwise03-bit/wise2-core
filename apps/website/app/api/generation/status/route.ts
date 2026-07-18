import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const generationId = request.nextUrl.searchParams.get('id');

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID required' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database/cache
    const generation: {
      id: string;
      status: string;
      progress: number;
      audioUrl: string | null;
      error: string | null;
    } = {
      id: generationId,
      status: 'processing',
      progress: 65,
      audioUrl: null,
      error: null,
    };

    // Simulated progress for demo
    const randomProgress = Math.floor(Math.random() * 100);
    generation.progress = randomProgress;

    if (randomProgress === 100) {
      generation.status = 'completed';
      generation.audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }

    return NextResponse.json(generation);
  } catch (error) {
    console.error('Error fetching generation status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
