import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.API_URL || 'http://api:3000/api';
const LOGIN_URL = '/login';
const SUCCESS_URL = '/revenue-os';

/**
 * Completes Google sign-in for the Command Center.
 *
 * The authorization code is handed to the API, which already owns the whole
 * exchange: it swaps the code with Google, finds or creates the user, and
 * issues an application JWT. Reusing that path means no second implementation
 * of user creation or token minting, and no JWT signing key in this app.
 *
 * The API answers with a redirect carrying `?token=`. That exchange happens
 * server to server and the redirect is read rather than followed, so the token
 * never reaches the browser's address bar or its history. Only the resulting
 * httpOnly cookie does — the same cookie the password flow sets.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  const origin = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=${encodeURIComponent(error)}`, origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=no_code`, origin));
  }

  // CSRF: the state we issued must come back unchanged.
  const savedState = request.cookies.get('cc_google_state')?.value;
  if (!savedState || !state || savedState !== state) {
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=state_mismatch`, origin));
  }

  try {
    const upstream = await fetch(
      `${API_URL}/v1/auth/google/callback?code=${encodeURIComponent(code)}`,
      // Do not follow: the token lives in the Location header and following it
      // would leak the token into a browser-visible URL.
      { redirect: 'manual' },
    );

    const location = upstream.headers.get('location') ?? '';
    const token = new URL(location, origin).searchParams.get('token');

    if (!token) {
      // The API redirects with ?error=oauth_failed when the exchange fails.
      return NextResponse.redirect(new URL(`${LOGIN_URL}?error=oauth_failed`, origin));
    }

    const response = NextResponse.redirect(new URL(SUCCESS_URL, origin));

    // Same cookie, lifetime and flags as the password sign-in route, so both
    // paths converge on one session mechanism.
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.delete('cc_google_state');
    return response;
  } catch {
    // Never surface the underlying error to the browser; it can contain the
    // upstream URL and query.
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=auth_unavailable`, origin));
  }
}
