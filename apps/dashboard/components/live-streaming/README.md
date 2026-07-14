# Live Streaming Components

Professional live streaming interface components for the WISE² platform. A complete set of modular React components designed for high-fidelity audio and video streaming.

## Components Overview

### Core Components

#### 1. **StreamViewer**
Main video/audio visualization area with live indicator and animated waveforms.

**Props:**
- `isLive: boolean` - Stream status
- `streamTitle?: string` - Title of the stream

**Features:**
- Animated frequency bars and waveforms
- Live indicator badge with pulse animation
- Stream status display
- Professional SVG-based visualization

```tsx
<StreamViewer isLive={true} streamTitle="My Stream" />
```

---

#### 2. **StreamControls**
GO LIVE and END STREAM button controls.

**Props:**
- `isLive: boolean` - Current stream status
- `onToggleLive: (isLive: boolean) => void` - Toggle handler
- `isLoading?: boolean` - Loading state during transition

**Features:**
- Context-aware button colors (green for start, red for stop)
- Settings and info button shortcuts
- Loading state with visual feedback

```tsx
<StreamControls 
  isLive={isLive}
  onToggleLive={handleToggleLive}
  isLoading={isLoading}
/>
```

---

#### 3. **StreamStats**
Status cards displaying stream metadata and health.

**Props:**
- `streamKey: string` - Encoder stream key
- `health: 'excellent' | 'good' | 'fair' | 'poor'` - Stream health
- `bitrate: number` - Current bitrate in kbps
- `resolution: string` - Output resolution (e.g., "1920x1080")
- `frameRate: number` - FPS (e.g., 60)
- `masterVolume?: number` - Master audio level (0-1)

**Features:**
- 6 metric cards in responsive grid
- Color-coded health indicator
- Masked stream key display with copy button
- Real-time metric updates

```tsx
<StreamStats
  streamKey="rtmp-key-123"
  health="excellent"
  bitrate={8450}
  resolution="1920x1080"
  frameRate={60}
  masterVolume={0.8}
/>
```

---

#### 4. **AudioMixer**
Multi-channel audio mixer with volume sliders and level meters.

**Props:**
- `channels?: ChannelConfig[]` - Array of audio channels
- `onChannelVolumeChange?: (channelId: string, volume: number) => void`
- `onChannelMute?: (channelId: string, muted: boolean) => void`
- `masterVolume?: number` - Master volume level (0-1)
- `onMasterVolumeChange?: (volume: number) => void`

**Default Channels:**
- MIC 1, MIC 2, System Audio, Music, Guest

**Features:**
- Volume sliders with mute buttons
- Real-time level meters with color-coded output
- Master volume control
- Peak indicator with visual feedback
- Smooth animations and transitions

```tsx
<AudioMixer
  masterVolume={masterVolume}
  onMasterVolumeChange={handleVolumeChange}
  onChannelVolumeChange={handleChannelChange}
  onChannelMute={handleMute}
/>
```

---

#### 5. **SceneSwitcher**
Scene/source selection interface for switching between cameras and screen share.

**Props:**
- `scenes?: Scene[]` - Array of available scenes
- `onSceneChange?: (sceneId: string) => void` - Scene selection handler

**Default Scenes:**
- Camera 1 (main), Camera 2 (side), Screen Share, Picture

**Features:**
- Grid-based scene selection
- Active scene highlighting with pulse indicator
- Live preview of selected scene
- Add scene and settings buttons

```tsx
<SceneSwitcher onSceneChange={handleSceneChange} />
```

---

#### 6. **StreamDestinations**
Platform destination management for multi-streaming.

**Props:**
- `destinations?: Destination[]` - Platform list
- `onDestinationToggle?: (destinationId: string, isActive: boolean) => void`

**Default Destinations:**
- YouTube, Facebook, Twitch, LinkedIn, Custom RTMP

**Features:**
- Real-time status indicators (connected, connecting, disconnected, error)
- Per-platform viewer counts
- Toggle activation with visual feedback
- Total viewer aggregation
- Add custom RTMP button

```tsx
<StreamDestinations onDestinationToggle={handleToggle} />
```

---

#### 7. **StreamInfo**
Stream metadata display and editing panel.

**Props:**
- `title?: string` - Stream title
- `description?: string` - Stream description
- `category?: string` - Content category
- `tags?: string[]` - Content tags
- `scheduledTime?: string` - UTC scheduled start time
- `isEditable?: boolean` - Enable edit mode
- `onUpdate?: (info: Partial<StreamInfoData>) => void`

**Features:**
- View and edit modes
- Inline title, category, and description editing
- Dynamic tag management (add/remove)
- Scheduled time picker
- Form validation and save/cancel actions

```tsx
<StreamInfo 
  title="My Stream"
  isEditable={true}
  onUpdate={handleUpdate}
/>
```

---

#### 8. **LiveChat**
Real-time chat interface with viewer count.

**Props:**
- `messages?: ChatMessage[]` - Chat message history
- `onSendMessage?: (message: string) => void` - Message handler
- `viewerCount?: number` - Current viewer count

**Features:**
- Auto-scrolling message history
- User avatars and timestamps
- Message highlight support
- Send message with Enter key or button
- Smooth animations
- Viewer count display

```tsx
<LiveChat 
  viewerCount={1256}
  onSendMessage={handleMessage}
/>
```

---

#### 9. **StreamAnalytics**
Real-time analytics dashboard with charts and metrics.

**Props:**
- `viewers?: number` - Current viewer count
- `bitrate?: number` - Current bitrate in kbps
- `health?: 'excellent' | 'good' | 'fair' | 'poor'` - Stream health
- `dataPoints?: AnalyticsDataPoint[]` - Historical data
- `onRefresh?: () => void` - Refresh handler

**Features:**
- Animated counter cards
- Real-time trend graph (20-minute window)
- Peak viewers and average bitrate display
- Color-coded health status
- Interactive refresh button
- SVG-based chart with gradients

```tsx
<StreamAnalytics
  viewers={1256}
  bitrate={8450}
  health="excellent"
/>
```

---

## Integration with Audio Engine

### WISE² Audio Engine Integration Points

The AudioMixer component can be integrated with the WISE² audio engine:

```tsx
import { useAudioEngine } from '@/hooks/useAudioEngine';

function LiveStreamingPage() {
  const { channels, updateVolume, updateMute } = useAudioEngine();

  return (
    <AudioMixer
      channels={channels}
      onChannelVolumeChange={updateVolume}
      onChannelMute={updateMute}
    />
  );
}
```

### Audio Engine Hook (Future Implementation)

Create `/hooks/useAudioEngine.ts`:

```typescript
export function useAudioEngine() {
  const [channels, setChannels] = useState([]);

  // Connect to Tone.js or Web Audio API
  const updateVolume = (channelId: string, volume: number) => {
    // Update audio context
  };

  const updateMute = (channelId: string, muted: boolean) => {
    // Toggle channel mute
  };

  return { channels, updateVolume, updateMute };
}
```

---

## Styling & Customization

### Theme Colors (Tailwind)

Components use WISE² brand colors:
- **Primary Blue:** `#00D9FF` (blue-500)
- **Primary Purple:** `#B300FF` (purple-500)
- **Success Green:** `#00D966`
- **Alert Red:** `#FF0040`

### Responsive Behavior

All components are mobile-responsive:
- Single column on mobile
- 2-3 columns on tablet
- Full layout on desktop

### Dark Mode

Components are built for dark mode with:
- `bg-black` and `bg-gray-900` backgrounds
- `text-chrome` (#E8E8E8) default text
- Blue/purple accent highlights

---

## Usage Example

Complete page integration:

```tsx
'use client';

import { useState } from 'react';
import {
  StreamViewer,
  StreamControls,
  StreamStats,
  AudioMixer,
  SceneSwitcher,
  StreamDestinations,
  StreamInfo,
  LiveChat,
  StreamAnalytics,
} from '@/components/live-streaming';

export default function LiveStreamingPage() {
  const [isLive, setIsLive] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);

  return (
    <div className="min-h-screen bg-black">
      {/* Main viewer */}
      <StreamViewer isLive={isLive} />
      
      {/* Controls */}
      <StreamControls isLive={isLive} onToggleLive={setIsLive} />
      
      {/* Stats grid */}
      <StreamStats bitrate={8450} health="excellent" {...props} />
      
      {/* Audio and scenes */}
      <AudioMixer masterVolume={masterVolume} onMasterVolumeChange={setMasterVolume} />
      <SceneSwitcher />
      
      {/* Streaming and chat */}
      <StreamDestinations />
      <StreamInfo />
      <LiveChat />
      
      {/* Analytics */}
      <StreamAnalytics viewers={1256} />
    </div>
  );
}
```

---

## Component Architecture

```
live-streaming/
├── StreamViewer.tsx          # Main video player
├── StreamControls.tsx        # GO LIVE / END buttons
├── StreamStats.tsx           # Status metrics cards
├── AudioMixer.tsx            # Multi-channel mixer
├── SceneSwitcher.tsx         # Source selection
├── StreamDestinations.tsx    # Platform management
├── StreamInfo.tsx            # Metadata editor
├── LiveChat.tsx              # Chat interface
├── StreamAnalytics.tsx       # Real-time stats & charts
├── index.ts                  # Component exports
└── README.md                 # This file
```

---

## Performance Considerations

1. **Animations:** Use `transform` and `opacity` for GPU acceleration
2. **Re-renders:** Components use `useState` for local state
3. **Audio Updates:** Debounce frequent updates (bitrate, levels)
4. **Chart Data:** Limit historical data to 20 points (5 minutes at 15s intervals)
5. **Memoization:** Consider `React.memo()` for expensive child components

---

## Accessibility

- Semantic HTML with proper labels
- Keyboard navigation on buttons and inputs
- Color-coded status with text labels
- ARIA attributes on interactive elements
- High contrast colors meeting WCAG AA standards

---

## Future Enhancements

- [ ] WebRTC integration for actual video streaming
- [ ] Web Audio API integration
- [ ] OBS/StreamDeck API integration
- [ ] Advanced audio effects chain
- [ ] Multi-bitrate adaptive streaming
- [ ] Chat moderation tools
- [ ] Viewer interaction (polls, superchat)
- [ ] Archive/replay functionality
