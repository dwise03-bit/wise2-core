# Error Handling & Crash Recovery System - SoundLabs Studio

## Overview

SoundLabs Studio now includes comprehensive error handling and crash recovery to prevent silent failures and provide users with meaningful feedback when something goes wrong.

## Architecture

### Key Components

#### 1. **Error Handler Hook** (`hooks/useErrorHandler.ts`)
Central error management hook that:
- Manages error state and error stack
- Provides error, warning, and success message types
- Supports auto-dismiss with configurable timeouts
- Allows retry functionality for failed operations
- Wraps async and sync operations with error handling

```typescript
const { addError, addWarning, addSuccess, removeError, wrapAsync } = useErrorHandler();

// Add an error
addError('recording-failed', 'Microphone not available');

// Add a warning
addWarning('Low Battery', 'Your device battery is low');

// Add a success message
addSuccess('Recording Saved', 'Audio exported successfully');

// Wrap async operations
const result = await wrapAsync(
  () => recorder.startRecording(),
  'recording-failed'
);
```

#### 2. **Error Boundary** (`components/ErrorBoundary.tsx`)
React Error Boundary component that:
- Catches JavaScript errors in component tree
- Prevents "white screen of death"
- Shows user-friendly error UI
- Displays error details in development mode
- Provides recovery actions (Try Again, Refresh, Go Home)

#### 3. **Error Toast** (`components/ErrorToast.tsx`)
Toast notification component that:
- Displays errors, warnings, and success messages
- Shows at bottom-right of screen
- Auto-dismisses after configurable timeout
- Supports manual close button
- Includes retry button for errors with retry functions
- Styled by message type (error=red, warning=orange, success=green)

#### 4. **Error Context** (`contexts/ErrorContext.tsx`)
Provider that makes error handler available app-wide:
- Wraps entire app with ErrorProvider
- Exposes `useError()` hook for any component
- No prop drilling needed

## Usage

### In Components

#### Using the Error Hook Directly
```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { addError, addSuccess } = useErrorHandler();

  const handleUpload = async () => {
    try {
      const data = await uploadFile();
      addSuccess('Upload Complete', 'File uploaded successfully');
    } catch (error) {
      addError('file-upload-failed', error.message);
    }
  };

  return <button onClick={handleUpload}>Upload</button>;
}
```

#### Using the Error Context
```typescript
import { useError } from '../contexts/ErrorContext';

function MyComponent() {
  const error = useError();

  const handleClick = () => {
    error.addWarning('Warning', 'This action cannot be undone');
  };

  return <button onClick={handleClick}>Dangerous Action</button>;
}
```

### In the Audio Engine Hook

The `useAudioEngine` hook now includes comprehensive error handling for all operations:

```typescript
const { startRecording, stopRecording, play, addTrack } = useAudioEngine();

// Recording errors are automatically handled and displayed
await startRecording(); // Shows "Recording Started" on success
                         // Shows "Microphone Access Denied" on permission error
                         // Shows "Recording Failed" on other errors

// Playback errors are automatically handled
play(); // Shows "Playback Failed" if audio engine is not ready

// Track management errors are automatically handled
const track = addTrack({ name: 'Vocals' }); // Shows "Track Added" on success
                                             // Shows "Failed to Add Track" on error
```

## Error Types & Messages

### Predefined Error Codes

#### Audio Context Errors
- `audio-context-not-supported`: Browser doesn't support Web Audio API
- `audio-context-initialization-failed`: Failed to initialize audio context

#### Recording Errors
- `recording-permission-denied`: Microphone access denied by user
- `recording-already-active`: Another recording is already in progress
- `recording-failed`: General recording failure
- `recording-stopped-unexpectedly`: Recording was interrupted

#### Playback Errors
- `playback-failed`: Playback encountered an error
- `playback-not-initialized`: Playback engine not ready

#### Track Errors
- `track-add-failed`: Could not create new track
- `track-remove-failed`: Could not delete track
- `track-not-found`: Track ID not found

#### File Errors
- `file-too-large`: File exceeds 500MB limit
- `file-invalid-format`: Unsupported file format

#### General Errors
- `unknown-error`: Catch-all for unexpected errors

### Adding Custom Error Messages

```typescript
const { addError } = useErrorHandler();

// Use predefined error code
addError('recording-failed');

// Use predefined error code with custom message
addError('recording-failed', 'Microphone is not connected');

// Use predefined error code with retry function
addError('recording-failed', undefined, {
  retryFn: async () => await recorder.startRecording(),
});
```

## Features

### 1. Auto-Dismissing Errors
Errors automatically disappear after a timeout (default 5 seconds):

```typescript
addError('recording-failed'); // Auto-dismisses in 5 seconds

// Custom timeout (in milliseconds)
addError('recording-failed', undefined, { timeout: 3000 });

// Never auto-dismiss
addError('recording-failed', undefined, { timeout: 0 });
```

### 2. Error Retry
Errors can include a retry button if a retry function is provided:

```typescript
addError('recording-failed', 'Microphone not available', {
  retryFn: async () => await recorder.startRecording(),
});
// User sees "Retry" button that calls the retry function
```

### 3. Error Wrapping
Automatically wrap async operations with error handling:

```typescript
const { wrapAsync } = useErrorHandler();

// If operation fails, error is added automatically
const data = await wrapAsync(
  () => fetchData(),
  'data-fetch-failed'
);
```

### 4. Error Stack
Multiple errors can be displayed simultaneously:

```typescript
const { errors } = useErrorHandler();

console.log(errors.length); // Number of active errors
errors.forEach(error => {
  console.log(error.title, error.message);
});
```

## Audio Engine Integration

The `useAudioEngine` hook now includes error handling for:

### Recording Operations
- **startRecording()**: Checks microphone permission, validates recorder state
- **stopRecording()**: Validates audio buffer, checks file size, validates export

### Playback Operations
- **play()**: Checks audio context state, validates playback engine
- **pause()**: Validates playback engine
- **stop()**: Validates playback engine, resets position
- **seek(time)**: Validates time value, validates playback engine

### Mixer Operations
- **setMasterVolume(volume)**: Validates volume range (0-1)
- **setBPM(bpm)**: Validates BPM range (20-300)

### Track Management
- **addTrack(config)**: Validates mixer initialization, creates track with error handling
- **removeTrack(trackId)**: Validates track exists, handles removal with error handling

## Error Recovery

### Automatic Recovery
The system automatically recovers from:
- Audio context initialization failures
- Temporary microphone access issues
- Missing audio data
- Export failures

### User-Initiated Recovery
Users can recover from errors by:
1. Clicking "Try Again" button (if retry function available)
2. Clicking "Refresh Page" to reload
3. Clicking "Go Home" to navigate to home
4. Dismissing the error and trying again

## Development

### Viewing Error Details
In development mode, the Error Boundary shows:
- Error message
- Error stack trace
- Component stack where error occurred

### Debugging with Console
All errors are logged to the browser console with:
- Error code
- Error message
- Timestamp
- Full error object

```typescript
// Example console output
[recording-failed] Microphone access was denied. Check your browser settings.
{code: 'recording-failed', message: 'Microphone access was denied...', timestamp: 1234567890}
```

## Best Practices

### 1. Always Handle User-Facing Operations
```typescript
// Good
try {
  await recorder.startRecording();
  addSuccess('Recording Started', 'Audio recording is active');
} catch (error) {
  addError('recording-failed', error.message);
}

// Better - Use error handler wrap
const result = await wrapAsync(
  () => recorder.startRecording(),
  'recording-failed'
);
```

### 2. Use Specific Error Codes
```typescript
// Generic
addError('unknown-error', 'Something went wrong');

// Specific
if (error.code === 'NotAllowedError') {
  addError('recording-permission-denied');
}
```

### 3. Provide Meaningful Messages
```typescript
// Generic message
addError('recording-failed');

// Specific message
addError('recording-failed', `Microphone error: ${error.message}`);
```

### 4. Allow User Recovery
```typescript
// Provide retry option
addError('recording-failed', undefined, {
  retryFn: () => startRecording(),
});

// Or allow timeout for auto-dismiss
addWarning('Network Slow', 'Uploading may take longer', {
  timeout: 5000,
});
```

### 5. Use Success Messages
```typescript
// Provide positive feedback
addSuccess('Recording Saved', 'Audio exported successfully (2.5MB)');
```

## Testing Error Handling

### Simulating Errors
To test error handling in development:

```typescript
// Simulate recording error
const { addError } = useErrorHandler();
addError('recording-failed', 'Test error message');

// Simulate audio context error
addError('audio-context-initialization-failed');

// Simulate playback error
addError('playback-failed');
```

### Browser DevTools
Check the Console tab (F12) for:
- All logged errors with error codes
- Error stack traces
- Timing information

## Accessibility

Error messages are:
- Displayed with clear visual indicators
- Color-coded (red for errors, orange for warnings, green for success)
- Include text labels, not just colors
- Dismissible with keyboard shortcuts
- Announced to screen readers

## Performance

Error handling has minimal performance impact:
- Error context provider is lightweight
- Toast animations use CSS transitions
- Error log doesn't grow unbounded (errors auto-dismiss by default)
- No external error tracking by default (can be added)

## Future Enhancements

Potential improvements:
- Error analytics/tracking (Sentry, Rollbar)
- Error log export for debugging
- Error recovery strategies (auto-retry with exponential backoff)
- Offline error queue for connectivity issues
- Error categorization and filtering
- A/B testing error message effectiveness

## Support

For issues with error handling:
1. Check browser console (F12) for error details
2. Check Error Boundary fallback UI for component crashes
3. Review error code in error message
4. Refer to error definitions in `useErrorHandler.ts`
