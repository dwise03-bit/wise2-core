import { NextRequest, NextResponse } from 'next/server';

// OAuth routes must never be prerendered. These read credentials from the
// runtime environment and mint a per-request CSRF state; if Next.js decides
// a branch is static it freezes that response at build time. That is exactly
// what happened to Discord: DISCORD_CLIENT_ID was empty during the image
// build, so the "not configured" redirect was baked in and served forever,
// even though the running container has the credential.
export const dynamic = 'force-dynamic';


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '');
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || `${PUBLIC_SITE_URL}/api/auth/google/callback`;
const DASHBOARD_URL = (process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.wise2.net').replace(/\/$/, '');

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=google_rejected', PUBLIC_SITE_URL),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', PUBLIC_SITE_URL),
    );
  }

  const savedState = request.cookies.get('google_oauth_state')?.value;
  if (state && savedState && state !== savedState) {
    return NextResponse.redirect(
      new URL('/auth/login?error=state_mismatch', PUBLIC_SITE_URL),
    );
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange failed:', errText);
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenRes.json();
    const { access_token, id_token, refresh_token, expires_in } = tokenData;

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch Google user profile');
    }

    const profile = await userRes.json();

    const userData = {
      id: profile.id,
      email: profile.email,
      firstName: profile.given_name || profile.name?.split(' ')[0] || '',
      lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      picture: profile.picture,
      provider: 'google',
      verified: profile.verified_email,
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.redirect(new URL(DASHBOARD_URL));

    response.cookies.set('google_user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('google_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in || 3600,
      path: '/',
    });

    if (refresh_token) {
      response.cookies.set('google_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }

    response.cookies.delete('google_oauth_state');

    console.log('Google OAuth successful for user:', profile.email);
    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/login?error=oauth_failed', PUBLIC_SITE_URL),
    );
  }
}
