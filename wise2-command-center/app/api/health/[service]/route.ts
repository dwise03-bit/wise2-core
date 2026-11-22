import { NextRequest, NextResponse } from 'next/server';

const SERVICES = new Set(['pocket','server','hermes','commander','trading','storage']);
export const dynamic = 'force-dynamic';
export async function GET(_request: NextRequest, context: { params: Promise<{ service: string }> }) {
  const { service } = await context.params;
  if (!SERVICES.has(service)) return NextResponse.json({ error: 'unknown service' }, { status: 404 });
  // Fail closed: no untrusted upstream health probes, no credentials exposed to browsers.
  // Connect an authenticated server-side collector before reporting a verified state.
  return NextResponse.json({ service, status: 'unknown', verified: false }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
