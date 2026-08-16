/**
 * Error Handling Integration Examples
 * Complete examples showing how to integrate error handling across components
 */

/**
 * Example 1: SUNO Music Generation with Full Error Handling
 */
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSunoErrorHandling } from '@/hooks/useSunoErrorHandling';
import { RecoveryAction } from '@/lib/error-handling';

export function SunoGeneratorWithErrorHandling() {
  const {
    generations,
    error,
    isOnline,
    offlineQueue,
    canRetry,
    isLoading,
    generate,
    retryGeneration,
    clearError,
    getErrorMessage,
  } = useSunoErrorHandling({
    onGenerationError: (error) => {
      console.error('Generation failed:', error.code);
    },
  });

  const handleGenerate = async () => {
    try {
      await generate({
        prompt: 'Upbeat electronic dance music',
        genre: 'Electronic',
        mood: 'Energetic',
        duration: 180,
      });
    } catch (err) {
      // Error automatically handled
    }
  };

  return (
    <ErrorBoundary>
      <div className="suno-generator">
        {!isOnline && (
          <div className="offline-notice">
            <p>Offline - {offlineQueue.length} queued</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>{getErrorMessage()}</p>
            {canRetry && (
              <button onClick={() => retryGeneration(generations[0]?.id)}>
                Retry
              </button>
            )}
            <button onClick={clearError}>Dismiss</button>
          </div>
        )}

        <button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </ErrorBoundary>
  );
}

/**
 * Example 2: OBS Streaming with Full Error Handling
 */
import { useObsErrorHandling } from '@/hooks/useObsErrorHandling';

export function ObsStreamingWithErrorHandling() {
  const {
    streamStatus,
    recordingStatus,
    error,
    isConnected,
    connect,
    startStreaming,
    stopStreaming,
    getErrorMessage,
  } = useObsErrorHandling({
    onAuthExpired: () => {
      window.location.href = '/auth/reauthorize';
    },
    onDiskWarning: () => {
      alert('Disk almost full!');
    },
  });

  return (
    <ErrorBoundary>
      <div className="obs-streaming">
        <div className="status">
          {isConnected ? '✓ Connected' : '✗ Disconnected'}
          {streamStatus.isLive && ` - LIVE (${streamStatus.viewerCount} viewers)`}
        </div>

        {recordingStatus.diskUsagePercent > 80 && (
          <div className="disk-warning">
            Disk: {recordingStatus.diskUsagePercent.toFixed(0)}%
          </div>
        )}

        {error && (
          <div className="error-banner">{getErrorMessage()}</div>
        )}

        <div className="controls">
          {!isConnected && <button onClick={connect}>Connect</button>}
          {isConnected && !streamStatus.isLive && (
            <button onClick={() => startStreaming()}>Start Stream</button>
          )}
          {streamStatus.isLive && (
            <button onClick={stopStreaming}>Stop Stream</button>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

/**
 * Example 3: Combined Studio with Error Handling
 */
export function CreativeStudio() {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div className="error-fallback">
          <h2>Error Occurred</h2>
          <p>{error.getUserMessage()}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <div className="studio">
        <SunoGeneratorWithErrorHandling />
        <ObsStreamingWithErrorHandling />
      </div>
    </ErrorBoundary>
  );
}
