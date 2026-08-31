import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

type OAuthProvider = 'google' | 'discord';

interface WiseAuthResponse {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net').replace(/\/$/, '');
}

export function getCherryCountBase(): string {
  return `${getSiteUrl()}/cherry-count`;
}

function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.replace(/\/$/, '');
  if (internal) return internal;

  const publicApi = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net/api').replace(
    /\/$/,
    '',
  );
  return publicApi.endsWith('/api') ? publicApi : `${publicApi}/api`;
}

export function getOAuthRedirectUri(provider: OAuthProvider): string {
  return `${getCherryCountBase()}/api/auth/${provider}/callback`;
}

export async function completeCherryOAuthLogin(
  provider: OAuthProvider,
  code: string,
): Promise<NextResponse> {
  const redirectUri = getOAuthRedirectUri(provider);
  const exchangeRes = await fetch(`${getApiBaseUrl()}/v1/auth/oauth/${provider}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!exchangeRes.ok) {
    const errorText = await exchangeRes.text();
    console.error(`Cherry Count ${provider} OAuth exchange failed:`, errorText);
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', getCherryCountBase()),
    );
  }

  const auth = (await exchangeRes.json()) as WiseAuthResponse;
  const token = auth.accessToken;
  const user = auth.user;

  const workspaceRes = await fetch(`${getApiBaseUrl()}/v1/cherry-count/workspaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const workspaces = workspaceRes.ok ? await workspaceRes.json() : [];
  const tenantId = Array.isArray(workspaces) && workspaces[0]?.tenantId
    ? workspaces[0].tenantId
    : '';

  const callbackUrl = new URL('/auth/callback', getCherryCountBase());
  callbackUrl.searchParams.set('token', token);
  callbackUrl.searchParams.set('user', JSON.stringify(user));
  if (tenantId) callbackUrl.searchParams.set('tenantId', tenantId);

  const response = NextResponse.redirect(callbackUrl);
  response.cookies.delete(`${provider}_oauth_state`);
  return response;
}

export function buildGoogleAuthorizeUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri('google'),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function buildDiscordAuthorizeUrl(state: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  if (!clientId) {
    throw new Error('DISCORD_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri('discord'),
    response_type: 'code',
    scope: 'identify email',
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export function createOAuthState(provider: OAuthProvider): string {
  return `${provider}:${randomUUID()}`;
}

export async function validateOAuthState(
  provider: OAuthProvider,
  state: string | null,
): Promise<boolean> {
  if (!state || !state.startsWith(`${provider}:`)) return false;
  const cookieStore = await cookies();
  const stored = cookieStore.get(`${provider}_oauth_state`)?.value;
  return stored === state;
}
