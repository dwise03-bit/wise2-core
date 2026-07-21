'use client';

import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@lib/websocket-client';
import { WebSocketMessage } from '@types/api';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsClient.connect();
        setConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('WebSocket connection failed'));
        setConnected(false);
      }
    };

    connectWebSocket();

    const unsubscribeConnection = wsClient.onConnectionChange((isConnected) => {
      setConnected(isConnected);
    });

    return () => {
      unsubscribeConnection();
      wsClient.disconnect();
    };
  }, []);

  return { connected, error };
}

export function useWebSocketMessage(callback: (message: WebSocketMessage) => void) {
  useEffect(() => {
    const unsubscribe = wsClient.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}

export function useWebSocketMetric(widgetId: string, onData: (data: any) => void) {
  useEffect(() => {
    const unsubscribe = wsClient.subscribe((message) => {
      if (message.widgetId === widgetId) {
        onData(message.data);
      }
    });

    return unsubscribe;
  }, [widgetId, onData]);
}
