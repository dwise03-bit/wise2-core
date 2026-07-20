/**
 * Event Tracking API
 * POST /api/v1/events/track
 *
 * Accepts user event data and stores it for analytics
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_type,
      event_data,
      session_id,
      timestamp,
    } = body;

    // Validate required fields
    if (!event_type || !session_id) {
      return Response.json(
        { error: 'Missing required fields: event_type, session_id' },
        { status: 400 }
      );
    }

    // In production, this would save to Supabase/PostgreSQL
    // For now, we'll just log and acknowledge
    console.log(`[EVENT] ${event_type}`, {
      session_id,
      event_data,
      timestamp,
    });

    // Store in memory cache for now (in production, use database)
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.eventLog) {
        globalThis.eventLog = [];
      }
      globalThis.eventLog.push({
        event_type,
        event_data,
        session_id,
        timestamp: new Date(timestamp),
        created_at: new Date(),
      });
    }

    return Response.json(
      { success: true, event_id: `evt_${Date.now()}` },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in event tracking endpoint:', error);
    return Response.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/events/track
 * Retrieve recent events (for debugging/testing)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const event_type = searchParams.get('type');

    let events = globalThis.eventLog || [];

    // Filter by type if specified
    if (event_type) {
      events = events.filter((e: any) => e.event_type === event_type);
    }

    // Return most recent events
    const recent = events.slice(-limit).reverse();

    return Response.json(
      { count: recent.length, events: recent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving events:', error);
    return Response.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}
