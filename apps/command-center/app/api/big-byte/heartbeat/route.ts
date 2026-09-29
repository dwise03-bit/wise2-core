import { NextRequest, NextResponse } from 'next/server';
import { publishEvent } from '../../../../src/events/eventBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HeartbeatPayload {
  deviceId: string;
  status: 'online' | 'offline' | 'degraded';
  nodeId?: string;
  nodeName?: string;
  tenantId?: string | null;
  cpu?: number;
  memMb?: number;
  tempC?: number;
  uptime?: number;
  alerts?: string[];
  telemetry?: Record<string, unknown>;
  connectivity?: Record<string, unknown>;
  sync?: Record<string, unknown>;
  providerStatus?: Record<string, unknown>;
}

const deviceState: Record<
  string,
  {
    status: string;
    lastSeen: number;
    telemetry?: Record<string, unknown>;
    tenantId?: string | null;
    sync?: Record<string, unknown>;
    connectivity?: Record<string, unknown>;
    providerStatus?: Record<string, unknown>;
  }
> = {};

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-big-byte-key');
  const BIG_BYTE_KEY =
    process.env.WISE2_BIG_BYTE_KEY ||
    process.env.BIG_BYTE_SECRET ||
    process.env.EVENTS_SECRET ||
    '';

  if (BIG_BYTE_KEY && key !== BIG_BYTE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: HeartbeatPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    deviceId,
    status,
    cpu,
    memMb,
    tempC,
    alerts = [],
    tenantId = null,
    telemetry = {},
    connectivity = {},
    sync = {},
    providerStatus = {},
  } = body;
  if (!deviceId || !status) {
    return NextResponse.json({ error: 'deviceId and status required' }, { status: 400 });
  }

  const prev = deviceState[deviceId];
  const stateChanged = !prev || prev.status !== status;
  deviceState[deviceId] = {
    status,
    lastSeen: Date.now(),
    telemetry,
    tenantId,
    sync,
    connectivity,
    providerStatus,
  };

  // Only publish events on state changes or alerts — not every heartbeat
  if (stateChanged) {
    const type = status === 'online' ? 'big-byte.online'
      : status === 'offline' ? 'big-byte.offline'
      : 'big-byte.alert';

    publishEvent({
      type,
      severity: status === 'online' ? 'success' : status === 'offline' ? 'error' : 'warning',
      source: 'big-byte',
      title: `${deviceId.toUpperCase()} ${status.toUpperCase()}`,
      message: `Big Byte state changed to ${status}${cpu !== undefined ? ` — CPU: ${cpu}%` : ''}${tempC !== undefined ? `, Temp: ${tempC}°C` : ''}`,
      deviceId,
      meta: {
        cpu: cpu ?? 0,
        memMb: memMb ?? 0,
        tempC: tempC ?? 0,
        uptime: body.uptime ?? 0,
        tenantId: tenantId || 'unassigned',
        sync: JSON.stringify(sync),
        connectivity: JSON.stringify(connectivity),
        providerStatus: JSON.stringify(providerStatus),
      },
    });
  }

  // Alerts always publish
  for (const alert of alerts) {
    publishEvent({
      type: 'big-byte.alert',
      severity: 'warning',
      source: 'big-byte',
      title: `${deviceId.toUpperCase()} Alert`,
      message: alert,
      deviceId,
    });
  }

  return NextResponse.json({
    ok: true,
    stateChanged,
    deviceId,
    status,
    lastSeen: deviceState[deviceId].lastSeen,
  });
}

// GET — list known devices (internal use)
export async function GET() {
  const now = Date.now();
  const devices = Object.entries(deviceState).map(([id, s]) => ({
    deviceId: id,
    status: s.status,
    tenantId: s.tenantId ?? null,
    lastSeenMs: now - s.lastSeen,
    online: now - s.lastSeen < 120000, // 2 min window
    sync: s.sync || {},
    connectivity: s.connectivity || {},
    providerStatus: s.providerStatus || {},
  }));
  return NextResponse.json({ devices });
}
