'use client';

import { useState, useCallback, useEffect } from 'react';
import type { StreamStatusInfo, StreamDestination, StreamConfig } from '../types/streaming';

/**
 * Hook for managing streaming state and controls
 */
export function useStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatusInfo>({
    isLive: false,
    status: 'idle',
    viewerCount: 0,
    uptime: 0,
    bitrate: 0,
    resolution: '1080p',
    frameRate: 60,
  });

  const [config, setConfig] = useState<StreamConfig>({
    title: 'Untitled Stream',
    description: '',
    category: 'Music',
    tags: [],
    visibility: 'public',
  });

  const [destinations, setDestinations] = useState<StreamDestination[]>([]);

  /**
   * Start streaming
   */
  const startStream = useCallback(async () => {
    try {
      setStreamStatus((prev) => ({ ...prev, status: 'starting' }));
      // API call to start stream would go here
      setIsStreaming(true);
      setStreamStatus((prev) => ({
        ...prev,
        status: 'streaming',
        isLive: true,
      }));
    } catch (error) {
      console.error('Failed to start stream:', error);
      setStreamStatus((prev) => ({ ...prev, status: 'error' }));
    }
  }, []);

  /**
   * Stop streaming
   */
  const stopStream = useCallback(async () => {
    try {
      setStreamStatus((prev) => ({ ...prev, status: 'stopping' }));
      // API call to stop stream would go here
      setIsStreaming(false);
      setStreamStatus((prev) => ({
        ...prev,
        status: 'idle',
        isLive: false,
        uptime: 0,
      }));
    } catch (error) {
      console.error('Failed to stop stream:', error);
      setStreamStatus((prev) => ({ ...prev, status: 'error' }));
    }
  }, []);

  /**
   * Update stream configuration
   */
  const updateConfig = useCallback((newConfig: Partial<StreamConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Connect a destination
   */
  const connectDestination = useCallback(async (destination: StreamDestination) => {
    try {
      // API call to connect destination would go here
      setDestinations((prev) => [
        ...prev.filter((d) => d.id !== destination.id),
        { ...destination, isConnected: true },
      ]);
    } catch (error) {
      console.error('Failed to connect destination:', error);
    }
  }, []);

  /**
   * Disconnect a destination
   */
  const disconnectDestination = useCallback(async (destinationId: string) => {
    try {
      // API call to disconnect destination would go here
      setDestinations((prev) =>
        prev.map((d) =>
          d.id === destinationId ? { ...d, isConnected: false } : d
        )
      );
    } catch (error) {
      console.error('Failed to disconnect destination:', error);
    }
  }, []);

  /**
   * Simulate uptime increment (in real app, this would come from server)
   */
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setStreamStatus((prev) => ({
        ...prev,
        uptime: prev.uptime + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  return {
    // State
    isStreaming,
    streamStatus,
    config,
    destinations,

    // Actions
    startStream,
    stopStream,
    updateConfig,
    connectDestination,
    disconnectDestination,
  };
}
