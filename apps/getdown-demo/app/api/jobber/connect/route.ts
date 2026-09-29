import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const AUTH_URL = 'https://api.getjobber.com/api/oauth/authorize';

function callbackUrl() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://getdown-owner-demo.vercel.app'}/api/jobber/callback`;
}

export async function GET() {
  const clientId = process.env.JOBBER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL('/settings?jobber=missing-config', callbackUrl()));
  }

  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const jar = await cookies();
  jar.set('jobber_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  jar.set('jobber_oauth_verifier', verifier, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });

  const url = new URL(AUTH_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl());
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('scope', process.env.JOBBER_SCOPES ?? 'read_clients read_jobs read_quotes read_invoices');
  return NextResponse.redirect(url);
}
