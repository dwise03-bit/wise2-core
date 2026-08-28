import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type EdgePayload = {
  core?: string;
  demoMode?: boolean;
  system?: {
    cpu?: number;
    ram?: number;
    temperature?: number | null;
    disk?: number;
    network?: string;
    uptimeSeconds?: number;
  };
  sdr?: { state?: string; detected?: boolean; toolsInstalled?: boolean; receiveOnly?: boolean };
  mesh?: { state?: string; visibleNodes?: number; lastPacket?: string | null };
  incidents?: { state?: string; count?: number };
  wise2?: { state?: string };
  tailscale?: { state?: string };
  timestamp?: string;
};

const unavailable = (detail: string, status = 503) =>
  NextResponse.json(
    { gateway: 'BIG BYTE', state: 'OFFLINE', detail, checkedAt: new Date().toISOString() },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );

export async function GET() {
  const edgeUrl = process.env.WISE_DEFENSE_EDGE_URL;
  if (!edgeUrl) return unavailable('Edge gateway URL is not configured.');

  try {
    const response = await fetch(`${edgeUrl.replace(/\/$/, '')}/api/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return unavailable(`Edge gateway returned HTTP ${response.status}.`);

    const payload = (await response.json()) as EdgePayload;
    return NextResponse.json(
      {
        gateway: 'BIG BYTE',
        state: payload.core === 'ONLINE' ? 'ACTIVE' : 'DEGRADED',
        demoMode: payload.demoMode === true,
        system: {
          cpu: payload.system?.cpu,
          ram: payload.system?.ram,
          temperature: payload.system?.temperature,
          disk: payload.system?.disk,
          network: payload.system?.network,
          uptimeSeconds: payload.system?.uptimeSeconds,
        },
        sdr: payload.sdr ?? { state: 'UNKNOWN' },
        mesh: payload.mesh ?? { state: 'UNKNOWN' },
        incidents: payload.incidents ?? { state: 'UNKNOWN', count: 0 },
        cloud: payload.wise2 ?? { state: 'UNKNOWN' },
        privateNetwork: payload.tailscale?.state === 'INSTALLED' ? 'CONNECTED' : 'UNKNOWN',
        sourceTimestamp: payload.timestamp ?? null,
        checkedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return unavailable('Edge gateway did not respond before the health-check timeout.');
  }
}
