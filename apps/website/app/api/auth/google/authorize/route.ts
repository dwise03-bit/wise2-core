import { NextRequest, NextResponse } from 'next/server';

// Must never be prerendered: this reads credentials from the runtime
// environment and mints a per-request CSRF state. When Next.js decides the
// branch is static it freezes the build-time response — which is exactly how
// Discord ended up permanently serving "not configured" in production.
export const dynamic = 'force-dynamic';


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '');
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${PUBLIC_SITE_URL}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();
  const requestHost = request.headers.get('host')?.split(':')[0].toLowerCase();
  const returnTo = requestHost === 'sjs.wise2.net' ? 'https://sjs.wise2.net' : PUBLIC_SITE_URL;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
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

  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  response.cookies.set('google_oauth_return_to', returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
    domain: '.wise2.net',
  });

  return response;
}
