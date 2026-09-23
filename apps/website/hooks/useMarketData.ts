'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getWebSocketUrl } from '@/lib/api-config';

interface Quote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: Date;
}

/**
 * Real-time market data hook
 * Connects to WebSocket gateway for live price updates
 */
export function useMarketData(symbols: string[] = ['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT']) {
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map());
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const wsUrl = getWebSocketUrl();
    const newSocket = io(wsUrl, {
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to market data gateway');
      setConnected(true);

      // Subscribe to symbols
      symbols.forEach(symbol => {
        newSocket.emit('subscribe-symbol', { symbol });
      });
    });

    newSocket.on('quote-update', (quote: Quote) => {
      setQuotes(prev => {
        const updated = new Map(prev);
        updated.set(quote.symbol, {
          ...quote,
          timestamp: new Date(quote.timestamp),
        });
        return updated;
      });
    });

    newSocket.on('market-snapshot', (marketQuotes: Quote[]) => {
      const newMap = new Map<string, Quote>();
      marketQuotes.forEach(quote => {
        newMap.set(quote.symbol, {
          ...quote,
          timestamp: new Date(quote.timestamp),
        });
      });
      setQuotes(newMap);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from market data gateway');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [symbols]);

  const getPrice = useCallback((symbol: string): number => {
    return quotes.get(symbol)?.price || 0;
  }, [quotes]);

  const getQuote = useCallback((symbol: string): Quote | null => {
    return quotes.get(symbol) || null;
  }, [quotes]);

  return {
    quotes,
    connected,
    getPrice,
    getQuote,
    socket,
  };
}
