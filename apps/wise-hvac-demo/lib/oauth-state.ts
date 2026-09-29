import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

export type OAuthProvider = 'google';

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret(): string {
  return (
    process.env.OAUTH_STATE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    ''
  );
}

export function createOAuthState(
  provider: OAuthProvider,
  now = Date.now(),
  extras: { native?: boolean } = {},
): string {
  const nonce = randomUUID();
  const secret = getStateSecret();
  if (!secret) {
    return `${provider}:${nonce}`;
  }

  const body = Buffer.from(
    JSON.stringify({
      p: provider,
      n: nonce,
      t: now,
      ...(extras.native ? { native: true } : {}),
    }),
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function signedOAuthStateIsNative(state: string | null): boolean {
  if (!state) return false;
  const separator = state.lastIndexOf('.');
  if (separator <= 0) return false;
  try {
    const payload = JSON.parse(Buffer.from(state.slice(0, separator), 'base64url').toString('utf8')) as {
      native?: boolean;
    };
    return payload.native === true;
  } catch {
    return false;
  }
}

export function verifySignedOAuthState(
  provider: OAuthProvider,
  state: string | null,
  now = Date.now(),
): boolean {
  if (!state) return false;
  const secret = getStateSecret();
  const separator = state.lastIndexOf('.');
  if (!secret || separator <= 0) return false;

  const body = state.slice(0, separator);
  const sig = state.slice(separator + 1);
  if (!body || !sig) return false;

  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const actualBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      p?: string;
      t?: number;
    };
    if (payload.p !== provider || typeof payload.t !== 'number') return false;
    return now - payload.t >= 0 && now - payload.t <= OAUTH_STATE_TTL_MS;
  } catch {
    return false;
  }
}

export function isLegacyOAuthState(provider: OAuthProvider, state: string | null): boolean {
  return Boolean(state?.startsWith(`${provider}:`));
}
