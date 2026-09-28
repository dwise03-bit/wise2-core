import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get('alpaca_oauth_state')?.value;
  const redirectUri = request.cookies.get('alpaca_oauth_redirect')?.value;
  const site = new URL('/trading', request.url);

  if (!code || !state || !expectedState || state !== expectedState || !redirectUri) {
    site.searchParams.set('alpaca', 'invalid-state');
    return NextResponse.redirect(site);
  }

  if (!process.env.ALPACA_CLIENT_ID || !process.env.ALPACA_CLIENT_SECRET) {
    site.searchParams.set('alpaca', 'not-configured');
    return NextResponse.redirect(site);
  }

  const tokenResponse = await fetch('https://api.alpaca.markets/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.ALPACA_CLIENT_ID,
      client_secret: process.env.ALPACA_CLIENT_SECRET,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    site.searchParams.set('alpaca', 'exchange-failed');
    return NextResponse.redirect(site);
  }

  const token = (await tokenResponse.json()) as { access_token?: string; token_type?: string; scope?: string };
  if (!token.access_token) {
    site.searchParams.set('alpaca', 'missing-token');
    return NextResponse.redirect(site);
  }

  const response = NextResponse.redirect(new URL('/trading?alpaca=connected&mode=paper', request.url));
  response.cookies.set('alpaca_access_token', token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set('alpaca_connection', JSON.stringify({ mode: 'paper', scope: token.scope || 'account:write trading' }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.delete('alpaca_oauth_state');
  response.cookies.delete('alpaca_oauth_redirect');
  return response;
}
