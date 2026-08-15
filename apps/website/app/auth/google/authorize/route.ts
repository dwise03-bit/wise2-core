import { NextRequest, NextResponse } from 'next/server';

// OAuth routes must never be prerendered. These read credentials from the
// runtime environment and mint a per-request CSRF state; if Next.js decides
// a branch is static it freezes that response at build time. That is exactly
// what happened to Discord: DISCORD_CLIENT_ID was empty during the image
// build, so the "not configured" redirect was baked in and served forever,
// even though the running container has the credential.
export const dynamic = 'force-dynamic';


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  process.env.NEXT_PUBLIC_SITE_URL
    ? `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '')}/api/auth/google/callback`
    : 'https://wise2.net/api/auth/google/callback';

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();

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

  return response;
}
