import { NextRequest, NextResponse } from 'next/server';
import { completeOAuthLogin } from '@/lib/oauth-callback';

export const dynamic = 'force-dynamic';

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(
  /\/$/,
  '',
);
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || `${PUBLIC_SITE_URL}/auth/google/callback`;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=google_rejected', PUBLIC_SITE_URL),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin?error=no_code', PUBLIC_SITE_URL));
  }

  const savedState = request.cookies.get('google_oauth_state')?.value;
  if (state && savedState && state !== savedState) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=state_mismatch', PUBLIC_SITE_URL),
    );
  }

  try {
    return await completeOAuthLogin('google', code, REDIRECT_URI);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/signin?error=oauth_failed', PUBLIC_SITE_URL),
    );
  }
}
