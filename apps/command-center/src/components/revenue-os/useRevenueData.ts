'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Base URL for the Revenue OS API served by packages/api.
 *
 * Defaults to the same origin so the Command Center talks to whatever gateway
 * is in front of it. Override with NEXT_PUBLIC_REVENUE_API_URL when the API is
 * on a different host (e.g. http://localhost:3011/api/revenue-os).
 */
export const REVENUE_API_BASE =
  process.env.NEXT_PUBLIC_REVENUE_API_URL || '/api/revenue-os';

export type FetchState = 'loading' | 'ready' | 'error';

export interface RevenueQuery<T> {
  data: T | null;
  state: FetchState;
  /** Human-readable failure reason. Null while loading or on success. */
  error: string | null;
  refetch: () => void;
}

/**
 * Thin fetch wrapper for Revenue OS endpoints.
 *
 * Deliberately has no placeholder/seed data: while loading, `data` is null and
 * callers render skeletons; on failure, `data` stays null and callers render an
 * error state. A Revenue OS screen must never display a number the API did not
 * return.
 */
export function useRevenueData<T>(
  path: string,
  normalize: (raw: unknown) => T,
): RevenueQuery<T> {
  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<FetchState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Keep the normalizer stable across renders without forcing every caller to
  // memoize it — we only ever want `path` and `nonce` to drive a refetch.
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setState('loading');
    setError(null);

    fetch(`${REVENUE_API_BASE}${path}`, {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Endpoint not available yet'
              : `Request failed (${res.status})`,
          );
        }
        return res.json();
      })
      .then((raw) => {
        if (!active) return;
        setData(normalizeRef.current(raw));
        setState('ready');
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setData(null);
        setError(err instanceof Error ? err.message : 'Request failed');
        setState('error');
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [path, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, state, error, refetch };
}
