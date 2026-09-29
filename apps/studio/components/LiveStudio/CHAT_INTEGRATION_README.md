# Live Chat Overlay Integration

Complete multi-platform chat integration for WISE² Live Studio supporting Twitch, YouTube, and Facebook with unified message formatting, alerts, and emote rendering.

## Features

### Platform Support
- **Twitch** - Full EventSub integration with chat, follows, subscriptions, cheers, raids
- **YouTube** - Live chat polling with SuperChat support
- **Facebook** - Comments and replies on live videos
- **Mock** - Testing and development with generated messages/alerts

### Message Features
- User badges (Moderator, Broadcaster, Subscriber, VIP)
- Custom username colors per platform
- Avatar display
- Emote rendering (Twitch, BTTV, 7TV, YouTube Emojis)
- Reply/thread tracking
- Platform indicator
- Timestamps

### Alert System
- Follow alerts
- Subscribe/Gift Subscribe alerts (with tier support)
- Raid alerts (with viewer count)
- Tip/Donation alerts (with amount and currency)
- Custom animations
- Auto-hide with configurable duration
- Sound notifications

### UI Features
- Corner positioning (top-left, top-right, bottom-left, bottom-right)
- Configurable size (small/medium/large)
- Auto-scroll to latest messages
- Message history limit
- Font size adjustment
- Background opacity control
- Settings panel for live configuration

## Quick Start

### Basic Usage

```tsx
import { ChatOverlay } from '@/components/LiveStudio/ChatOverlay';
import { useChatOverlay } from '@/hooks/useChatOverlay';

export function LiveStudioWithChat() {
  const { messages, alerts, isConnected } = useChatOverlay('mock');

  return (
    <ChatOverlay
      platform="mock"
      isPreview={false}
      autoConnect={true}
    />
  );
}
```

### Multi-Platform Setup

```tsx
import { useChatOverlay } from '@/hooks/useChatOverlay';

export function MultiPlatformChat() {
  const { messages, alerts, connect } = useChatOverlay(
    ['twitch', 'youtube', 'facebook'],
    {
      twitch: {
        platform: 'twitch',
        channelId: 'YOUR_CHANNEL_ID',
        channelName: 'YOUR_CHANNEL_NAME',
        accessToken: 'YOUR_TWITCH_TOKEN',
      },
      youtube: {
        platform: 'youtube',
        channelId: 'YOUR_YOUTUBE_CHANNEL',
        accessToken: 'YOUR_YOUTUBE_TOKEN',
      },
      facebook: {
        platform: 'facebook',
        pageId: 'YOUR_PAGE_ID',
        liveVideoId: 'YOUR_VIDEO_ID',
        accessToken: 'YOUR_FACEBOOK_TOKEN',
      },
    }
  );

  return <ChatOverlay />;
}
```

### Custom Configuration

```tsx
import { ChatOverlay } from '@/components/LiveStudio/ChatOverlay';
import { createDefaultChatConfig } from '@/components/LiveStudio/types/chat';

export function CustomChatOverlay() {
  const handleConfigChange = (config) => {
    console.log('Config changed:', config);
    // Save to localStorage or backend
  };

  return (
    <ChatOverlay
      platform="twitch"
      channelId="123456"
      onConfigChange={handleConfigChange}
      isPreview={true}
    />
  );
}
```

## Configuration

### ChatOverlayConfig

```typescript
interface ChatOverlayConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width: number;              // 280-450px
  height: number;             // 300-550px
  opacity: number;            // 0-1
  fontSize: number;           // 12-16px
  showUsernames: boolean;
  showTimestamps: boolean;
  showEmotes: boolean;
  messageLimit: number;       // 5-50 messages
  autoScroll: boolean;
  soundEnabled: boolean;
  alertAnimations: boolean;
}
```

### Platform Credentials

#### Twitch
- `channelId`: Numeric channel ID (get from API)
- `channelName`: Channel name/username
- `accessToken`: OAuth token with `chat:read` + `chat:edit` scopes

#### YouTube
- `channelId`: YouTube channel ID
- `accessToken`: OAuth token with YouTube API access
- `liveChatId`: Optional, auto-fetched if not provided

#### Facebook
- `pageId`: Facebook page ID
- `liveVideoId`: Current live video ID
- `accessToken`: Page access token with live_video scope

## Message Types

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: Date;
  platform: 'twitch' | 'youtube' | 'facebook' | 'mock';
  userType?: 'regular' | 'moderator' | 'broadcaster' | 'subscriber' | 'vip';
  isModerator?: boolean;
  isBroadcaster?: boolean;
  isSubscriber?: boolean;
  subscriberTier?: 1 | 2 | 3;
  userColor?: string;           // Hex color from platform
  userAvatar?: string;          // Avatar URL
  emotes?: EmoteData[];
  replyToId?: string;
}
```

### ChatAlert

```typescript
interface ChatAlert {
  id: string;
  type: 'follow' | 'subscribe' | 'giftsub' | 'raid' | 'tip' | 'milestone';
  userName: string;
  message?: string;
  userAvatar?: string;
  timestamp: Date;
  platform: 'twitch' | 'youtube' | 'facebook' | 'mock';
  duration: number;             // Display duration in ms
  amount?: number;              // For tips
  currency?: string;
  viewerCount?: number;         // For raids
  giftCount?: number;           // For gift subs
  subscriberTier?: 1 | 2 | 3;
  metadata?: Record<string, any>;
}
```

## Hook: useChatOverlay

### Returns

```typescript
{
  messages: ChatMessage[];
  alerts: ChatAlert[];
  isConnected: boolean;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';
  activePlatforms: ChatPlatform[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (text: string, platform?: ChatPlatform) => Promise<void>;
  clearMessages: () => void;
  playSound: (type: 'message' | 'alert' | 'subscribe' | 'raid') => void;
  sendMockMessage: () => void;
  addMessage: (message: ChatMessage) => void;
  addAlert: (alert: ChatAlert) => void;
  addPlatform: (platform: ChatPlatform) => void;
  removePlatform: (platform: ChatPlatform) => void;
}
```

## Platform Integrations

### Twitch EventSub

The Twitch connector uses EventSub webhooks for real-time events:

- `channel.follow` - New followers
- `channel.subscribe` - New subscriptions
- `channel.cheer` - Bits/cheers (displayed as tips)
- `channel.raid` - Raid events
- Chat messages via chat API polling

**Setup:**
1. Create OAuth app in Twitch Console
2. Get user access token with scopes: `chat:read chat:edit`
3. Configure EventSub webhook endpoint at `/api/twitch/eventsub`

### YouTube Live Chat

The YouTube connector polls the Live Chat API:

- Regular chat messages
- SuperChat donations
- Chat ownership/membership messages

**Setup:**
1. Enable YouTube Data API v3
2. Get OAuth token with scope: `https://www.googleapis.com/auth/youtube`
3. Stream must be actively broadcasting

### Facebook Comments

The Facebook connector polls live video comments:

- Top-level comments
- Comment replies/threads
- User profile info and avatars

**Setup:**
1. Get Facebook app with live_video scope
2. Create page access token
3. Use live video ID from streaming session

## Advanced Usage

### Filtering Messages

```tsx
const visibleMessages = messages.filter(msg => 
  msg.userType !== 'regular' || msg.isSubscriber
);
```

### Custom Alert Handler

```tsx
const { onAlertReceived } = useChatOverlay('twitch', {...}, {
  onAlertReceived: (alert) => {
    // Custom handling: send to OBS, log, etc.
    console.log(`Alert from ${alert.platform}: ${alert.type}`);
  }
});
```

### Emote Support

Emotes are automatically detected and rendered from:
- **Twitch**: Built-in emotes, BTTV, 7TV
- **YouTube**: YouTube emojis and custom channel emotes
- **Facebook**: Standard emoji support

```tsx
{config.showEmotes && message.emotes?.length > 0 && (
  message.emotes.map(emote => (
    <img 
      key={emote.id}
      src={emote.url}
      alt={emote.name}
      title={`${emote.name} (${emote.platform})`}
    />
  ))
)}
```

### Sound Notifications

Implement custom sound system:

```tsx
const { playSound } = useChatOverlay('mock');

// In your component
const handleAlert = (alert) => {
  playSound(alert.type === 'tip' ? 'subscribe' : 'alert');
  // Play custom audio
  new Audio('/sounds/alert.mp3').play();
};
```

### Persistence

Save configuration to localStorage:

```tsx
const handleConfigChange = (config) => {
  localStorage.setItem('chatOverlayConfig', JSON.stringify(config));
};

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('chatOverlayConfig');
  if (saved) {
    setConfig(JSON.parse(saved));
  }
}, []);
```

## Components

### ChatOverlay (Main Component)

```tsx
<ChatOverlay
  platform="twitch"
  channelId="123456"
  onConfigChange={handleConfigChange}
  isPreview={false}
  autoConnect={true}
/>
```

### ChatSettingsPanel

Configuration UI with:
- Position selector (grid of corners)
- Size controls
- Opacity slider
- Font size adjustment
- Message limit control
- Connection status
- Test message button

### ChatMessage (Renderer)

Displays individual messages with:
- Avatar + username + badges
- Color-coded text by user type
- Emote rendering
- Timestamps
- Reply indicators

### ChatAlert (Renderer)

Displays alerts with:
- Animated entry/exit
- Icon + title per alert type
- User info + amount/viewer count
- Auto-hide on duration
- Optional sound

## Styling & Customization

### Theme Integration

Respects light/dark mode via CSS variables:

```css
:root[data-theme="dark"] {
  --chat-bg: rgb(15, 23, 42);
  --chat-text: rgb(226, 232, 240);
}
```

### Tailwind Classes

All components use Tailwind with:
- `bg-slate-*` for backgrounds
- `text-blue-*`, `text-green-*`, etc. for platform colors
- `border-white/10` for subtle borders
- Animation via Framer Motion

## Testing

### Mock Platform

Test without real API credentials:

```tsx
<ChatOverlay platform="mock" autoConnect={true} />
```

Generates:
- Random messages every 2-3 seconds
- Random alerts every 15-20 seconds
- Mix of user types and subscriber tiers

### Manual Testing

Send test messages via hook:

```tsx
const { sendMockMessage } = useChatOverlay('mock');

<button onClick={sendMockMessage}>Test Message</button>
```

## Error Handling

### Connection Errors

Automatic reconnection with exponential backoff:
- 1s, 2s, 4s, 8s, 16s delays
- Max 5 reconnection attempts
- Status updates via `connectionStatus`

### API Errors

Graceful degradation:
- Missing token → error status
- API rate limit → retry with backoff
- Invalid channel → display error message

## Performance Considerations

1. **Message Limit**: Default 50, configurable to reduce memory
2. **Auto-scroll**: Can be disabled for better performance
3. **Emote Rendering**: Cached image URLs
4. **Polling**: Adjustable intervals (default 2-3s)

## File Structure

```
apps/studio/
├── components/LiveStudio/
│   ├── ChatOverlay.tsx                 # Main component
│   ├── ChatMessage.tsx                 # Message renderer
│   ├── ChatAlert.tsx                   # Alert renderer
│   ├── ChatSettingsPanel.tsx           # Config UI
│   ├── types/
│   │   └── chat.ts                     # Type definitions
│   └── CHAT_INTEGRATION_README.md      # This file
├── services/
│   ├── ChatConnectorBase.ts            # Base class
│   ├── TwitchConnector.ts              # Twitch implementation
│   ├── YouTubeConnector.ts             # YouTube implementation
│   ├── FacebookConnector.ts            # Facebook implementation
│   └── MockConnector.ts                # Mock implementation
├── hooks/
│   └── useChatOverlay.ts               # Main hook
└── utils/
    └── chatUtils.ts                    # Utilities
```

## Troubleshooting

### Messages not appearing
1. Check platform credentials
2. Verify `autoConnect={true}`
3. Check `connectionStatus` in dev tools
4. Try mock platform first

### Emotes not rendering
1. Enable `showEmotes` in config
2. Check emote URLs in browser console
3. Verify platform has emote support

### Alerts not showing
1. Enable `alertAnimations` in config
2. Check `duration` is sufficient (default 5000ms)
3. Verify alert type is supported

### Connection issues
1. Check API rate limits
2. Verify OAuth tokens are valid
3. Check network connectivity
4. Review error status in connection panel

## Future Enhancements

- [ ] Raid overlay with raider list
- [ ] Chat moderation UI (ban, timeout, delete)
- [ ] Custom emote packs
- [ ] Message search/filter UI
- [ ] Chat history export
- [ ] Discord integration
- [ ] Webhook support for custom alerts
