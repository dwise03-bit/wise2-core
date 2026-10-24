import { NextRequest, NextResponse } from 'next/server';
import {
  mailCheckCookieName,
  sealMailCheckSession,
} from '@/lib/mail-check-session';

export const dynamic = 'force-dynamic';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '');
const REDIRECT_URI = process.env.MAIL_CHECK_REDIRECT_URI || `${PUBLIC_SITE_URL}/api/mail-check/callback`;
const STATE_COOKIE = 'wise2_mail_check_state';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const savedState = request.cookies.get(STATE_COOKIE)?.value;
  const destination = new URL('/email#mail-check', PUBLIC_SITE_URL);

  if (!code || !state || !savedState || state !== savedState) {
    destination.searchParams.set('mail_check', 'invalid_state');
    return NextResponse.redirect(destination);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret || !process.env.MAIL_CHECK_SESSION_SECRET) {
      throw new Error('Mail Check is not configured.');
    }

    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
    });

    if (!tokenResponse.ok) throw new Error('Google token exchange failed.');

    const tokens = await tokenResponse.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!tokens.access_token) throw new Error('Google did not return an access token.');

    const response = NextResponse.redirect(destination);
    response.cookies.set(mailCheckCookieName(), sealMailCheckSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (error) {
    console.error('Mail Check OAuth callback failed:', error instanceof Error ? error.message : 'unknown error');
    destination.searchParams.set('mail_check', 'connect_failed');
    return NextResponse.redirect(destination);
  }
}
