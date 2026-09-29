# Multistream Usage Examples

Practical examples for using the multistream module in different scenarios.

## Example 1: Basic Multistream Setup

Simple setup with Twitch and YouTube:

```tsx
import React from 'react';
import { MultistreamControl } from '@/lib/obs/multistream';

export function SimpleMultistream() {
  return (
    <div style={{ maxWidth: '600px' }}>
      <h1>Live Stream</h1>
      <MultistreamControl
        enabled={false}
        onStatusChange={(status) => console.log('Status:', status)}
        onError={(error) => console.error('Error:', error)}
      />
    </div>
  );
}
```

## Example 2: With Stream Key Management

Manage stream keys from a database:

```tsx
import React, { useEffect, useState } from 'react';
import { MultistreamControl } from '@/lib/obs/multistream';
import { MultistreamStatus } from '@/lib/obs/multistream/types';

export function ManagedMultistream() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<MultistreamStatus | null>(null);

  useEffect(() => {
    // Load stream keys from API
    fetchStreamKeys();
  }, []);

  const fetchStreamKeys = async () => {
    try {
      const response = await fetch('/api/stream-keys');
      const data = await response.json();
      setKeys(data);
    } catch (error) {
      console.error('Failed to load stream keys:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading stream configuration...</div>;
  }

  return (
    <div className="multistream-manager">
      <h2>Broadcast Control</h2>

      <MultistreamControl
        enabled={true}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          console.log('Broadcast status:', newStatus);
        }}
        onError={(error) => {
          console.error('Broadcast error:', error);
          // Show error notification to user
        }}
      />

      {status && (
        <div className="status-panel">
          <h3>Broadcast Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span>Status:</span>
              <span
                style={{
                  color: status.isActive ? '#10b981' : '#6b7280',
                }}
              >
                {status.isActive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="status-item">
              <span>Platforms:</span>
              <span>{status.activePlatforms}</span>
            </div>
            <div className="status-item">
              <span>Viewers:</span>
              <span>{status.totalViewers}</span>
            </div>
            <div className="status-item">
              <span>Health:</span>
              <span>{status.healthStatus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Example 3: Programmatic Control

Full programmatic control of multistream:

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { MultistreamEngine, MultistreamConfig } from '@/lib/obs/multistream';
import type { MultistreamStatus } from '@/lib/obs/multistream/types';

export function ProgrammaticMultistream() {
  const engineRef = useRef<MultistreamEngine | null>(null);
  const [status, setStatus] = useState<MultistreamStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize engine
    const engine = new MultistreamEngine();

    // Listen for status updates
    engine.on('metrics-update', (event) => {
      setStatus(event.status);
    });

    engine.on('platform-error', (event) => {
      setError(`${event.platform}: ${event.error}`);
    });

    engine.on('failover', (event) => {
      console.log(`Failover on ${event.platform}:`, event.type);
    });

    engineRef.current = engine;

    return () => {
      // Cleanup
      engine.removeAllListeners();
    };
  }, []);

  const handleStartStream = async () => {
    if (!engineRef.current) return;

    try {
      const config: MultistreamConfig = {
        id: `stream-${Date.now()}`,
        name: 'My Broadcast',
        platforms: [
          {
            id: 'twitch',
            platform: 'twitch',
            name: 'Twitch',
            streamKey: process.env.REACT_APP_TWITCH_KEY || '',
            isEnabled: true,
            isConnected: false,
            status: 'idle',
            settings: { autoReconnect: true },
          },
          {
            id: 'youtube',
            platform: 'youtube',
            name: 'YouTube',
            streamKey: process.env.REACT_APP_YOUTUBE_KEY || '',
            isEnabled: true,
            isConnected: false,
            status: 'idle',
            settings: { autoReconnect: true },
          },
        ],
        encodingPreset: 'fast',
        videoBitrate: 4500,
        audioBitrate: 128,
        resolution: '1080p',
        fps: 60,
        enableFailover: true,
        failoverDelay: 5000,
        enableMetrics: true,
        metricsInterval: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await engineRef.current.initialize(config);
      await engineRef.current.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start stream');
    }
  };

  const handleStopStream = async () => {
    if (!engineRef.current) return;

    try {
      const session = await engineRef.current.stop();
      console.log('Session ended:', session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop stream');
    }
  };

  const handleTogglePlatform = async (platform: string) => {
    if (!engineRef.current) return;

    try {
      const isActive = engineRef.current.getActivePlatforms().includes(platform as any);
      await engineRef.current.togglePlatform(platform as any, !isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle platform');
    }
  };

  return (
    <div className="programmatic-control">
      <h2>Programmatic Multistream Control</h2>

      <div className="control-buttons">
        <button onClick={handleStartStream} disabled={status?.isActive}>
          Start Stream
        </button>
        <button onClick={handleStopStream} disabled={!status?.isActive}>
          Stop Stream
        </button>
      </div>

      {status && (
        <div className="stream-info">
          <h3>Stream Information</h3>
          <pre>{JSON.stringify(status, null, 2)}</pre>

          <h4>Platform Controls</h4>
          <div className="platform-toggles">
            {Object.keys(status.platforms).map((platform) => (
              <button
                key={platform}
                onClick={() => handleTogglePlatform(platform)}
              >
                {platform}: {status.platforms[platform]?.status}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <style jsx>{`
        .programmatic-control {
          padding: 2rem;
          background: #1f2937;
          border-radius: 0.5rem;
          color: #f3f4f6;
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        button {
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        button:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        button:hover:not(:disabled) {
          background: #059669;
        }

        .stream-info {
          margin-top: 1.5rem;
        }

        pre {
          background: #111827;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-size: 0.75rem;
        }

        .platform-toggles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .error-message {
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 0.375rem;
          color: #fca5a5;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
```

## Example 4: With Analytics

Track and display multistream analytics:

```tsx
import React, { useEffect, useState } from 'react';
import { MultistreamControl } from '@/lib/obs/multistream';
import { MultistreamStatus, MultistreamSession } from '@/lib/obs/multistream/types';

export function MultistreamWithAnalytics() {
  const [status, setStatus] = useState<MultistreamStatus | null>(null);
  const [session, setSession] = useState<MultistreamSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<MultistreamSession[]>([]);

  const handleStatusChange = (newStatus: MultistreamStatus) => {
    setStatus(newStatus);
  };

  const handleSessionEnd = async (endedSession: MultistreamSession) => {
    setSession(endedSession);
    setSessionHistory((prev) => [...prev, endedSession]);

    // Save to database
    try {
      await fetch('/api/multistream/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endedSession),
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  return (
    <div className="analytics-container">
      <div className="control-section">
        <h2>Broadcast Control</h2>
        <MultistreamControl
          enabled={true}
          onStatusChange={handleStatusChange}
        />
      </div>

      {status && status.isActive && (
        <div className="live-metrics">
          <h3>Live Metrics</h3>
          <div className="metrics-grid">
            <MetricCard label="Viewers" value={status.totalViewers} />
            <MetricCard label="FPS" value={status.fps} />
            <MetricCard label="Bitrate" value={`${Math.round(status.videoBitrate / 1000)}M`} />
            <MetricCard label="CPU" value={`${Math.round(status.cpuUsage)}%`} />
            <MetricCard
              label="Platforms"
              value={status.activePlatforms}
              maxValue={Object.keys(status.platforms).length}
            />
            <MetricCard label="Health" value={status.healthStatus} />
          </div>

          <div className="platform-status">
            <h4>Platform Status</h4>
            {Object.entries(status.platforms).map(([name, platformStatus]) => (
              <div key={name} className="platform-item">
                <span className="platform-name">{name}</span>
                <span className={`status ${platformStatus.status}`}>
                  {platformStatus.status}
                </span>
                {platformStatus.viewerCount !== undefined && (
                  <span className="viewer-count">👁️ {platformStatus.viewerCount}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {session && (
        <div className="session-summary">
          <h3>Session Summary</h3>
          <div className="summary-stats">
            <p>
              <strong>Duration:</strong> {Math.round(session.duration || 0 / 60)}m
            </p>
            <p>
              <strong>Total Viewers:</strong> {session.totalViewers}
            </p>
            <p>
              <strong>Platforms:</strong> {session.platforms.join(', ')}
            </p>
          </div>
        </div>
      )}

      {sessionHistory.length > 0 && (
        <div className="history">
          <h3>Broadcast History</h3>
          <div className="history-list">
            {sessionHistory.map((s) => (
              <div key={s.id} className="history-item">
                <span>{new Date(s.startedAt).toLocaleString()}</span>
                <span>{Math.round(s.duration || 0 / 60)}m</span>
                <span>{s.platforms.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 2rem;
          background: #111827;
          color: #f3f4f6;
        }

        .control-section {
          grid-column: 1 / -1;
        }

        .live-metrics {
          background: #1f2937;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .platform-status {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #374151;
        }

        .platform-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          margin: 0.5rem 0;
          background: #374151;
          border-radius: 0.375rem;
        }

        .platform-name {
          flex: 1;
          text-transform: capitalize;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status.live {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status.idle,
        .status.disconnected {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }

        .viewer-count {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .session-summary,
        .history {
          background: #1f2937;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .history-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
          padding: 0.75rem;
          background: #374151;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

function MetricCard({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: string | number;
  maxValue?: number;
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {maxValue && <div className="metric-subtext">/ {maxValue}</div>}
      <style jsx>{`
        .metric-card {
          background: #374151;
          padding: 1rem;
          border-radius: 0.375rem;
          text-align: center;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #10b981;
        }

        .metric-subtext {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}
```

## Example 5: Error Handling

Comprehensive error handling and recovery:

```tsx
import React, { useState } from 'react';
import { MultistreamControl } from '@/lib/obs/multistream';

export function MultistreamWithErrorHandling() {
  const [errors, setErrors] = useState<Array<{ id: string; message: string; time: Date }>>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleError = (message: string) => {
    const error = {
      id: `error-${Date.now()}`,
      message,
      time: new Date(),
    };

    setErrors((prev) => [...prev, error]);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== error.id));
    }, 10000);

    // Log to monitoring service
    logErrorToService(message);
  };

  const handleStatus = (status: any) => {
    // Check for warning conditions
    if (status.cpuUsage > 80) {
      setWarnings((prev) => {
        if (!prev.includes('High CPU usage')) {
          return [...prev, 'High CPU usage'];
        }
        return prev;
      });
    } else {
      setWarnings((prev) => prev.filter((w) => w !== 'High CPU usage'));
    }

    if (status.activePlatforms < Object.keys(status.platforms).length) {
      const disconnectedCount =
        Object.keys(status.platforms).length - status.activePlatforms;
      const warning = `${disconnectedCount} platform(s) disconnected`;
      if (!warnings.includes(warning)) {
        setWarnings((prev) => [...prev, warning]);
      }
    }
  };

  const logErrorToService = async (message: string) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          timestamp: new Date(),
          type: 'multistream',
        }),
      });
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  };

  return (
    <div className="error-handling">
      <MultistreamControl
        enabled={true}
        onStatusChange={handleStatus}
        onError={handleError}
      />

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="warnings">
          <h3>Warnings</h3>
          {warnings.map((warning, idx) => (
            <div key={idx} className="warning-item">
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="errors">
          <h3>Errors ({errors.length})</h3>
          {errors.map((error) => (
            <div key={error.id} className="error-item">
              <div className="error-message">❌ {error.message}</div>
              <div className="error-time">{error.time.toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .error-handling {
          padding: 1rem;
        }

        .warnings,
        .errors {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .warnings {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid #f59e0b;
        }

        .errors {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
        }

        .warning-item,
        .error-item {
          padding: 0.5rem;
          margin: 0.25rem 0;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .warning-item {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }

        .error-item {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-time {
          font-size: 0.75rem;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
```

## Running Examples

```bash
# Start the development server
npm run dev

# Navigate to examples
# http://localhost:3000/examples/multistream

# Check console for logs and status updates
```

## Next Steps

- Integrate with your video encoder
- Add platform-specific UI customizations
- Implement chat aggregation
- Build analytics dashboard
- Set up monitoring and alerts
