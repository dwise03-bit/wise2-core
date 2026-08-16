import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.API_URL || 'http://api:3000/api';
/**
 * Public base for post-login redirects.
 *
 * Never derive this from request.nextUrl.origin: behind the proxy Next
 * resolves that to its own listening address (HOSTNAME=0.0.0.0, PORT=3000),
 * so users were sent to https://0.0.0.0:3000 — a URL that exists only inside
 * the container. The sign-in itself succeeded; only the destination was wrong.
 */
const APP_URL = (process.env.APP_URL || 'https://command.wise2.net').replace(/\/$/, '');
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

  if (error) {
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=${encodeURIComponent(error)}`, APP_URL));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=no_code`, APP_URL));
  }

  // CSRF: the state we issued must come back unchanged.
  const savedState = request.cookies.get('cc_google_state')?.value;
  if (!savedState || !state || savedState !== state) {
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=state_mismatch`, APP_URL));
  }

  try {
    const upstream = await fetch(
      `${API_URL}/v1/auth/google/callback?code=${encodeURIComponent(code)}`,
      // Do not follow: the token lives in the Location header and following it
      // would leak the token into a browser-visible URL.
      { redirect: 'manual' },
    );

    const location = upstream.headers.get('location') ?? '';
    const token = new URL(location, APP_URL).searchParams.get('token');

    if (!token) {
      // The API redirects with ?error=oauth_failed when the exchange fails.
      return NextResponse.redirect(new URL(`${LOGIN_URL}?error=oauth_failed`, APP_URL));
    }

    const response = NextResponse.redirect(new URL(SUCCESS_URL, APP_URL));

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
    return NextResponse.redirect(new URL(`${LOGIN_URL}?error=auth_unavailable`, APP_URL));
  }
}
