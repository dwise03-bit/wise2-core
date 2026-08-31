import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { exchangeGoogleIdToken } from './wise2-api';

type OAuthProvider = 'google';

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

const BASE_PATH = '/wise-hvac-demo';

export function getHvacPublicUrl(): string {
  const configured = process.env.NEXT_PUBLIC_HVAC_URL || process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/$/, '');
  return 'https://hvac.wise2.net';
}

export function getHvacBasePath(): string {
  return BASE_PATH;
}

export function getHvacAppUrl(path = '/field-tech'): string {
  const base = getHvacPublicUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith(BASE_PATH)) return `${base}${normalized}`;
  return `${base}${BASE_PATH}${normalized}`;
}

export function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.replace(/\/$/, '');
  if (internal) return internal;

  const publicApi = (
    process.env.WISE2_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://wise2.net/api'
  ).replace(/\/$/, '');

  return publicApi.endsWith('/api') ? publicApi : `${publicApi}/api`;
}

export function getOAuthRedirectUri(provider: OAuthProvider): string {
  return `${getHvacPublicUrl()}${BASE_PATH}/api/auth/${provider}/callback`;
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
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function unwrapHvacAuth(body: unknown): WiseAuthResponse | null {
  const root = (body ?? {}) as Record<string, unknown>;
  const nested = (root.data ?? root) as Record<string, unknown>;
  const payload = (nested.data ?? nested) as Record<string, unknown>;
  const tokens = (payload.tokens ?? payload) as Record<string, unknown>;
  const user = (payload.user ?? nested.user) as WiseAuthResponse['user'] | undefined;
  const accessToken = (tokens.accessToken ?? payload.accessToken ?? nested.accessToken) as
    | string
    | undefined;
  if (!user || !accessToken) return null;
  return {
    user,
    accessToken,
    refreshToken: (tokens.refreshToken ?? payload.refreshToken) as string | undefined,
    expiresIn: (payload.expiresIn ?? nested.expiresIn) as number | undefined,
  };
}

function applyAuthCookies(response: NextResponse, auth: WiseAuthResponse) {
  const secure = process.env.NODE_ENV === 'production';
  const maxAge = auth.expiresIn || 60 * 60 * 24 * 7;

  response.cookies.set('wise2_access_token', auth.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  response.cookies.set('wise2_user', JSON.stringify(auth.user), {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  if (auth.refreshToken) {
    response.cookies.set('wise2_refresh_token', auth.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

async function exchangeGoogleCodeForIdToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => '');
    throw new Error(`Google token exchange failed (${tokenRes.status})${detail ? `: ${detail}` : ''}`);
  }

  const tokens = (await tokenRes.json()) as { id_token?: string };
  if (!tokens.id_token) {
    throw new Error('Google did not return an id_token');
  }

  return tokens.id_token;
}

export async function completeHvacOAuthLogin(code: string): Promise<NextResponse> {
  const redirectUri = getOAuthRedirectUri('google');

  let auth: WiseAuthResponse | null = null;
  try {
    const idToken = await exchangeGoogleCodeForIdToken(code, redirectUri);
    const raw = await exchangeGoogleIdToken(idToken);
    auth = unwrapHvacAuth(raw) ?? {
      user: raw.user,
      accessToken: raw.accessToken,
      refreshToken: raw.refreshToken,
    };
  } catch (error) {
    console.error('HVAC Google OAuth login failed:', error);
  }

  if (!auth?.accessToken) {
    const url = new URL(getHvacAppUrl('/signin'));
    url.searchParams.set('error', 'oauth_failed');
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(getHvacAppUrl('/field-tech'));
  applyAuthCookies(response, auth);
  response.cookies.delete('google_oauth_state');
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('wise2_access_token');
  response.cookies.delete('wise2_refresh_token');
  response.cookies.delete('wise2_user');
  response.cookies.delete('google_oauth_state');
}
