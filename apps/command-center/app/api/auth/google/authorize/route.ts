import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * Never prerender: this reads credentials from the runtime environment and
 * mints a per-request CSRF state. A cached authorize response would hand every
 * visitor the same state, or freeze a build-time "not configured" error.
 */
export const dynamic = 'force-dynamic';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const REDIRECT_URI =
  process.env.GOOGLE_CALLBACK_URL ||
  'https://command.wise2.net/api/auth/google/callback';
const LOGIN_URL = '/login';

/**
 * Starts Google sign-in for the Command Center.
 *
 * The redirect_uri must match GOOGLE_CALLBACK_URL on the API exactly, because
 * the API performs the token exchange and Google requires the value used at
 * authorize time to match the one used at exchange time.
 */
export async function GET(request: Request) {
  if (!CLIENT_ID) {
    return NextResponse.redirect(
      new URL(`${LOGIN_URL}?error=google_not_configured`, request.url),
    );
  }

  const state = randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );

  response.cookies.set('cc_google_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
