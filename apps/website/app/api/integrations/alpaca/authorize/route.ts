import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const ALPACA_AUTHORIZE_URL = 'https://app.alpaca.markets/oauth/authorize';

function siteUrl(request: NextRequest) {
  return (process.env.ALPACA_REDIRECT_URI || `${request.nextUrl.origin}/api/integrations/alpaca/callback`).replace(/\/callback$/, '');
}

export async function GET(request: NextRequest) {
  const clientId = process.env.ALPACA_CLIENT_ID;
  const redirectUri = process.env.ALPACA_REDIRECT_URI || `${siteUrl(request)}/api/integrations/alpaca/callback`;

  if (!clientId) {
    return NextResponse.redirect(new URL('/trading?alpaca=not-configured', request.url));
  }

  const state = crypto.randomBytes(32).toString('hex');
  const url = new URL(ALPACA_AUTHORIZE_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'account:write trading');
  // Paper is the only permitted first connection. Live activation is an explicit later action.
  url.searchParams.set('env', 'paper');
  url.searchParams.set('state', state);

  const response = NextResponse.redirect(url);
  response.cookies.set('alpaca_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  response.cookies.set('alpaca_oauth_redirect', redirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return NextResponse.redirect(url);
}
