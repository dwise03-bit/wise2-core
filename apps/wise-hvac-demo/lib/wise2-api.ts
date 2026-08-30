import { getApiBaseUrl } from './oauth';

export function wise2ApiBaseUrl(): string {
  return getApiBaseUrl();
}

export async function wise2Fetch(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${wise2ApiBaseUrl()}/${path.replace(/^\//, '')}`;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers, cache: 'no-store' });
}

export async function exchangeGoogleIdToken(idToken: string) {
  const response = await fetch(`${wise2ApiBaseUrl()}/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    cache: 'no-store',
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`WISE² auth exchange failed (${response.status})${detail ? `: ${detail}` : ''}`);
  }
  return response.json() as Promise<{
    accessToken: string;
    refreshToken?: string;
    user: { id: string; email: string; role?: string; firstName?: string; lastName?: string };
  }>;
}
