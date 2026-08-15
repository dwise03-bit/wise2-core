/**
 * Enhanced OBS Streaming Hook with Error Handling & Recovery
 * Comprehensive error management for streaming operations with auto-reconnection
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getObsClientEnhanced } from '../lib/obs-client-enhanced';
import {
  AppError,
  ObsError,
  ErrorType,
  ErrorSeverity,
  ErrorLogger,
  RecoveryAction,
} from '../lib/error-handling';

export interface StreamStatus {
  status: 'idle' | 'connecting' | 'live' | 'stopping' | 'error' | 'reconnecting';
  isLive: boolean;
  viewerCount: number;
  uptime: number;
  bitrate: number;
  droppedFrames: number;
}

export interface RecordingStatus {
  isRecording: boolean;
  duration: number;
  diskUsagePercent: number;
  diskFull: boolean;
}

interface UseObsErrorHandlingOptions {
  onStreamStatusChange?: (status: StreamStatus) => void;
  onError?: (error: AppError) => void;
  onAuthExpired?: () => void;
  onSceneSwitch?: (sceneName: string) => void;
  onSourceMissing?: (sceneName: string, sourceName: string) => void;
  onDiskWarning?: () => void;
  onReconnecting?: (attempt: number, maxAttempts: number) => void;
  autoReconnect?: boolean;
  healthCheckInterval?: number;
}

export function useObsErrorHandling(options: UseObsErrorHandlingOptions = {}) {
  const {
    onStreamStatusChange,
    onError,
    onAuthExpired,
    onSceneSwitch,
    onSourceMissing,
    onDiskWarning,
    onReconnecting,
    autoReconnect = true,
    healthCheckInterval = 30000,
  } = options;

  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    status: 'idle',
    isLive: false,
    viewerCount: 0,
    uptime: 0,
    bitrate: 0,
    droppedFrames: 0,
  });

  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    isRecording: false,
    duration: 0,
    diskUsagePercent: 0,
    diskFull: false,
  });

  const [error, setError] = useState<AppError | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [sceneSwitchError, setSceneSwitchError] = useState<AppError | null>(null);

  const obsClient = getObsClientEnhanced();
  const healthCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectListenerRef = useRef<(() => void) | null>(null);

  /**
   * Connect to OBS with error handling
   */
  const connect = useCallback(async () => {
    try {
      setStreamStatus((prev) => ({ ...prev, status: 'connecting' }));
      setError(null);

      await obsClient.connect();

      setIsConnected(true);
      setConnectionAttempts(0);
      setStreamStatus((prev) => ({ ...prev, status: 'idle' }));

      // Start health checks
      startHealthCheck();

      // Setup event listeners
      setupEventListeners();
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new ObsError(
            'Failed to connect to OBS',
            ErrorType.CONNECTION_ERROR,
            { code: 'CONNECT_FAILED' }
          );

      setError(appError);
      setIsConnected(false);
      onError?.(appError);
      ErrorLogger.log(appError);

      // Auto-reconnect if enabled
      if (autoReconnect && (appError as ObsError).canReconnect?.()) {
        const nextAttempt = connectionAttempts + 1;
        setConnectionAttempts(nextAttempt);
        onReconnecting?.(nextAttempt, (appError as ObsError).maxConnectionAttempts || 5);
      }
    }
  }, [obsClient, autoReconnect, connectionAttempts, onError, onReconnecting]);

  /**
   * Setup event listeners on OBS client
   */
  const setupEventListeners = useCallback(() => {
    // Listen for auth expiration
    obsClient.on('auth-expired', (error: AppError) => {
      setError(error);
      onAuthExpired?.();
      ErrorLogger.log(error);
    });

    // Listen for scene switch errors
    obsClient.on('scene-switch-error', (error: AppError) => {
      setSceneSwitchError(error);
      ErrorLogger.log(error);
    });

    // Listen for missing sources
    obsClient.on('source-missing', (data: any) => {
      const error = new ObsError(
        `Source '${data.sourceName}' is missing in scene '${data.sceneName}'`,
        ErrorType.SOURCE_MISSING,
        {
          code: 'SOURCE_MISSING',
          context: data,
        }
      );
      onSourceMissing?.(data.sceneName, data.sourceName);
      ErrorLogger.log(error);
    });

    // Listen for disk warnings
    obsClient.on('disk-warning', (error: AppError) => {
      setRecordingStatus((prev) => ({
        ...prev,
        diskFull: true,
        diskUsagePercent: 95,
      }));
      onDiskWarning?.();
      ErrorLogger.log(error);
    });

    // Listen for reconnection events
    obsClient.on('reconnecting', (data: any) => {
      setStreamStatus((prev) => ({ ...prev, status: 'reconnecting' }));
      onReconnecting?.(data.attempt, data.maxAttempts);
    });

    // Listen for connection errors
    obsClient.on('error', (error: AppError) => {
      setError(error);
      setIsConnected(false);
      onError?.(error);
      ErrorLogger.log(error);
    });
  }, [obsClient, onAuthExpired, onSourceMissing, onDiskWarning, onReconnecting, onError]);

  /**
   * Start streaming with error recovery
   */
  const startStreaming = useCallback(
    async (settings?: {
      service?: string;
      serviceUrl?: string;
      streamKey?: string;
    }) => {
      try {
        if (!isConnected) {
          throw new ObsError(
            'Not connected to OBS. Please connect first.',
            ErrorType.CONNECTION_ERROR,
            { code: 'NOT_CONNECTED' }
          );
        }

        setStreamStatus((prev) => ({ ...prev, status: 'connecting' }));
        setError(null);

        await obsClient.startStreaming(settings);

        setStreamStatus((prev) => ({
          ...prev,
          status: 'live',
          isLive: true,
          uptime: 0,
        }));
        onStreamStatusChange?.({
          ...streamStatus,
          status: 'live',
          isLive: true,
        });

        // Start uptime counter
        startHealthCheck();
      } catch (err) {
        const appError = err instanceof AppError
          ? err
          : new ObsError(
              'Failed to start streaming',
              ErrorType.STREAM_DISCONNECTED,
              { code: 'START_STREAM_FAILED' }
            );

        setStreamStatus((prev) => ({ ...prev, status: 'error', isLive: false }));
        setError(appError);
        onError?.(appError);
        ErrorLogger.log(appError);

        // Check for auth expiration
        if (appError.type === ErrorType.AUTH_EXPIRED) {
          onAuthExpired?.();
        }
      }
    },
    [isConnected, obsClient, streamStatus, onStreamStatusChange, onError, onAuthExpired]
  );

  /**
   * Stop streaming with error handling
   */
  const stopStreaming = useCallback(async () => {
    try {
      if (!isConnected) {
        throw new ObsError(
          'Not connected to OBS',
          ErrorType.CONNECTION_ERROR,
          { code: 'NOT_CONNECTED' }
        );
      }

      setStreamStatus((prev) => ({ ...prev, status: 'stopping' }));

      await obsClient.stopStreaming();

      setStreamStatus((prev) => ({
        ...prev,
        status: 'idle',
        isLive: false,
        uptime: 0,
      }));
      onStreamStatusChange?.(streamStatus);
      setError(null);
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new ObsError(
            'Failed to stop streaming',
            ErrorType.API_ERROR,
            { code: 'STOP_STREAM_FAILED' }
          );

      setStreamStatus((prev) => ({ ...prev, status: 'error' }));
      setError(appError);
      onError?.(appError);
      ErrorLogger.log(appError);
    }
  }, [isConnected, obsClient, streamStatus, onStreamStatusChange, onError]);

  /**
   * Switch scene with fallback recovery
   */
  const switchScene = useCallback(
    async (sceneName: string) => {
      try {
        setSceneSwitchError(null);
        await obsClient.setScene(sceneName);
        setSceneSwitchError(null);
        onSceneSwitch?.(sceneName);
      } catch (err) {
        const appError = err instanceof AppError
          ? err
          : new ObsError(
              'Failed to switch scene',
              ErrorType.SCENE_SWITCH_FAILED,
              { code: 'SCENE_SWITCH_FAILED' }
            );

        setSceneSwitchError(appError);
        setError(appError);
        onError?.(appError);
        ErrorLogger.log(appError);

        // Show recovery options
        if (
          appError.recoveryActions.includes(RecoveryAction.FALLBACK)
        ) {
          // UI should offer option to revert
        }
      }
    },
    [obsClient, onSceneSwitch, onError]
  );

  /**
   * Start recording with disk monitoring
   */
  const startRecording = useCallback(async () => {
    try {
      if (!isConnected) {
        throw new ObsError(
          'Not connected to OBS',
          ErrorType.CONNECTION_ERROR,
          { code: 'NOT_CONNECTED' }
        );
      }

      setRecordingStatus((prev) => ({
        ...prev,
        isRecording: true,
        diskFull: false,
      }));
      setError(null);

      // Monitor disk space
      const diskCheckInterval = setInterval(async () => {
        try {
          const stats = await obsClient.getStats();
          const diskPercent = (stats.bytesTransferred / (500 * 1024 * 1024)) * 100;

          setRecordingStatus((prev) => ({
            ...prev,
            diskUsagePercent: Math.min(diskPercent, 100),
            diskFull: diskPercent > 95,
          }));

          // Stop recording if disk is full
          if (diskPercent > 95) {
            clearInterval(diskCheckInterval);
            await stopRecording();

            const diskError = new ObsError(
              'Recording stopped: disk is full',
              ErrorType.DISK_FULL,
              {
                code: 'DISK_FULL',
                context: { diskPercent },
                recoveryActions: [RecoveryAction.STOP_RECORDING],
              }
            );
            setError(diskError);
            onError?.(diskError);
            ErrorLogger.log(diskError);
          }
        } catch (err) {
          clearInterval(diskCheckInterval);
        }
      }, 5000); // Check every 5 seconds
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new ObsError(
            'Failed to start recording',
            ErrorType.RECORDING_FAILED,
            { code: 'START_RECORDING_FAILED' }
          );

      setRecordingStatus((prev) => ({ ...prev, isRecording: false }));
      setError(appError);
      onError?.(appError);
      ErrorLogger.log(appError);
    }
  }, [isConnected, obsClient, onError]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async () => {
    try {
      if (!isConnected) {
        throw new ObsError(
          'Not connected to OBS',
          ErrorType.CONNECTION_ERROR,
          { code: 'NOT_CONNECTED' }
        );
      }

      setRecordingStatus((prev) => ({
        ...prev,
        isRecording: false,
      }));
      setError(null);
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new ObsError(
            'Failed to stop recording',
            ErrorType.RECORDING_FAILED,
            { code: 'STOP_RECORDING_FAILED' }
          );

      setError(appError);
      onError?.(appError);
      ErrorLogger.log(appError);
    }
  }, [isConnected, obsClient, onError]);

  /**
   * Start health checks and status updates
   */
  const startHealthCheck = useCallback(() => {
    if (healthCheckTimerRef.current) {
      clearInterval(healthCheckTimerRef.current);
    }

    healthCheckTimerRef.current = setInterval(async () => {
      if (!isConnected) return;

      try {
        const stats = await obsClient.getStats();

        if (streamStatus.isLive) {
          setStreamStatus((prev) => ({
            ...prev,
            uptime: (prev.uptime || 0) + (healthCheckInterval / 1000),
            bitrate: stats.bytesTransferred || 0,
            droppedFrames: stats.droppedFrames || 0,
          }));
        }
      } catch (err) {
        if (err instanceof ObsError && err.type === ErrorType.CONNECTION_ERROR) {
          // Connection lost, trigger reconnect
          if (autoReconnect && obsClient.isConnected()) {
            setStreamStatus((prev) => ({ ...prev, status: 'reconnecting' }));
          }
        }
      }
    }, healthCheckInterval);
  }, [isConnected, obsClient, streamStatus.isLive, healthCheckInterval, autoReconnect]);

  /**
   * Disconnect and cleanup
   */
  const disconnect = useCallback(() => {
    if (healthCheckTimerRef.current) {
      clearInterval(healthCheckTimerRef.current);
    }
    if (reconnectListenerRef.current) {
      reconnectListenerRef.current();
    }
    obsClient.disconnect();
    setIsConnected(false);
    setStreamStatus((prev) => ({ ...prev, status: 'idle', isLive: false }));
  }, [obsClient]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (healthCheckTimerRef.current) {
        clearInterval(healthCheckTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    streamStatus,
    recordingStatus,
    error,
    isConnected,
    connectionAttempts,
    sceneSwitchError,

    // Actions
    connect,
    disconnect,
    startStreaming,
    stopStreaming,
    switchScene,
    startRecording,
    stopRecording,

    // Utilities
    clearError: () => setError(null),
    getErrorMessage: () => error?.getUserMessage() || null,
    getRecoveryActions: () => error?.recoveryActions || [],
  };
}
