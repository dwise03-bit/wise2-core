'use client';

import { useState, useCallback, useRef } from 'react';
import type { StreamState, StreamSettings, PlatformCredentials, StreamStats } from './streamingTypes';
import { DEFAULT_STREAM_SETTINGS } from './streamingConstants';

const DEFAULT_STATS: StreamStats = {
  viewerCount: 0,
  bitrateCurrent: 3500,
  bitrateAverage: 3500,
  frameRateCurrent: 30,
  frameRateTarget: 30,
  droppedFrames: 0,
  droppedFramePercentage: 0,
  encodingLag: 0,
  networkLatency: 0,
  cpuUsage: 0,
  gpuUsage: 0,
  reconnectCount: 0,
  uptime: 0,
};

const DEFAULT_STATE: StreamState = {
  status: 'idle',
  settings: DEFAULT_STREAM_SETTINGS as any,
  credentials: null,
  stats: DEFAULT_STATS,
  health: 'good',
  isPaused: false,
};

export function useStreamingState() {
  const [state, setState] = useState<StreamState>(DEFAULT_STATE);
  const statsIntervalRef = useRef<NodeJS.Timeout>();
  const uptimeIntervalRef = useRef<NodeJS.Timeout>();

  const updateSettings = useCallback((settings: Partial<StreamSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const updateCredentials = useCallback((credentials: PlatformCredentials) => {
    setState((prev) => ({
      ...prev,
      credentials,
    }));
  }, []);

  const startStream = useCallback(async () => {
    if (state.status === 'live') {
      throw new Error('Stream already running');
    }

    if (!state.credentials?.streamKey) {
      throw new Error('Stream key not set');
    }

    setState((prev) => ({
      ...prev,
      status: 'connecting',
    }));

    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        status: 'live',
        stats: { ...prev.stats, uptime: 0 },
      }));

      // Start stats simulation
      statsIntervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.status !== 'live' && prev.status !== 'paused') {
            return prev;
          }

          // Simulate realistic stats
          const newBitrate = Math.max(
            prev.settings.bitrate.min,
            Math.min(
              prev.settings.bitrate.max,
              prev.stats.bitrateCurrent + (Math.random() - 0.5) * 200
            )
          );

          const dropRate = Math.random() < 0.95 ? 0 : Math.floor(Math.random() * 5);

          return {
            ...prev,
            stats: {
              ...prev.stats,
              viewerCount: Math.max(0, prev.stats.viewerCount + Math.floor((Math.random() - 0.5) * 10)),
              bitrateCurrent: newBitrate,
              bitrateAverage: (prev.stats.bitrateAverage + newBitrate) / 2,
              frameRateCurrent: prev.settings.fps - Math.floor(Math.random() * 2),
              droppedFrames: prev.stats.droppedFrames + dropRate,
              droppedFramePercentage: ((prev.stats.droppedFrames + dropRate) / 1800) * 100,
              encodingLag: Math.max(0, Math.random() * 30),
              networkLatency: 20 + Math.random() * 30,
              cpuUsage: 40 + Math.random() * 30,
              gpuUsage: 30 + Math.random() * 20,
            },
          };
        });
      }, 1000);

      // Start uptime counter
      uptimeIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            uptime: prev.stats.uptime + 1,
          },
        }));
      }, 1000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        lastError: error instanceof Error ? error.message : 'Failed to start stream',
      }));
      throw error;
    }
  }, [state.status, state.credentials, state.settings]);

  const stopStream = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    if (uptimeIntervalRef.current) {
      clearInterval(uptimeIntervalRef.current);
    }

    setState((prev) => ({
      ...prev,
      status: 'idle',
      isPaused: false,
      stats: DEFAULT_STATS,
    }));
  }, []);

  const pauseStream = useCallback(async () => {
    if (state.status !== 'live') {
      throw new Error('Can only pause a live stream');
    }

    setState((prev) => ({
      ...prev,
      status: 'paused',
      isPaused: true,
    }));
  }, [state.status]);

  const resumeStream = useCallback(async () => {
    if (state.status !== 'paused') {
      throw new Error('Stream is not paused');
    }

    setState((prev) => ({
      ...prev,
      status: 'live',
      isPaused: false,
    }));
  }, [state.status]);

  const testStream = useCallback(async () => {
    if (!state.credentials?.streamKey) {
      throw new Error('Stream key not set');
    }

    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  }, [state.credentials]);

  const resetStreamKey = useCallback(async () => {
    const newKey = 'new-key-' + Date.now();

    setState((prev) => ({
      ...prev,
      credentials: prev.credentials
        ? { ...prev.credentials, streamKey: newKey }
        : null,
    }));

    return newKey;
  }, []);

  const captureScreenshot = useCallback(async () => {
    // Simulate screenshot capture
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.fillText('Screenshot captured', 400, 500);
    }

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });
  }, []);

  return {
    state,
    updateSettings,
    updateCredentials,
    startStream,
    stopStream,
    pauseStream,
    resumeStream,
    testStream,
    resetStreamKey,
    captureScreenshot,
  };
}
