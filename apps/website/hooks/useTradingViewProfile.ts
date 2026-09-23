'use client';

import { useState, useEffect } from 'react';

interface TradingViewWatchlistItem {
  symbol: string;
  exchange?: string;
  name?: string;
}

/**
 * Fetch TradingView profile data for a user
 * Includes watchlist, alerts, and account info
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

        // Fetch TradingView public profile
        // Using TradingView's public API endpoint
        const response = await fetch(
          `https://api.tradingview.com/api/v1/user/get_profile?username=${username}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch TradingView profile: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);

        // Extract watchlist from profile
        if (data.watchlist && Array.isArray(data.watchlist)) {
          setWatchlist(
            data.watchlist.map((item: any) => ({
              symbol: item.symbol || item.ticker,
              exchange: item.exchange,
              name: item.name,
            }))
          );
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching TradingView profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');

        // Fallback: Use default watchlist with user's known symbols
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
