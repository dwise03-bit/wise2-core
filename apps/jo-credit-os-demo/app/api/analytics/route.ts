import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    // Log events (in production, save to database)
    console.log('[Analytics API] Received', events.length, 'events');
    events.forEach((event: any) => {
      console.log(`  - ${event.type} at ${new Date(event.timestamp).toISOString()}`);
    });

    // Wise Imp events are the one slice of this endpoint's traffic that's
    // actually persisted — everything else above is still log-only (a
    // pre-existing gap, out of scope here). Forwarded server-side to
    // packages/api, which already has a real DB connection; see
    // packages/api/src/v1/wise-imp-events.
    const wiseImpEvents = events.filter((e: any) => typeof e?.type === 'string' && e.type.startsWith('wise_imp_'));
    if (wiseImpEvents.length > 0) {
      fetch(`${API_BASE_URL}/v1/wise-imp-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: wiseImpEvents.map((e: any) => ({
            type: e.type,
            path: e.path,
            sessionId: e.data?.sessionId ?? 'unknown',
            data: e.data,
          })),
        }),
      }).catch((err) => console.error('[Analytics API] Failed to persist Wise Imp events:', err));
    }

    return NextResponse.json({ success: true, count: events.length });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}
