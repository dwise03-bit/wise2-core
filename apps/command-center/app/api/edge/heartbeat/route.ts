import { NextRequest, NextResponse } from 'next/server';
import { publishEvent } from '../../../../src/events/eventBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HeartbeatPayload {
  deviceId: string;
  status: 'online' | 'offline' | 'degraded';
  cpu?: number;
  memMb?: number;
  tempC?: number;
  uptime?: number;
  alerts?: string[];
}

const deviceState: Record<string, { status: string; lastSeen: number }> = {};

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-edge-key');
  const EDGE_KEY = process.env.EDGE_SECRET || process.env.EVENTS_SECRET || '';

  if (EDGE_KEY && key !== EDGE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: HeartbeatPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { deviceId, status, cpu, memMb, tempC, alerts = [] } = body;
  if (!deviceId || !status) {
    return NextResponse.json({ error: 'deviceId and status required' }, { status: 400 });
  }

  const prev = deviceState[deviceId];
  const stateChanged = !prev || prev.status !== status;
  deviceState[deviceId] = { status, lastSeen: Date.now() };

  // Only publish events on state changes or alerts — not every heartbeat
  if (stateChanged) {
    const type = status === 'online' ? 'edge.online'
      : status === 'offline' ? 'edge.offline'
      : 'edge.alert';

    publishEvent({
      type,
      severity: status === 'online' ? 'success' : status === 'offline' ? 'error' : 'warning',
      source: 'edge',
      title: `${deviceId.toUpperCase()} ${status.toUpperCase()}`,
      message: `Edge device state changed to ${status}${cpu !== undefined ? ` — CPU: ${cpu}%` : ''}${tempC !== undefined ? `, Temp: ${tempC}°C` : ''}`,
      deviceId,
      meta: { cpu: cpu ?? 0, memMb: memMb ?? 0, tempC: tempC ?? 0, uptime: body.uptime ?? 0 },
    });
  }

  // Alerts always publish
  for (const alert of alerts) {
    publishEvent({
      type: 'edge.alert',
      severity: 'warning',
      source: 'edge',
      title: `${deviceId.toUpperCase()} Alert`,
      message: alert,
      deviceId,
    });
  }

  return NextResponse.json({ ok: true, stateChanged });
}

// GET — list known devices (internal use)
export async function GET() {
  const now = Date.now();
  const devices = Object.entries(deviceState).map(([id, s]) => ({
    deviceId: id,
    status: s.status,
    lastSeenMs: now - s.lastSeen,
    online: now - s.lastSeen < 120000, // 2 min window
  }));
  return NextResponse.json({ devices });
}
