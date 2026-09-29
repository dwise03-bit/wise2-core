/**
 * Server-side Nest API base URL for Command Center route handlers.
 * Prefer API_URL / API_INTERNAL_URL in Docker; fall back to local docker-compose host port.
 */
export function getServerApiUrl(): string {
  const raw =
    process.env.API_URL ||
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3010/api';

  return raw.replace(/\/$/, '');
}

/** Browser-safe API base — always same-origin proxy. */
export function getClientApiUrl(): string {
  if (typeof window !== 'undefined') return '/api';
  return getServerApiUrl();
}
