'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api-config';

interface TradingViewWatchlistItem {
  symbol: string;
  exchange?: string;
  name?: string;
}

/**
 * Fetch TradingView profile data for a user via WISE² backend
 * Syncs watchlist with caching and real-time updates
 */
export function useTradingViewProfile(username: string) {
  const [watchlist, setWatchlist] = useState<TradingViewWatchlistItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch via WISE² backend (uses cached TradingView API)
        const apiUrl = getApiUrl();
        const response = await fetch(
          `${apiUrl}/api/trading/tradingview/watchlist/${username}`
        );

        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
        setWatchlist(data.watchlist || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching TradingView profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');

        // Fallback: Use default watchlist
        setWatchlist([
          { symbol: 'BTCUSD', name: 'Bitcoin' },
          { symbol: 'ETHUSD', name: 'Ethereum' },
          { symbol: 'AAPL', name: 'Apple' },
          { symbol: 'MSFT', name: 'Microsoft' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  return { watchlist, profile, loading, error };
}
