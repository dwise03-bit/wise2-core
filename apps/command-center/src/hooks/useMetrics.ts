'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@lib/api-client';

interface UseMetricsOptions {
  interval?: number;
  enabled?: boolean;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { interval = 5000, enabled = true } = options;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getMetrics();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, interval);

    return () => clearInterval(intervalId);
  }, [interval, enabled]);

  return { data, loading, error };
}

export function useOrchestratorMetrics(options: UseMetricsOptions = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.enabled === false) return;

    const fetch = async () => {
      try {
        const response = await apiClient.getOrchestratorMetrics();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetch();
    const id = setInterval(fetch, options.interval ?? 5000);
    return () => clearInterval(id);
  }, [options.interval, options.enabled]);

  return { data, loading, error };
}

export function useSystemMetrics(options: UseMetricsOptions = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.enabled === false) return;

    const fetch = async () => {
      try {
        const response = await apiClient.getSystemMetrics();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetch();
    const id = setInterval(fetch, options.interval ?? 5000);
    return () => clearInterval(id);
  }, [options.interval, options.enabled]);

  return { data, loading, error };
}
