export function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.replace(/\/$/, '');
  if (internal) {
    return internal.endsWith('/api') ? internal : `${internal}/api`;
  }

  const publicApi = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.wise2.net'
  ).replace(/\/$/, '');

  return publicApi.endsWith('/api') ? publicApi : `${publicApi}/api`;
}

export function getSiteUrl(requestOrigin?: string): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin || 'https://wise2.net').replace(
    /\/$/,
    '',
  );
}

export function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
}

export function discordClientId(): string {
  return (
    process.env.DISCORD_CLIENT_ID ||
    process.env.DISCORD_OAUTH_CLIENT_ID ||
    process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ||
    ''
  );
}

export function googleRedirectUri(origin: string): string {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.GOOGLE_REDIRECT_URI_WEBSITE ||
    (process.env.NODE_ENV === 'production'
      ? 'https://wise2.net/api/auth/google/callback'
      : `${origin}/api/auth/google/callback`)
  );
}

export function discordRedirectUri(origin: string): string {
  return (
    process.env.DISCORD_REDIRECT_URI ||
    (process.env.NODE_ENV === 'production'
      ? 'https://wise2.net/api/auth/discord/callback'
      : `${origin}/api/auth/discord/callback`)
  );
}

export interface WiseAuthResponse {
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

export function unwrapAuthResponse(body: unknown): WiseAuthResponse | null {
  const root = (body ?? {}) as Record<string, unknown>;
  const nested = (root.data ?? root) as Record<string, unknown>;
  const payload = (nested.data ?? nested) as Record<string, unknown>;
  const tokens = (payload.tokens ?? payload) as Record<string, unknown>;
  const user = (payload.user ?? nested.user) as WiseAuthResponse['user'] | undefined;
  const accessToken = (tokens.accessToken ?? payload.accessToken ?? nested.accessToken) as
    | string
    | undefined;

  if (!user?.id || !accessToken) return null;

  return {
    user,
    accessToken,
    refreshToken: (tokens.refreshToken ?? payload.refreshToken ?? nested.refreshToken) as
      | string
      | undefined,
    expiresIn: (payload.expiresIn ?? nested.expiresIn) as number | undefined,
  };
}
