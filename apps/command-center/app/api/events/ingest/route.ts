import { NextRequest, NextResponse } from 'next/server';
import { publishEvent, EventType, EventSeverity } from '../../../../src/events/eventBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EVENTS_SECRET = process.env.EVENTS_SECRET;

export async function POST(req: NextRequest) {
  // Internal-only endpoint — protected by shared secret
  const key = req.headers.get('x-events-key');
  if (EVENTS_SECRET && key !== EVENTS_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    type: EventType;
    severity?: EventSeverity;
    source: string;
    title: string;
    message: string;
    deviceId?: string;
    businessId?: string;
    meta?: Record<string, string | number | boolean>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.type || !body.source || !body.title || !body.message) {
    return NextResponse.json({ error: 'Missing required fields: type, source, title, message' }, { status: 400 });
  }

  const event = publishEvent({
    type: body.type,
    severity: body.severity ?? 'info',
    source: body.source,
    title: body.title,
    message: body.message,
    deviceId: body.deviceId,
    businessId: body.businessId,
    meta: body.meta,
  });

  return NextResponse.json({ ok: true, id: event.id });
}
