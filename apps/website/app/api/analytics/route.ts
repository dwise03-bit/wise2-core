import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    // Log events (in production, save to database)
    console.log('[Analytics API] Received', events.length, 'events');
    events.forEach((event: any) => {
      console.log(`  - ${event.type} at ${new Date(event.timestamp).toISOString()}`);
    });

    return NextResponse.json({ success: true, count: events.length });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}
