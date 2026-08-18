import { NextRequest, NextResponse } from 'next/server';

// OAuth routes must never be prerendered. These read credentials from the
// runtime environment and mint a per-request CSRF state; if Next.js decides
// a branch is static it freezes that response at build time. That is exactly
// what happened to Discord: DISCORD_CLIENT_ID was empty during the image
// build, so the "not configured" redirect was baked in and served forever,
// even though the running container has the credential.
export const dynamic = 'force-dynamic';


const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI || 'https://wise2.net/auth/discord/callback';
const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net';

export async function GET(request: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.redirect(
      new URL('/auth/login?error=discord_not_configured', PUBLIC_SITE_URL),
    );
  }

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'identify email guilds',
    prompt: 'consent',
    state,
  });

  const response = NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
  );

  response.cookies.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
