# Usage Examples - Stream Destination Management

Comprehensive examples for using the streaming destination management components.

## Basic Usage - Individual Components

### Using StreamDestinationButton

```tsx
import { StreamDestinationButton } from '@/components/Shared';
import { useState } from 'react';
import type { StreamDestination } from '@/types/streaming';

export function MyComponent() {
  const destination: StreamDestination = {
    id: 'youtube',
    type: 'youtube',
    name: 'YouTube',
    isConnected: false,
    isActive: false,
  };

  const handleConnect = (dest: StreamDestination) => {
    console.log('Connecting to:', dest.type);
    // Call API to connect
  };

  const handleDisconnect = (id: string) => {
    console.log('Disconnecting from:', id);
    // Call API to disconnect
  };

  const handleSettings = (dest: StreamDestination) => {
    console.log('Open settings for:', dest.type);
    // Open settings modal
  };

  return (
    <StreamDestinationButton
      destination={destination}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onSettings={handleSettings}
    />
  );
}
```

### Using StreamConnectionUI

```tsx
import { StreamConnectionUI } from '@/components/Shared';
import type { StreamDestination } from '@/types/streaming';

export function ConnectionDetail() {
  const destination: StreamDestination = {
    id: 'twitch',
    type: 'twitch',
    name: 'Twitch',
    isConnected: true,
    isActive: true,
    url: 'rtmps://live-jfk.twitch.tv/app/',
    streamKey: 'live_123456789_abcdefghijklmnop',
  };

  return (
    <div className="p-4 max-w-md">
      <StreamConnectionUI
        destination={destination}
        onConnect={(dest) => console.log('Connect:', dest)}
        onDisconnect={(id) => console.log('Disconnect:', id)}
        error={null}
      />
    </div>
  );
}
```

### Using StreamSettingsForm

```tsx
import { StreamSettingsForm } from '@/components/Shared';
import { useState } from 'react';
import type { StreamConfig } from '@/types/streaming';

export function StreamMetadata() {
  const [config, setConfig] = useState<StreamConfig>({
    title: 'My Live Stream',
    description: 'Join me for an awesome broadcast!',
    category: 'Music',
    tags: ['live', 'music', 'entertainment'],
    visibility: 'public',
  });

  const handleChange = (updates: Partial<StreamConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    // Save to server
  };

  return (
    <StreamSettingsForm
      config={config}
      onChange={handleChange}
      isScheduled={true}
    />
  );
}
```

### Using DestinationSettingsModal

```tsx
import { DestinationSettingsModal } from '@/components/Shared';
import { useState } from 'react';
import type { StreamDestination } from '@/types/streaming';

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState<StreamDestination>({
    id: 'youtube',
    type: 'youtube',
    name: 'YouTube',
    isConnected: false,
    isActive: false,
  });

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Configure YouTube
      </button>

      <DestinationSettingsModal
        destination={destination}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={(updated) => {
          setDestination(updated);
          console.log('Saved:', updated);
        }}
      />
    </>
  );
}
```

## Advanced Usage - Complete Integration

### Full Streaming Page with useStreamingWithAudio

```tsx
'use client';

import { useStreamingWithAudio } from '@/hooks/useStreamingWithAudio';
import { StreamingIntegration } from '@/components/Shared';

export function LiveStreamingPage() {
  const { streaming } = useStreamingWithAudio();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Studio</h1>
          <p className="text-gray-400">
            {streaming.isStreaming ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live - {streaming.streamStatus.viewerCount} viewers
              </span>
            ) : (
              'Ready to stream'
            )}
          </p>
        </header>

        <StreamingIntegration
          destinations={streaming.destinations}
          config={streaming.config}
          onConnectDestination={streaming.connectDestination}
          onDisconnectDestination={streaming.disconnectDestination}
          onUpdateConfig={streaming.updateConfig}
          allowScheduling={true}
        />
      </div>
    </div>
  );
}
```

### Custom Hook Integration

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useStreamingWithAudio } from '@/hooks/useStreamingWithAudio';
import {
  StreamDestinationsPanel,
  StreamSettingsForm,
  DestinationSettingsModal,
} from '@/components/Shared';
import type { StreamDestination } from '@/types/streaming';

export function CustomStreamingPage() {
  const { streaming } = useStreamingWithAudio();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState<StreamDestination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDestId, setLoadingDestId] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConnect = useCallback(async (dest: StreamDestination) => {
    setLoading(true);
    setLoadingDestId(dest.id);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await streaming.connectDestination(dest);
      // Clear error if exists
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[dest.id];
        return updated;
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [dest.id]: error instanceof Error ? error.message : 'Connection failed',
      }));
    } finally {
      setLoading(false);
      setLoadingDestId(undefined);
    }
  }, [streaming]);

  const handleDisconnect = useCallback(async (id: string) => {
    setLoading(true);
    setLoadingDestId(id);
    try {
      await streaming.disconnectDestination(id);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [id]: error instanceof Error ? error.message : 'Disconnection failed',
      }));
    } finally {
      setLoading(false);
      setLoadingDestId(undefined);
    }
  }, [streaming]);

  const handleSettings = useCallback((dest: StreamDestination) => {
    setSelectedDest(dest);
    setSettingsOpen(true);
  }, []);

  const handleSaveSettings = useCallback((dest: StreamDestination) => {
    console.log('Saved settings:', dest);
    // TODO: Call API to save destination settings
  }, []);

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <StreamSettingsForm
        config={streaming.config}
        onChange={streaming.updateConfig}
        isScheduled={true}
      />

      {/* Destinations Panel */}
      <StreamDestinationsPanel
        destinations={streaming.destinations}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onSettings={handleSettings}
        isLoading={loading}
        loadingDestinationId={loadingDestId}
        errors={errors}
      />

      {/* Settings Modal */}
      {selectedDest && (
        <DestinationSettingsModal
          destination={selectedDest}
          isOpen={settingsOpen}
          onClose={() => {
            setSettingsOpen(false);
            setSelectedDest(null);
          }}
          onSave={handleSaveSettings}
          isLoading={loading && loadingDestId === selectedDest.id}
        />
      )}
    </div>
  );
}
```

## API Integration Examples

### Connecting a Destination

```tsx
// Backend endpoint example
async function connectStreamDestination(
  userId: string,
  destination: StreamDestination
) {
  const response = await fetch(
    `/api/users/${userId}/streaming/destinations/${destination.id}/connect`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: destination.url,
        streamKey: destination.streamKey,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Frontend usage
const handleConnect = async (destination: StreamDestination) => {
  try {
    setLoadingDestId(destination.id);
    const result = await connectStreamDestination(userId, destination);
    // Update state with result
    streaming.connectDestination({ ...destination, ...result });
  } catch (error) {
    setErrors((prev) => ({
      ...prev,
      [destination.id]: error.message,
    }));
  } finally {
    setLoadingDestId(undefined);
  }
};
```

### Updating Stream Configuration

```tsx
// Backend endpoint
async function updateStreamConfig(
  userId: string,
  config: Partial<StreamConfig>
) {
  const response = await fetch(
    `/api/users/${userId}/streaming/config`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update config');
  }

  return response.json();
}

// Frontend usage with debouncing
import { useDebouncedCallback } from 'use-debounce';

const handleConfigChange = useDebouncedCallback(
  async (config: Partial<StreamConfig>) => {
    try {
      const result = await updateStreamConfig(userId, config);
      streaming.updateConfig(result);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },
  500
);
```

### Testing Connection

```tsx
// Backend endpoint
async function testConnection(destination: StreamDestination) {
  const response = await fetch(
    '/api/streaming/test-connection',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(destination),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Frontend usage in settings modal
const handleTestConnection = async () => {
  setTesting(true);
  try {
    const result = await testConnection(formData);
    setTestResult({
      success: true,
      message: 'Connection successful!',
    });
  } catch (error) {
    setTestResult({
      success: false,
      message: error.message,
    });
  } finally {
    setTesting(false);
  }
};
```

## Real-World Scenario

### Multi-Platform Live Streaming Setup

```tsx
'use client';

import { useStreamingWithAudio } from '@/hooks/useStreamingWithAudio';
import { StreamingIntegration } from '@/components/Shared';
import { useCallback, useState } from 'react';

export function MultiPlatformStreaming() {
  const { streaming, audio } = useStreamingWithAudio();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize default destinations
  const initializeDestinations = useCallback(async () => {
    const defaultDests = [
      {
        id: 'youtube',
        type: 'youtube' as const,
        name: 'YouTube',
        isConnected: false,
        isActive: false,
      },
      {
        id: 'twitch',
        type: 'twitch' as const,
        name: 'Twitch',
        isConnected: false,
        isActive: false,
      },
      {
        id: 'facebook',
        type: 'facebook' as const,
        name: 'Facebook',
        isConnected: false,
        isActive: false,
      },
    ];

    for (const dest of defaultDests) {
      // Load saved credentials if available
      try {
        const saved = await loadDestinationSettings(dest.id);
        if (saved) {
          streaming.connectDestination({
            ...dest,
            ...saved,
          });
        }
      } catch (error) {
        console.error(`Failed to load ${dest.id} settings:`, error);
      }
    }
  }, [streaming]);

  const handleConnect = useCallback(
    async (destination: any) => {
      setIsLoading(true);
      try {
        // Validate audio engine state
        if (audio.state.tracks.length === 0) {
          throw new Error('No audio tracks configured');
        }

        // Connect via API
        const result = await connectStreamDestination(destination);

        // Update state
        streaming.connectDestination({
          ...destination,
          ...result,
        });

        // Clear error
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[destination.id];
          return updated;
        });
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          [destination.id]: error instanceof Error ? error.message : 'Connection failed',
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [streaming, audio]
  );

  const handleStartStream = useCallback(async () => {
    try {
      // Start all connected destinations
      const connectedDests = streaming.destinations.filter((d) => d.isConnected);
      if (connectedDests.length === 0) {
        throw new Error('No destinations connected');
      }

      // Start audio engine
      audio.startRecording();

      // Start streaming
      streaming.startStream();

      // Send to all platforms
      for (const dest of connectedDests) {
        await startStreamDestination(dest.id);
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  }, [streaming, audio]);

  return (
    <div className="space-y-8">
      {/* Main Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleStartStream}
          disabled={isLoading || streaming.destinations.filter((d) => d.isConnected).length === 0}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition-colors"
        >
          {streaming.isStreaming ? '◼ Stop Streaming' : '▶ Start Streaming'}
        </button>
      </div>

      {/* Full Integration */}
      <StreamingIntegration
        destinations={streaming.destinations}
        config={streaming.config}
        onConnectDestination={handleConnect}
        onDisconnectDestination={streaming.disconnectDestination}
        onUpdateConfig={streaming.updateConfig}
        errors={errors}
      />

      {/* Status Monitor */}
      {streaming.isStreaming && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-green-400 mb-2">Live Status</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-green-400">
                <div>
                  Uptime: {Math.floor(streaming.streamStatus.uptime / 60)}m{' '}
                  {streaming.streamStatus.uptime % 60}s
                </div>
                <div>Viewers: {streaming.streamStatus.viewerCount}</div>
                <div>Bitrate: {streaming.streamStatus.bitrate} kbps</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
async function loadDestinationSettings(destId: string) {
  // Load from backend
  const response = await fetch(`/api/streaming/destinations/${destId}`);
  return response.json();
}

async function connectStreamDestination(destination: any) {
  const response = await fetch(`/api/streaming/connect`, {
    method: 'POST',
    body: JSON.stringify(destination),
  });
  return response.json();
}

async function startStreamDestination(destId: string) {
  const response = await fetch(
    `/api/streaming/destinations/${destId}/start`,
    { method: 'POST' }
  );
  return response.json();
}
```

## Testing Components

### Unit Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamDestinationButton } from '@/components/Shared';

describe('StreamDestinationButton', () => {
  it('displays destination status correctly', () => {
    const destination = {
      id: 'youtube',
      type: 'youtube' as const,
      name: 'YouTube',
      isConnected: true,
      isActive: false,
    };

    render(
      <StreamDestinationButton
        destination={destination}
        onConnect={jest.fn()}
        onDisconnect={jest.fn()}
        onSettings={jest.fn()}
      />
    );

    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('calls onConnect when connecting', () => {
    const onConnect = jest.fn();
    const destination = {
      id: 'twitch',
      type: 'twitch' as const,
      name: 'Twitch',
      isConnected: false,
      isActive: false,
    };

    render(
      <StreamDestinationButton
        destination={destination}
        onConnect={onConnect}
        onDisconnect={jest.fn()}
        onSettings={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Twitch'));
    fireEvent.click(screen.getByText('+ Connect'));

    expect(onConnect).toHaveBeenCalledWith(destination);
  });
});
```

These examples cover various use cases from simple component usage to complex multi-platform streaming integrations. Adapt them to your specific needs and backend architecture.
