/**
 * WISE² Companion Mode API Routes
 * 
 * REST endpoints for session management and state queries
 */

import { NextRequest, NextResponse } from 'next/server';

// Session management endpoints
export async function POST(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // POST /api/companion/sessions/start
  if (pathname.endsWith('/sessions/start') && method === 'POST') {
    const { workOrderId, technicianId, accountId } = await req.json();

    const sessionId = `session_${Date.now()}`;
    const session = {
      id: sessionId,
      workOrderId,
      technicianId,
      accountId,
      startedAt: Date.now(),
      status: 'active'
    };

    return NextResponse.json(session, { status: 201 });
  }

  // POST /api/companion/sessions/{sessionId}/end
  if (pathname.includes('/sessions/') && pathname.endsWith('/end')) {
    const { notes, signature } = await req.json();
    return NextResponse.json({
      status: 'completed',
      completedAt: Date.now(),
      notes,
      signature
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // GET /api/companion/sessions/{sessionId}/measurements
  if (pathname.includes('/sessions/') && pathname.includes('/measurements')) {
    const limit = req.nextUrl.searchParams.get('limit') || '100';
    const offset = req.nextUrl.searchParams.get('offset') || '0';

    return NextResponse.json({
      measurements: [],
      pageInfo: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: 0
      }
    });
  }

  // GET /api/companion/sessions/{sessionId}/voice-notes
  if (pathname.includes('/sessions/') && pathname.includes('/voice-notes')) {
    return NextResponse.json({
      voiceNotes: []
    });
  }

  // GET /api/companion/ws/token - Get WebSocket auth token
  if (pathname.endsWith('/ws/token')) {
    const expiresIn = req.nextUrl.searchParams.get('expiresIn') || '3600';
    const token = Buffer.from(`dummy_token_${Date.now()}`).toString('base64');

    return NextResponse.json({
      token,
      wssUrl: 'wss://api.wise2.net/companion',
      expiresIn: parseInt(expiresIn)
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
