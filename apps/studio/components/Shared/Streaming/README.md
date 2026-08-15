# Stream Destination Management Components

Professional stream destination management for multi-platform live streaming. These components provide a complete UI for managing stream connections to YouTube, Twitch, Facebook, LinkedIn, and custom RTMP endpoints.

## Components

### StreamDestinationButton
Individual destination button with connection status, toggle, and settings access.

**Props:**
- `destination: StreamDestination` - The destination to display
- `onConnect: (destination) => void` - Called when connecting
- `onDisconnect: (id: string) => void` - Called when disconnecting
- `onSettings: (destination) => void` - Called when opening settings
- `isLoading?: boolean` - Show loading state

**Features:**
- Status indicator (connected/disconnected)
- Connection status badge
- Dropdown menu for quick actions
- Color-coded by platform

**Example:**
```tsx
<StreamDestinationButton
  destination={destination}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  onSettings={handleSettings}
  isLoading={isConnecting}
/>
```

### StreamConnectionUI
Detailed connection status display with expandable details and quick connect/disconnect.

**Props:**
- `destination: StreamDestination` - The destination to display
- `onConnect: (destination) => void` - Called when connecting
- `onDisconnect: (id: string) => void` - Called when disconnecting
- `isLoading?: boolean` - Show loading state
- `error?: string | null` - Error message to display

**Features:**
- Large status indicator with animation
- Connection details with URL and stream key (masked)
- Copy to clipboard for stream key
- Activity indicator
- Health status

**Example:**
```tsx
<StreamConnectionUI
  destination={destination}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  error={connectionError}
/>
```

### StreamDestinationsPanel
Complete panel displaying all stream destinations with grid/list view toggle.

**Props:**
- `destinations: StreamDestination[]` - Array of destinations
- `onConnect: (destination) => void` - Called when connecting
- `onDisconnect: (id: string) => void` - Called when disconnecting
- `onSettings: (destination) => void` - Called when opening settings
- `isLoading?: boolean` - Show loading state
- `loadingDestinationId?: string` - ID of destination being loaded
- `errors?: Record<string, string>` - Error messages by destination ID

**Features:**
- Grid and list view modes
- Summary statistics (connected, active, total, health)
- Bulk actions (start/stop all)
- Empty state with call-to-action
- Expandable details in list view
- Responsive layout

**Example:**
```tsx
<StreamDestinationsPanel
  destinations={streaming.destinations}
  onConnect={streaming.connectDestination}
  onDisconnect={streaming.disconnectDestination}
  onSettings={handleSettings}
/>
```

### StreamSettingsForm
Comprehensive form for stream metadata and configuration.

**Props:**
- `config: StreamConfig` - Current configuration
- `onChange: (config: Partial<StreamConfig>) => void` - Called on changes
- `isScheduled?: boolean` - Show scheduled stream option

**Features:**
- Stream title with character counter (120 chars)
- Description with character counter (500 chars)
- Category selection (Music, Gaming, Creative, etc.)
- Tag management (up to 5)
- Visibility selection (public, unlisted, private)
- Advanced settings section:
  - Scheduled start time
  - Thumbnail URL
- Real-time character counters
- Tag auto-add on Enter key

**Example:**
```tsx
<StreamSettingsForm
  config={streaming.config}
  onChange={streaming.updateConfig}
  isScheduled={true}
/>
```

### DestinationSettingsModal
Modal dialog for configuring individual destination settings.

**Props:**
- `destination: StreamDestination` - The destination to configure
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Called when closing
- `onSave: (destination) => void` - Called when saving
- `isLoading?: boolean` - Show loading state

**Features:**
- Platform-specific instructions
- Connection status indicator
- URL/Ingest URL field
- Stream key field with visibility toggle
- Test connection button
- Advanced options:
  - Audio/Video toggle
  - Resolution preference
  - Bitrate setting
- Form validation
- Responsive design

**Example:**
```tsx
{selectedDestination && (
  <DestinationSettingsModal
    destination={selectedDestination}
    isOpen={settingsOpen}
    onClose={() => setSettingsOpen(false)}
    onSave={handleSaveSettings}
  />
)}
```

### StreamingIntegration
Complete integration component that ties all components together.

**Props:**
- `destinations: StreamDestination[]` - Array of destinations
- `config: StreamConfig` - Stream configuration
- `onConnectDestination: (destination) => Promise<void> | void` - Connect handler
- `onDisconnectDestination: (id: string) => Promise<void> | void` - Disconnect handler
- `onUpdateConfig: (config: Partial<StreamConfig>) => void` - Config update handler
- `isLoading?: boolean` - Loading state
- `loadingDestinationId?: string` - Loading destination ID
- `errors?: Record<string, string>` - Error messages
- `allowScheduling?: boolean` - Show scheduling option

**Features:**
- Complete streaming setup flow
- Settings, destinations, and modal all managed
- Getting started guide
- Pro tips section
- Platform limits reference
- Error handling
- Single import for entire system

**Example:**
```tsx
const { streaming } = useStreamingWithAudio();

<StreamingIntegration
  destinations={streaming.destinations}
  config={streaming.config}
  onConnectDestination={streaming.connectDestination}
  onDisconnectDestination={streaming.disconnectDestination}
  onUpdateConfig={streaming.updateConfig}
/>
```

## Integration with useStreamingWithAudio

These components are designed to work seamlessly with the `useStreamingWithAudio` hook from the audio engine.

### Hook Usage

```tsx
import { useStreamingWithAudio } from '@/hooks/useStreamingWithAudio';
import { StreamingIntegration } from '@/components/Shared';

export function LiveStreamingPage() {
  const { streaming } = useStreamingWithAudio();

  return (
    <StreamingIntegration
      destinations={streaming.destinations}
      config={streaming.config}
      onConnectDestination={streaming.connectDestination}
      onDisconnectDestination={streaming.disconnectDestination}
      onUpdateConfig={streaming.updateConfig}
    />
  );
}
```

### State Management

The `useStreaming` hook provides:
- `destinations: StreamDestination[]` - Array of configured destinations
- `config: StreamConfig` - Stream title, description, category, tags, etc.
- `connectDestination(destination)` - Connect to a destination
- `disconnectDestination(id)` - Disconnect from a destination
- `updateConfig(config)` - Update stream configuration
- `isStreaming: boolean` - Current streaming status
- `streamStatus: StreamStatusInfo` - Live status info

## Type Definitions

### StreamDestination
```typescript
interface StreamDestination {
  id: string;
  type: DestinationType; // 'youtube' | 'twitch' | 'facebook' | 'linkedin' | 'rtmp' | 'custom'
  name: string;
  isConnected: boolean;
  isActive: boolean;
  url?: string;
  streamKey?: string;
}
```

### StreamConfig
```typescript
interface StreamConfig {
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  scheduledFor?: Date;
  visibility: 'public' | 'private' | 'unlisted';
}
```

## Styling

All components use Tailwind CSS with:
- Dark theme optimized for streaming workflows
- Responsive design (mobile, tablet, desktop)
- Status colors: green (connected/good), red (disconnected/error), blue (info)
- Consistent spacing and typography
- Accessible focus states and interactive elements

## Error Handling

Components support error display through the `errors` prop (object mapping destination IDs to error messages):

```tsx
<StreamDestinationsPanel
  destinations={destinations}
  errors={{
    'youtube': 'Failed to connect: Invalid stream key',
    'twitch': 'Network timeout'
  }}
/>
```

## Loading States

Loading states are managed through:
- `isLoading: boolean` - General loading state for all operations
- `loadingDestinationId: string` - Specific destination being loaded

```tsx
<StreamDestinationsPanel
  isLoading={isConnecting}
  loadingDestinationId={currentDestinationId}
/>
```

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- High contrast colors
- Focus indicators on interactive elements
- Screen reader friendly text

## Best Practices

1. **Validation**: Validate stream key and URL before connecting
2. **Test Connection**: Use the "Test Connection" button before going live
3. **Consistent Metadata**: Use the same title and description across platforms
4. **Platform Limits**: Refer to platform-specific bitrate and resolution recommendations
5. **Error Recovery**: Display helpful error messages and recovery options
6. **Loading Feedback**: Always show loading indicators during connection attempts
7. **Security**: Never display stream keys in plain text in logs or URLs

## Performance Considerations

- Components memoize callbacks to prevent unnecessary re-renders
- Grid/list view toggle reduces DOM complexity
- Lazy loading of connection details in list view
- Efficient state updates in integration component

## Future Enhancements

Potential improvements for future versions:
- Real-time viewer count synchronization
- Platform-specific analytics integration
- Automatic bitrate adjustment
- Stream health monitoring
- Chat integration per platform
- Automatic failover for dropped connections
- Stream key rotation
- Scheduled stream notifications
