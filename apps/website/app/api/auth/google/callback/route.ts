import { NextRequest, NextResponse } from 'next/server';
import { completeOAuthLogin } from '@/lib/oauth-callback';
import { GET as completeMailCheckOAuth } from '@/app/api/mail-check/callback/route';

export const dynamic = 'force-dynamic';

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(
  /\/$/,
  '',
);
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || `${PUBLIC_SITE_URL}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  // Mail Check shares this callback only when an existing Google OAuth client
  // has this URL registered. Keep its token handling isolated from WISE² login.
  const mailCheckState = request.cookies.get('wise2_mail_check_state')?.value;
  if (mailCheckState && state === mailCheckState) {
    return completeMailCheckOAuth(request);
  }

  if (error) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=google_rejected', PUBLIC_SITE_URL),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin?error=no_code', PUBLIC_SITE_URL));
  }

  const savedState = request.cookies.get('google_oauth_state')?.value;
  const returnTo = request.cookies.get('google_oauth_return_to')?.value;
  const postLoginUrl = returnTo === 'https://sjs.wise2.net' ? returnTo : PUBLIC_SITE_URL;
  if (state && savedState && state !== savedState) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=state_mismatch', PUBLIC_SITE_URL),
    );
  }

  try {
    return await completeOAuthLogin('google', code, REDIRECT_URI, postLoginUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/auth/signin?error=oauth_failed', PUBLIC_SITE_URL),
    );
  }
}
