import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const unavailable = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );

export async function POST(request: NextRequest) {
  let credentials: { email?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return unavailable('A valid JSON request is required.', 400);
  }

  const email = typeof credentials.email === 'string' ? credentials.email.trim() : '';
  const password = typeof credentials.password === 'string' ? credentials.password : '';
  if (!email || !password || email.length > 254 || password.length > 256) {
    return unavailable('Email and password are required.', 400);
  }

  const apiUrl = process.env.WISE2_API_URL;
  if (!apiUrl) return unavailable('WISE² authentication is not configured.', 503);

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;

    if (!response.ok) {
      const upstreamMessage = payload?.message;
      const error = typeof upstreamMessage === 'string' && response.status < 500
        ? upstreamMessage
        : 'Authentication failed.';
      return unavailable(error, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    if (typeof payload?.accessToken !== 'string' || !payload.user || typeof payload.user !== 'object') {
      return unavailable('WISE² returned an invalid authentication response.', 502);
    }

    return NextResponse.json(
      {
        token: payload.accessToken,
        user: payload.user,
        expiresIn: payload.expiresIn,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return unavailable('WISE² authentication is temporarily unavailable.', 503);
  }
}
