# Error Handling & Recovery System

Comprehensive error handling and recovery strategies for SUNO music generation and OBS streaming integrations.

## Overview

The error handling system provides:

- **Detailed Error Classification** - Granular error types with severity levels
- **Automatic Recovery** - Exponential backoff, retries, and fallback strategies
- **User-Friendly Messages** - Clear error messages for UI display
- **Offline Support** - Queue management for when network is unavailable
- **Error Logging** - Centralized logging with debugging capabilities
- **Error Boundaries** - React component error handling with recovery UI

## Architecture

### Error Types

```typescript
enum ErrorType {
  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // API errors
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',

  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  DISK_FULL = 'DISK_FULL',

  // Streaming errors
  STREAM_DISCONNECTED = 'STREAM_DISCONNECTED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  SCENE_SWITCH_FAILED = 'SCENE_SWITCH_FAILED',
  SOURCE_MISSING = 'SOURCE_MISSING',
  RECORDING_FAILED = 'RECORDING_FAILED',

  // Generation errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
}
```

### Error Severity Levels

- **INFO** - Informational message
- **WARNING** - Warning that may impact user (e.g., slow connection)
- **ERROR** - Error that prevents operation (e.g., failed generation)
- **CRITICAL** - Critical error requiring immediate intervention (e.g., auth failure)

### Recovery Actions

```typescript
enum RecoveryAction {
  RETRY = 'RETRY',                           // Retry the operation
  QUEUE = 'QUEUE',                           // Queue for later execution
  FALLBACK = 'FALLBACK',                     // Use fallback option
  REAUTHORIZE = 'REAUTHORIZE',               // Re-authorize with service
  RECONNECT = 'RECONNECT',                   // Attempt to reconnect
  FALLBACK_PLAYBACK = 'FALLBACK_PLAYBACK',   // Play from URL instead of file
  STOP_RECORDING = 'STOP_RECORDING',         // Stop recording safely
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION' // User action required
}
```

## SUNO Error Handling

### Features

1. **Offline Queue Management**
   - Automatically queue generation requests when offline
   - Process queue when connection restored
   - Persist queue across sessions

2. **Retry Logic**
   - Exponential backoff with jitter
   - Configurable max retry attempts
   - Automatic retry for transient errors

3. **Fallback Playback**
   - Use URL-based playback if storage fails
   - Graceful degradation when export fails

4. **Network Resilience**
   - Detect offline status
   - Queue requests instead of failing immediately
   - Resume on reconnect

### Usage Example

```typescript
import { useSunoErrorHandling } from '@/hooks/useSunoErrorHandling';

function MusicGeneratorComponent() {
  const {
    generations,
    error,
    isOnline,
    canRetry,
    generate,
    retryGeneration,
    clearError,
    getErrorMessage,
  } = useSunoErrorHandling({
    onGenerationError: (error) => {
      console.error('Generation error:', error.getMessage());
    },
    onOfflineQueueUpdate: (items) => {
      console.log('Queued generations:', items);
    },
  });

  const handleGenerate = async () => {
    try {
      await generate({
        prompt: 'Upbeat electronic dance music',
        genre: 'EDM',
        mood: 'energetic',
        duration: 180,
      });
    } catch (err) {
      // Error is automatically handled and shown to user
      console.error('Generation failed');
    }
  };

  return (
    <div>
      {error && (
        <div className="error-banner">
          <p>{getErrorMessage()}</p>
          {canRetry && (
            <button onClick={() => retryGeneration(generations[0]?.id)}>
              Retry
            </button>
          )}
          {!isOnline && (
            <p>You're offline. Request will be queued.</p>
          )}
        </div>
      )}
      <button onClick={handleGenerate}>Generate Music</button>
    </div>
  );
}
```

## OBS Error Handling

### Features

1. **Auto-Reconnection**
   - Automatic reconnect on disconnection
   - Exponential backoff between attempts
   - Maximum attempt limit

2. **Auth Expiration Detection**
   - Detects platform auth expiration
   - Triggers re-authorization flow
   - Prevents stream failures

3. **Scene Switch Failure Recovery**
   - Automatically reverts to previous scene if switch fails
   - Prevents stream interruption
   - User-friendly error messages

4. **Source Missing Detection**
   - Detects missing sources
   - Shows warning to user
   - Prevents crashes

5. **Recording Disk Monitoring**
   - Continuous disk space monitoring
   - Automatic stop when disk full
   - Prevents data loss

### Usage Example

```typescript
import { useObsErrorHandling } from '@/hooks/useObsErrorHandling';

function StreamingComponent() {
  const {
    streamStatus,
    recordingStatus,
    error,
    isConnected,
    connect,
    startStreaming,
    stopStreaming,
    switchScene,
    startRecording,
    getErrorMessage,
  } = useObsErrorHandling({
    onError: (error) => {
      console.error('Stream error:', error.getMessage());
    },
    onAuthExpired: () => {
      // Redirect to auth screen
      window.location.href = '/auth/reauthorize';
    },
    onDiskWarning: () => {
      // Show disk warning
      console.warn('Recording disk is almost full');
    },
    onReconnecting: (attempt, maxAttempts) => {
      console.log(`Reconnecting... attempt ${attempt}/${maxAttempts}`);
    },
  });

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Connection failed');
    }
  };

  return (
    <div>
      <div className="stream-status">
        <p>Status: {streamStatus.status}</p>
        {streamStatus.isLive && (
          <p>Viewers: {streamStatus.viewerCount}</p>
        )}
        {recordingStatus.diskUsagePercent > 90 && (
          <div className="disk-warning">
            ⚠️ Disk usage: {recordingStatus.diskUsagePercent.toFixed(0)}%
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <p>{getErrorMessage()}</p>
        </div>
      )}

      <button onClick={handleConnect} disabled={isConnected}>
        Connect to OBS
      </button>

      <button 
        onClick={() => startStreaming()}
        disabled={!isConnected || streamStatus.isLive}
      >
        Start Stream
      </button>

      <button 
        onClick={() => stopStreaming()}
        disabled={!streamStatus.isLive}
      >
        Stop Stream
      </button>
    </div>
  );
}
```

## Error Boundary Component

### Basic Usage

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Component error:', error);
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Custom Fallback

```typescript
<ErrorBoundary
  fallback={(error, retry) => (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.getUserMessage()}</p>
      <button onClick={retry}>Try again</button>
    </div>
  )}
>
  <YourComponent />
</ErrorBoundary>
```

### Higher-Order Component

```typescript
import { withErrorBoundary } from '@/components/ErrorBoundary';

const ProtectedComponent = withErrorBoundary(YourComponent, {
  onError: (error) => {
    console.error('Error:', error);
  },
});
```

## Error Logging

### View Logs

```typescript
import { ErrorLogger } from '@/lib/error-handling';

// Get all logs
const allLogs = ErrorLogger.getLogs();

// Get logs by type
const networkErrors = ErrorLogger.getErrorsByType(ErrorType.NETWORK_OFFLINE);

// Get logs by severity
const criticalErrors = ErrorLogger.getErrorsBySeverity(ErrorSeverity.CRITICAL);

// Export logs as JSON
const json = ErrorLogger.export();
```

### Custom Error Handler

```typescript
import { AppError, ErrorLogger } from '@/lib/error-handling';

try {
  // Some operation
} catch (error) {
  const appError = new AppError(
    'Custom error message',
    ErrorType.API_ERROR,
    ErrorSeverity.WARNING,
    {
      code: 'CUSTOM_ERROR',
      context: { customData: 'value' },
      recoveryActions: [RecoveryAction.RETRY],
    }
  );
  
  ErrorLogger.log(appError);
  throw appError;
}
```

## Retry Configuration

### Default Configuration

```typescript
const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};
```

### Custom Configuration

```typescript
const sunoClient = initSunoClientEnhanced({
  apiKey: process.env.SUNO_API_KEY,
  timeout: 60000,
  retryConfig: {
    maxAttempts: 5,
    initialDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  },
});
```

## Best Practices

### 1. Always Use Error Boundaries
Wrap top-level components and feature sections with ErrorBoundary.

### 2. Handle Specific Errors
```typescript
try {
  await operation();
} catch (error) {
  if (error instanceof SunoError && error.type === ErrorType.RATE_LIMIT) {
    // Handle rate limiting
  } else if (error instanceof SunoError && error.type === ErrorType.NETWORK_OFFLINE) {
    // Handled automatically via queue
  } else {
    // Handle other errors
  }
}
```

### 3. Provide User Feedback
```typescript
{error && (
  <div className="error-message">
    <p>{error.getUserMessage()}</p>
    {error.recoveryActions.includes(RecoveryAction.RETRY) && (
      <button onClick={retry}>Retry</button>
    )}
  </div>
)}
```

### 4. Monitor Offline State
```typescript
const { isOnline, offlineQueue } = useSunoErrorHandling();

if (!isOnline) {
  return <div>You're offline. Requests will be queued.</div>;
}
```

### 5. Check Recovery Options
```typescript
const { error, getRecoveryActions } = useSunoErrorHandling();

const actions = getRecoveryActions();
actions.forEach(action => {
  switch (action) {
    case RecoveryAction.RETRY:
      // Show retry button
      break;
    case RecoveryAction.REAUTHORIZE:
      // Show auth button
      break;
    // ...
  }
});
```

## Troubleshooting

### Generation Stuck in Queue

- Check network connection
- Verify API key is correct
- Check offline queue status: `sunoClient.getOfflineQueue()`

### Stream Keeps Disconnecting

- Check OBS connection settings
- Verify internet connection stability
- Enable auto-reconnect in component options

### Disk Full Errors

- Stop recording to free space
- Archive old recordings
- Increase disk space if needed

### Auth Expired Errors

- Re-authorize with streaming platform
- Check platform credentials
- Refresh auth tokens

## Performance Tips

1. **Batch Operations** - Group multiple requests to reduce API calls
2. **Cache Results** - Store generation results locally
3. **Optimize Polling** - Adjust polling intervals based on user behavior
4. **Monitor Resources** - Track disk space and network bandwidth

## Security Considerations

1. **Never Log Credentials** - API keys and passwords are never logged
2. **Sanitize Error Messages** - Don't expose internal system details
3. **Rate Limiting** - Implement rate limiting to prevent abuse
4. **Auth Validation** - Always validate authentication before operations

## Future Enhancements

- [ ] Error analytics dashboard
- [ ] Custom error reporting service integration
- [ ] Machine learning-based error prediction
- [ ] Advanced retry strategies
- [ ] Real-time error monitoring
