# Streaming Control System - Usage Examples

Quick integration examples for the WISE² Live Studio streaming control system.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [Component-Level Control](#component-level-control)
3. [Custom Hook Usage](#custom-hook-usage)
4. [Platform Configuration](#platform-configuration)
5. [Advanced Scenarios](#advanced-scenarios)

---

## Basic Integration

### Simplest Setup - Plug & Play

```tsx
import LiveStudio from '@/components/LiveStudio';

export default function StreamPage() {
  return (
    <div className="container mx-auto p-6">
      <LiveStudio />
    </div>
  );
}
```

That's it! The entire streaming control system is ready to use.

---

## Component-Level Control

### Using Individual Components

```tsx
import {
  StreamingControl,
  StreamStatsComponent,
  StreamTransport,
  PlatformSettings,
} from '@/components/LiveStudio';
import { useStreamingState } from '@/components/LiveStudio';

export default function CustomStreamPage() {
  const { state, startStream, stopStream, pauseStream, resumeStream } =
    useStreamingState();

  const [showSettings, setShowSettings] = useState(false);

  const isLive = state.status === 'live' || state.status === 'paused';

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <StreamingControl
        isLive={state.status === 'live'}
        isPaused={state.isPaused}
        lastError={state.lastError}
        onStreamStart={() => startStream().catch(console.error)}
        onStreamStop={stopStream}
      />

      {/* Settings Modal */}
      <PlatformSettings
        platform={state.settings.platform}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(credentials) => {
          // Handle credentials save
          setShowSettings(false);
        }}
        currentCredentials={state.credentials}
      />

      {/* Live Stats */}
      {isLive && (
        <StreamStatsComponent stats={state.stats} isLive={true} />
      )}

      {/* Transport Controls */}
      {isLive && (
        <StreamTransport
          isLive={true}
          isPaused={state.isPaused}
          onPause={() => pauseStream()}
          onResume={() => resumeStream()}
          onMute={() => {}}
          onUnmute={() => {}}
          onScreenshot={() => {}}
          onDisconnect={stopStream}
        />
      )}
    </div>
  );
}
```

---

## Custom Hook Usage

### Managing Stream State Independently

```tsx
import { useStreamingState } from '@/components/LiveStudio';

export default function StreamManager() {
  const {
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
  } = useStreamingState();

  // Change platform
  const handlePlatformChange = (platform) => {
    updateSettings({ platform });
  };

  // Update resolution
  const handleResolutionChange = (resolution) => {
    updateSettings({ resolution });
  };

  // Start streaming with validation
  const handleStreamStart = async () => {
    try {
      if (!state.credentials?.streamKey) {
        console.error('Stream key required');
        return;
      }

      await startStream();
      console.log('Stream started');
    } catch (error) {
      console.error('Stream start failed:', error);
    }
  };

  // Test stream before going live
  const handleTestStream = async () => {
    try {
      const result = await testStream();
      console.log('Test result:', result);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStreamStart}>Start Stream</button>
      <button onClick={stopStream}>Stop Stream</button>
      <button onClick={handleTestStream}>Test Stream</button>
      <button onClick={() => pauseStream()}>Pause</button>
      <button onClick={() => resumeStream()}>Resume</button>
      <button onClick={() => resetStreamKey()}>Reset Key</button>
      <button onClick={() => captureScreenshot()}>Screenshot</button>

      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

---

## Platform Configuration

### Pre-Configure for Specific Platform

```tsx
import { useStreamingState } from '@/components/LiveStudio';
import { PLATFORM_CONFIGS, RESOLUTION_PRESETS } from '@/components/LiveStudio';

export default function TwitchStream() {
  const { state, updateSettings, updateCredentials } = useStreamingState();

  // Initialize Twitch-specific settings
  useEffect(() => {
    updateSettings({
      platform: 'twitch',
      resolution: RESOLUTION_PRESETS['720p'],
      fps: 60,
      bitrate: {
        mode: 'auto',
        min: 2500,
        max: 6000,
        current: 4500,
      },
    });
  }, []);

  return (
    <div>
      <h1>Twitch Stream Setup</h1>
      <p>
        Recommended bitrate:{' '}
        {PLATFORM_CONFIGS.twitch.recommendedBitrate.min} -{' '}
        {PLATFORM_CONFIGS.twitch.recommendedBitrate.max} kbps
      </p>
    </div>
  );
}
```

---

## Advanced Scenarios

### Scenario 1: Multi-Platform Streaming Setup

```tsx
import {
  useStreamingState,
  PLATFORM_CONFIGS,
} from '@/components/LiveStudio';

const PLATFORMS = ['twitch', 'youtube', 'facebook'] as const;

export default function MultiStreamSetup() {
  const [streams, setStreams] = useState({});

  // Initialize streams for each platform
  useEffect(() => {
    const newStreams = {};

    PLATFORMS.forEach((platform) => {
      const config = PLATFORM_CONFIGS[platform];
      newStreams[platform] = {
        name: config.name,
        recommended: config.recommendedBitrate,
        resolutions: config.supportedResolutions,
      };
    });

    setStreams(newStreams);
  }, []);

  return (
    <div>
      <h2>Multi-Platform Configuration</h2>
      {Object.entries(streams).map(([platform, config]) => (
        <div key={platform}>
          <h3>{config.name}</h3>
          <p>Bitrate: {config.recommended.min}-{config.recommended.max} kbps</p>
          <p>Resolutions: {config.resolutions.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}
```

### Scenario 2: Real-Time Stats Monitoring

```tsx
import { useStreamingState } from '@/components/LiveStudio';
import { HEALTH_THRESHOLDS } from '@/components/LiveStudio';

export default function StatsMonitor() {
  const { state } = useStreamingState();
  const [alerts, setAlerts] = useState([]);

  // Check health on stats update
  useEffect(() => {
    const { stats } = state;
    const newAlerts = [];

    // Check dropped frames
    if (stats.droppedFramePercentage > HEALTH_THRESHOLDS.okay.droppedFramePercentage.max) {
      newAlerts.push('High frame drop rate - reduce bitrate');
    }

    // Check CPU usage
    if (stats.cpuUsage > HEALTH_THRESHOLDS.okay.cpuUsage.max) {
      newAlerts.push('High CPU usage - reduce scene complexity');
    }

    // Check network latency
    if (stats.networkLatency > HEALTH_THRESHOLDS.okay.networkLatency.max) {
      newAlerts.push('High latency - check connection');
    }

    setAlerts(newAlerts);
  }, [state.stats]);

  return (
    <div>
      {alerts.length > 0 && (
        <div className="bg-red-100 p-4 rounded">
          <h3>Performance Alerts</h3>
          <ul>
            {alerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Scenario 3: Custom Error Handler

```tsx
import { useStreamingState } from '@/components/LiveStudio';
import { ERROR_MESSAGES } from '@/components/LiveStudio';

export default function StreamWithErrorHandling() {
  const { state, startStream } = useStreamingState();
  const [error, setError] = useState(null);

  const handleStart = async () => {
    try {
      setError(null);
      await startStream();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';

      // Map to user-friendly message
      let displayError = errorMessage;
      Object.entries(ERROR_MESSAGES).forEach(([key, message]) => {
        if (errorMessage.includes(key)) {
          displayError = message;
        }
      });

      setError(displayError);
      // Log to error tracking service
      console.error('Stream error:', {
        timestamp: new Date().toISOString(),
        error: displayError,
        state,
      });
    }
  };

  return (
    <div>
      <button onClick={handleStart}>Start Stream</button>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

### Scenario 4: Settings Persistence

```tsx
import { useStreamingState } from '@/components/LiveStudio';

export default function PersistentStreamSettings() {
  const { state, updateSettings, updateCredentials } = useStreamingState();

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('streamSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      updateSettings(settings);
    }

    const savedCreds = localStorage.getItem('streamCredentials');
    if (savedCreds) {
      const credentials = JSON.parse(savedCreds);
      updateCredentials(credentials);
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('streamSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Save credentials (encrypted recommended)
  const handleSaveCredentials = (credentials) => {
    updateCredentials(credentials);
    localStorage.setItem(
      'streamCredentials',
      JSON.stringify({
        platform: credentials.platform,
        streamKey: '***' + credentials.streamKey.slice(-10), // Mask for display
      })
    );
  };

  return <div>Settings auto-saved</div>;
}
```

### Scenario 5: Statistics Export

```tsx
import { useStreamingState } from '@/components/LiveStudio';

export default function StatsExporter() {
  const { state } = useStreamingState();
  const [statsHistory, setStatsHistory] = useState([]);

  // Collect stats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatsHistory((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          ...state.stats,
        },
      ]);
    }, 10000);

    return () => clearInterval(interval);
  }, [state.stats]);

  const downloadStatsCSV = () => {
    const csv = [
      ['Timestamp', 'Viewers', 'Bitrate', 'FPS', 'Dropped Frames', 'CPU', 'GPU'],
      ...statsHistory.map((s) => [
        s.timestamp,
        s.viewerCount,
        s.bitrateCurrent,
        s.frameRateCurrent,
        s.droppedFrames,
        s.cpuUsage,
        s.gpuUsage,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-stats-${Date.now()}.csv`;
    a.click();
  };

  return (
    <button onClick={downloadStatsCSV}>
      Download Stats ({statsHistory.length} entries)
    </button>
  );
}
```

---

## Type Safety Examples

### Using TypeScript with Full Type Support

```tsx
import {
  useStreamingState,
  type StreamSettings,
  type StreamState,
  type StreamStats,
} from '@/components/LiveStudio';

export default function TypedStreamApp() {
  const { state, updateSettings }: {
    state: StreamState;
    updateSettings: (settings: Partial<StreamSettings>) => void;
  } = useStreamingState();

  const handleSettingsUpdate = (updates: Partial<StreamSettings>) => {
    updateSettings(updates); // Fully type-safe
  };

  const stats: StreamStats = state.stats;
  const isHealthy = stats.cpuUsage < 70 && stats.droppedFramePercentage < 2;

  return <div>Health Status: {isHealthy ? 'Good' : 'Poor'}</div>;
}
```

---

## Integration with Existing Components

### Adding to Your Dashboard

```tsx
// pages/dashboard.tsx
import LiveStudio from '@/components/LiveStudio';
import DashboardLayout from '@/components/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveStudio />
        </div>
        <aside className="space-y-4">
          {/* Quick links, tips, etc */}
        </aside>
      </div>
    </DashboardLayout>
  );
}
```

---

## Best Practices

1. **Always Test Before Going Live**
   ```tsx
   await testStream(); // Validate settings
   await startStream(); // Then start
   ```

2. **Monitor Health Continuously**
   ```tsx
   if (stats.health === 'poor') {
     notifyUser('Stream quality degraded');
   }
   ```

3. **Graceful Error Handling**
   ```tsx
   try {
     await startStream();
   } catch (error) {
     setErrorMessage(error.message);
   }
   ```

4. **Save User Settings**
   ```tsx
   // Persists user's preferred resolution, bitrate, etc.
   localStorage.setItem('streamSettings', JSON.stringify(state.settings));
   ```

5. **Handle Disconnections**
   ```tsx
   if (state.stats.reconnectCount > 3) {
     notifyUser('Unstable connection detected');
   }
   ```

---

For more detailed documentation, see [README.md](./README.md)
