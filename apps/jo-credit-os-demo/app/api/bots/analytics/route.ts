import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

// In-memory analytics storage (replace with DB in production)
const events: AnalyticsEvent[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AnalyticsEvent;
    const { event, userId, properties } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 });
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      properties,
      timestamp: new Date().toISOString(),
    };

    events.push(analyticsEvent);

    // Send to Discord webhook if configured
    if (process.env.DISCORD_ANALYTICS_WEBHOOK) {
      await fetch(process.env.DISCORD_ANALYTICS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `📊 Analytics Event: ${event}`,
            description: `User: ${userId || 'anonymous'}`,
            color: 0x0055ff,
            fields: Object.entries(properties || {}).map(([key, value]) => ({
              name: key,
              value: String(value),
              inline: true,
            })),
            timestamp: analyticsEvent.timestamp,
          }],
          username: 'Analytics Bot',
        }),
      }).catch(err => console.error('Discord webhook error:', err));
    }

    return NextResponse.json({
      success: true,
      event: analyticsEvent,
      totalEvents: events.length,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Analytics tracking failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    let filtered = events;
    if (userId) {
      filtered = events.filter(e => e.userId === userId);
    }

    const recent = filtered.slice(-limit);

    // Calculate stats
    const eventCounts: Record<string, number> = {};
    filtered.forEach(e => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      events: recent,
      stats: {
        totalEvents: filtered.length,
        eventCounts,
        period: '24h',
      },
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
