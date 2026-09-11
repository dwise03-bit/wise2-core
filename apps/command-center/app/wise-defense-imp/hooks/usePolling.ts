import { useEffect, useState, useRef, useCallback } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<{ data?: T; status: 'success' | 'error' | 'offline' }>,
  interval: number,
  initialData?: T,
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      if (result.status === 'success' && result.data) {
        setData(result.data);
        setError(null);
        setIsOnline(true);
      } else {
        setIsOnline(false);
        setError(result.status === 'offline' ? 'Connection lost' : 'Error fetching data');
      }
    } catch (err) {
      setIsOnline(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval]);

  return { data, loading, error, isOnline, refetch: fetchData };
}
