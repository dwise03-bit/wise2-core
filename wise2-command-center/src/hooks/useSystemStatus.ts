import { useState, useEffect } from 'react';
import { fetchSystemStatus, SystemStatus } from '@/services/systemStatus';

const DEFAULT_STATUS: SystemStatus = {
  wise2Core: {
    ollama: 'Loading',
    hermes: 'Loading',
    codex: 'Loading',
    modelCount: 0,
  },
  vpsOps: {
    docker: { healthy: 0, total: 0, status: 'Loading' },
    traefik: 'Loading',
    postgresql: 'Loading',
    redis: 'Loading',
    wise2net: 'Loading',
  },
  gpuAi: {
    gpu: 'LOADING',
    cuda: 'Loading',
    ollamaModels: 'Loading',
    claudeCode: 'Loading',
  },
  access: {
    tailscale: 'Loading',
    user: 'DANIEL',
    accessLevel: 'OWNER CONTROL',
    creditMode: 'Active',
  },
};

export function useSystemStatus(refetchInterval = 30000) {
  const [status, setStatus] = useState<SystemStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await fetchSystemStatus();
        if (isMounted) {
          setStatus(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch status');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up refetch interval
    intervalId = setInterval(fetchStatus, refetchInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [refetchInterval]);

  return { status, loading, error };
}
