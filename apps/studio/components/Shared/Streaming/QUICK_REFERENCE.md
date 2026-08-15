# Stream Destination Management - Quick Reference

## Components Quick Link

| Component | Purpose | Key Props | Location |
|-----------|---------|-----------|----------|
| **StreamDestinationButton** | Platform button with status | `destination, onConnect, onDisconnect, onSettings, isLoading` | `./StreamDestinationButton.tsx` |
| **StreamConnectionUI** | Connection detail display | `destination, onConnect, onDisconnect, isLoading, error` | `./StreamConnectionUI.tsx` |
| **StreamDestinationsPanel** | All destinations panel | `destinations, onConnect, onDisconnect, onSettings, isLoading, loadingDestinationId, errors` | `./StreamDestinationsPanel.tsx` |
| **StreamSettingsForm** | Metadata configuration | `config, onChange, isScheduled` | `./StreamSettingsForm.tsx` |
| **DestinationSettingsModal** | Platform settings modal | `destination, isOpen, onClose, onSave, isLoading` | `./DestinationSettingsModal.tsx` |
| **StreamingIntegration** | Complete integration | `destinations, config, onConnectDestination, onDisconnectDestination, onUpdateConfig, isLoading, loadingDestinationId, errors, allowScheduling` | `./StreamingIntegration.tsx` |

## Import Patterns

### Single Component
```tsx
import { StreamDestinationButton } from '@/components/Shared';
```

### Multiple Components
```tsx
import {
  StreamDestinationButton,
  StreamConnectionUI,
  StreamDestinationsPanel,
  StreamSettingsForm,
  DestinationSettingsModal,
  StreamingIntegration,
} from '@/components/Shared';
```

### With Types
```tsx
import {
  StreamingIntegration,
  type StreamingIntegrationProps,
} from '@/components/Shared';
```

## Basic Usage

### 1. Simple Destination Button
```tsx
<StreamDestinationButton
  destination={destination}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  onSettings={handleSettings}
/>
```

### 2. Settings Form
```tsx
<StreamSettingsForm
  config={config}
  onChange={updateConfig}
  isScheduled={true}
/>
```

### 3. Complete Integration
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

## Hook Integration

```tsx
import { useStreamingWithAudio } from '@/hooks/useStreamingWithAudio';

const { streaming } = useStreamingWithAudio();

// Available properties
streaming.destinations        // StreamDestination[]
streaming.config             // StreamConfig
streaming.isStreaming        // boolean
streaming.streamStatus       // StreamStatusInfo

// Available methods
streaming.connectDestination(dest)      // Promise<void>
streaming.disconnectDestination(id)     // Promise<void>
streaming.updateConfig(config)          // void
streaming.startStream()                 // Promise<void>
streaming.stopStream()                  // Promise<void>
```

## State Types

### StreamDestination
```typescript
{
  id: string;                      // Unique identifier
  type: 'youtube' | 'twitch' | 'facebook' | 'linkedin' | 'rtmp' | 'custom';
  name: string;                    // Display name
  isConnected: boolean;            // Connection status
  isActive: boolean;               // Currently streaming
  url?: string;                    // Ingest URL
  streamKey?: string;              // Stream key (secret)
}
```

### StreamConfig
```typescript
{
  title: string;                   // Stream title (120 chars)
  description: string;             // Stream description (500 chars)
  category: string;                // Category from list
  tags: string[];                  // Up to 5 tags
  thumbnail?: string;              // Thumbnail URL
  scheduledFor?: Date;             // Scheduled start time
  visibility: 'public' | 'private' | 'unlisted';
}
```

## Event Handlers

### On Connect
```tsx
const handleConnect = async (destination: StreamDestination) => {
  try {
    // Show loading
    setLoadingDestId(destination.id);
    
    // Call API or hook
    await streaming.connectDestination(destination);
    
    // Clear error
    clearError(destination.id);
  } catch (error) {
    // Set error
    setError(destination.id, error.message);
  } finally {
    setLoadingDestId(undefined);
  }
};
```

### On Disconnect
```tsx
const handleDisconnect = async (id: string) => {
  try {
    setLoadingDestId(id);
    await streaming.disconnectDestination(id);
  } catch (error) {
    setError(id, error.message);
  } finally {
    setLoadingDestId(undefined);
  }
};
```

### On Settings
```tsx
const handleSettings = (destination: StreamDestination) => {
  setSelectedDestination(destination);
  setSettingsOpen(true);
};
```

### On Config Change
```tsx
const handleConfigChange = (updates: Partial<StreamConfig>) => {
  streaming.updateConfig(updates);
  // Optionally sync with backend
};
```

## Error Handling

### Display Errors
```tsx
<StreamDestinationsPanel
  destinations={destinations}
  errors={{
    'youtube': 'Connection failed: Invalid stream key',
    'twitch': 'Network timeout',
  }}
/>
```

### Set Errors
```tsx
try {
  await connectDestination(dest);
} catch (error) {
  setErrors(prev => ({
    ...prev,
    [dest.id]: error.message
  }));
}
```

## Loading States

### Set Loading
```tsx
<StreamDestinationsPanel
  isLoading={isConnecting}
  loadingDestinationId={currentDestId}
/>
```

### Multiple Operations
```tsx
const [loading, setLoading] = useState(false);
const [loadingDestId, setLoadingDestId] = useState<string>();

// During operation
setLoading(true);
setLoadingDestId(destination.id);

// After operation
setLoading(false);
setLoadingDestId(undefined);
```

## Platform Colors

| Platform | Color | Hex |
|----------|-------|-----|
| YouTube | Red | `#ef4444` |
| Twitch | Purple | `#a855f7` |
| Facebook | Blue | `#1d4ed8` |
| LinkedIn | Light Blue | `#60a5fa` |
| RTMP | Orange | `#f97316` |
| Custom | Gray | `#9ca3af` |

## Common Tasks

### Initialize Destinations
```tsx
const initDestinations = [
  { id: 'youtube', type: 'youtube' as const, name: 'YouTube', isConnected: false, isActive: false },
  { id: 'twitch', type: 'twitch' as const, name: 'Twitch', isConnected: false, isActive: false },
  { id: 'facebook', type: 'facebook' as const, name: 'Facebook', isConnected: false, isActive: false },
  { id: 'linkedin', type: 'linkedin' as const, name: 'LinkedIn', isConnected: false, isActive: false },
  { id: 'rtmp', type: 'rtmp' as const, name: 'Custom RTMP', isConnected: false, isActive: false },
];
```

### Get Connected Destinations
```tsx
const connected = destinations.filter(d => d.isConnected);
const active = destinations.filter(d => d.isActive);
```

### Validate Stream Key
```tsx
const isValidStreamKey = (key: string): boolean => {
  return key && key.length > 20; // Platform-specific validation
};
```

### Validate RTMP URL
```tsx
const isValidRtmpUrl = (url: string): boolean => {
  return url.startsWith('rtmp://') || url.startsWith('rtmps://');
};
```

## Props Checklist

### StreamDestinationButton
- [ ] `destination` - Required
- [ ] `onConnect` - Required
- [ ] `onDisconnect` - Required
- [ ] `onSettings` - Required
- [ ] `isLoading` - Optional, defaults to false

### StreamSettingsForm
- [ ] `config` - Required
- [ ] `onChange` - Required
- [ ] `isScheduled` - Optional, defaults to false

### StreamDestinationsPanel
- [ ] `destinations` - Required
- [ ] `onConnect` - Required
- [ ] `onDisconnect` - Required
- [ ] `onSettings` - Required
- [ ] `isLoading` - Optional
- [ ] `loadingDestinationId` - Optional
- [ ] `errors` - Optional

### DestinationSettingsModal
- [ ] `destination` - Required
- [ ] `isOpen` - Required
- [ ] `onClose` - Required
- [ ] `onSave` - Required
- [ ] `isLoading` - Optional

### StreamingIntegration
- [ ] `destinations` - Required
- [ ] `config` - Required
- [ ] `onConnectDestination` - Required
- [ ] `onDisconnectDestination` - Required
- [ ] `onUpdateConfig` - Required
- [ ] `isLoading` - Optional
- [ ] `loadingDestinationId` - Optional
- [ ] `errors` - Optional
- [ ] `allowScheduling` - Optional

## Status Indicators

### Connection Status
- 🟢 Connected (animated pulse)
- 🔴 Disconnected (static)
- ⚠️ Error (red)

### Activity Status
- 🟢 Live (animated)
- ⚪ Idle

### Health Status
- ✓ Excellent
- ○ Good/Fair
- ✕ Poor/Critical

## Keyboard Shortcuts

- `Tab` - Navigate between elements
- `Enter` - Activate buttons/links
- `Space` - Toggle options
- `Escape` - Close modals/dropdowns

## Responsive Breakpoints

- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

## Color Usage

| Use Case | Colors |
|----------|--------|
| Connected/Success | Green (`text-green-400`, `bg-green-500/10`) |
| Error/Disconnected | Red (`text-red-400`, `bg-red-500/10`) |
| Warning | Yellow (`text-yellow-400`, `bg-yellow-500/10`) |
| Info/Action | Blue (`text-blue-400`, `bg-blue-500/10`) |
| Neutral/Disabled | Gray (`text-gray-400`, `bg-gray-500/10`) |

## CSS Classes

### Common Classes
- `bg-gray-900` - Dark background
- `border border-gray-700` - Border
- `rounded-lg` - Border radius
- `text-white` - White text
- `text-gray-400` - Gray text
- `hover:bg-gray-700` - Hover state
- `transition-colors` - Color transitions
- `disabled:opacity-50` - Disabled state
- `animate-pulse` - Pulsing animation

## Debugging Tips

### Check Destination State
```tsx
console.log('Destinations:', destinations);
console.log('Connected:', destinations.filter(d => d.isConnected));
```

### Check Loading State
```tsx
console.log('Loading:', isLoading);
console.log('Loading Destination ID:', loadingDestinationId);
```

### Check Errors
```tsx
console.log('Errors:', errors);
```

### Check Config State
```tsx
console.log('Config:', config);
console.log('Tags:', config.tags);
```

## Performance Tips

1. **Memoize Callbacks**
   ```tsx
   const handleConnect = useCallback((dest) => { ... }, [dependencies]);
   ```

2. **Use Proper Dependencies**
   ```tsx
   useEffect(() => { ... }, [streaming, audio]); // Not []);
   ```

3. **Debounce Config Changes**
   ```tsx
   const debouncedChange = useDebouncedCallback((config) => { ... }, 500);
   ```

4. **Conditional Rendering**
   ```tsx
   {selectedDestination && <DestinationSettingsModal ... />}
   ```

## Common Errors

### Error: "Cannot read property 'destinations' of undefined"
- Make sure `useStreamingWithAudio()` is called in parent
- Pass `streaming.destinations` to child component

### Error: "Stream key is required"
- Validate in DestinationSettingsModal
- Check form validation before save

### Error: "Connection failed"
- Check error state in props
- Display error message to user
- Provide recovery action

### Error: "Port required for TypeScript generics"
- Use `as const` for type literals: `type: 'youtube' as const`

## Resources

- **README.md** - Detailed documentation
- **USAGE_EXAMPLES.md** - Real-world examples
- **IMPLEMENTATION_SUMMARY.md** - Architecture details
- **Types** - `/apps/studio/types/streaming.ts`
- **Hook** - `/apps/studio/hooks/useStreamingWithAudio.ts`

## Support

For issues or questions:
1. Check USAGE_EXAMPLES.md
2. Review component TypeScript types
3. Check error messages in console
4. Verify hook integration
5. Test with simplified example

---

**Last Updated**: 2026-07-14  
**Version**: 1.0.0  
**Status**: Production Ready
