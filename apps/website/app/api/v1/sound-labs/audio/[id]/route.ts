import { NextRequest, NextResponse } from 'next/server';
import { fetchMusicGenAudio, MusicGenServiceError } from '@/lib/musicgen-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/sound-labs/audio/[id]
 * Proxies generated audio from the MusicGen service so the browser never
 * needs the service's internal host/port directly.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const upstream = await fetchMusicGenAudio(params.id);
    if (!upstream || !upstream.body) {
      return NextResponse.json({ error: 'Audio not found or expired' }, { status: 404 });
    }
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'audio/wav',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    const status = error instanceof MusicGenServiceError ? error.statusCode : 500;
    console.error('Sound Labs audio proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch generated audio' }, { status });
  }
}
