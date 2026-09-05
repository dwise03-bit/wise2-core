import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const TOKEN_URL = 'https://api.getjobber.com/api/oauth/token';
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? 'https://getdown-owner-demo.vercel.app';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const jar = await cookies();
  const savedState = jar.get('jobber_oauth_state')?.value;
  const verifier = jar.get('jobber_oauth_verifier')?.value;

  if (!code || !state || state !== savedState || !verifier) {
    return NextResponse.redirect(new URL('/settings?jobber=invalid-callback', APP_URL()));
  }

  const body = new URLSearchParams({
    client_id: process.env.JOBBER_CLIENT_ID ?? '',
    client_secret: process.env.JOBBER_CLIENT_SECRET ?? '',
    grant_type: 'authorization_code',
    code,
    redirect_uri: `${APP_URL()}/api/jobber/callback`,
    code_verifier: verifier,
  });
  const response = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) return NextResponse.redirect(new URL('/settings?jobber=authorization-failed', APP_URL()));

  const tokens = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number };
  if (!tokens.access_token) return NextResponse.redirect(new URL('/settings?jobber=authorization-failed', APP_URL()));
  jar.set('jobber_access_token', tokens.access_token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: tokens.expires_in ?? 3600, path: '/' });
  if (tokens.refresh_token) jar.set('jobber_refresh_token', tokens.refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 180, path: '/' });
  jar.delete('jobber_oauth_state');
  jar.delete('jobber_oauth_verifier');
  return NextResponse.redirect(new URL('/settings?jobber=connected', APP_URL()));
}
