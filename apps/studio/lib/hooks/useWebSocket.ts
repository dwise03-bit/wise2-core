'use client';

import { useEffect, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export function useWebSocket(url: string = 'ws://localhost:3000') {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    try {
      const socket = new WebSocket(url);

      socket.onopen = () => setIsConnected(true);
      socket.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        setData((prev) => ({ ...prev, [message.type]: message.data }));
      };
      socket.onclose = () => setIsConnected(false);

      return () => socket.close();
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }, [url]);

  return { isConnected, data };
}
