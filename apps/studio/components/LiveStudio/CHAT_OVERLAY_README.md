# OBS Chat Overlay Component

A production-ready live chat overlay component for WISE² Creative Studio Live Stream functionality.

## Quick Start

### 1. Basic Setup

```tsx
import { OBSChatOverlay } from '@/components/LiveStudio';
import { createDefaultChatConfig } from '@/components/LiveStudio/types/chat';

export function MyLiveStudio() {
  const [config, setConfig] = useState(
    createDefaultChatConfig({
      platforms: ['twitch'],
      position: 'bottom-right',
    })
  );

  return (
    <OBSChatOverlay
      config={config}
      isVisible={true}
      onConfigChange={setConfig}
    />
  );
}
```

### 2. With OBSSourceManager

```tsx
import { OBSSourceManager, Source } from '@/components/LiveStudio';

export function LiveStudio() {
  const [sources, setSources] = useState<Source[]>([
    {
      id: 'chat-1',
      name: 'Live Chat',
      type: 'chat_overlay',
      visible: true,
      zIndex: 100,
      properties: {
        position: 'bottom-right',
        fontSize: 14,
        backgroundOpacity: 85,
        maxMessages: 30,
      },
    },
  ]);

  return (
    <OBSSourceManager
      sources={sources}
      selectedSourceId={'chat-1'}
      onSourceAdd={() => {/* add source */}}
      onSourceDelete={(id) => {/* delete source */}}
      onSourceToggleVisibility={(id) => {/* toggle visibility */}}
      onSourceSelect={(id) => {/* select source */}}
      onSourceReorder={(sources) => setSources(sources)}
    />
  );
}
```

## Features

- **Multi-Platform Support**: Twitch, YouTube, Facebook, Custom
- **Real-Time Messages**: Live chat display with timestamps
- **User Badges**: Moderator, Host, Subscriber indicators
- **Alert System**: Follower, Subscriber, Raid, Donation alerts
- **Customization**: Position, font size, background opacity
- **Spam Filtering**: Built-in pattern-based spam detection
- **Emoji Support**: Optional emoji rendering
- **Mention Highlighting**: Blue highlighting for @mentions

## Configuration

### Platform Credentials

Set environment variables for each platform:

```bash
# Twitch
NEXT_PUBLIC_TWITCH_API_KEY=your_key
NEXT_PUBLIC_TWITCH_CHANNEL_ID=your_channel_id
TWITCH_OAUTH_TOKEN=your_token

# YouTube
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id

# Facebook
NEXT_PUBLIC_FACEBOOK_API_KEY=your_key
NEXT_PUBLIC_FACEBOOK_PAGE_ID=your_page_id

# Custom
NEXT_PUBLIC_WEBHOOK_URL=https://your-webhook.com
```

### Configuration Options

```typescript
interface ChatOverlayConfig {
  platforms: ChatPlatform[];           // ['twitch', 'youtube', ...]
  credentials: Record<ChatPlatform, PlatformCredentials>;
  position: CornerPosition;            // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  fontSize: number;                    // 10-18
  backgroundOpacity: number;           // 0-100
  maxMessages: number;                 // 5-50
  showAlerts: boolean;                 // true | false
  alertDuration: number;               // seconds
  enableEmojis: boolean;               // true | false
  enableMentions: boolean;             // true | false
  filterSpam: boolean;                 // true | false
}
```

## Event Handling

### Message Events

```tsx
<OBSChatOverlay
  config={config}
  isVisible={true}
  onConfigChange={setConfig}
  onMessageReceived={(message) => {
    console.log(`${message.username}: ${message.message}`);
    console.log('Platform:', message.platform);
    console.log('Moderator:', message.isModerator);
    console.log('Host:', message.isHost);
    console.log('Subscriber:', message.isSubscriber);
  }}
/>
```

### Alert Events

```tsx
<OBSChatOverlay
  config={config}
  isVisible={true}
  onConfigChange={setConfig}
  onAlertTriggered={(alert) => {
    switch (alert.type) {
      case 'follow':
        console.log(`${alert.username} followed!`);
        playSound('follow.mp3');
        break;
      case 'subscribe':
        console.log(`${alert.username} subscribed!`);
        playSound('subscribe.mp3');
        showAnimation('celebration');
        break;
      case 'raid':
        console.log(`${alert.username} raided with ${alert.metadata?.raidCount} viewers!`);
        playSound('raid.mp3');
        break;
    }
  }}
/>
```

## Styling & Customization

### Adjust Appearance

```tsx
// Larger text
config.fontSize = 16;

// More opaque background
config.backgroundOpacity = 95;

// Show more messages
config.maxMessages = 50;
```

### Custom Wrapper

```tsx
export function CustomChatOverlay(props: OBSChatOverlayProps) {
  return (
    <div className="custom-chat-wrapper">
      <OBSChatOverlay {...props} />
      <style>{`
        .custom-chat-wrapper {
          --chat-bg: rgba(30, 30, 30, 0.95);
          --chat-text: #ffffff;
          --chat-accent: #00aaff;
        }
      `}</style>
    </div>
  );
}
```

## Platform Setup Guides

### Twitch

1. Go to https://dev.twitch.tv/console/apps
2. Create OAuth Application
3. Generate Chat OAuth token with scopes:
   - `chat:read:messages`
   - `chat:read:emotes`
4. Set environment variables

**Example Integration:**
```typescript
// Uses Twitch TMI.js library (or direct API)
// Connects via WebSocket to Twitch chat servers
// Automatically handles reconnection and error recovery
```

### YouTube

1. Enable YouTube Data API v3 in Google Cloud Console
2. Create credentials (Service Account or OAuth 2.0)
3. Grant calendar.insert and calendar.readonly scopes
4. Set environment variables

**Example Integration:**
```typescript
// Uses YouTube Data API v3
// Fetches live chat messages from active streams
// Handles pagination and rate limiting
```

### Facebook

1. Go to https://developers.facebook.com/apps
2. Create new app
3. Add "Live Comment Moderation" product
4. Generate Page Access Token with:
   - `live_comment_moderation` permission
5. Set environment variables

**Example Integration:**
```typescript
// Uses Facebook Graph API
// Listens to live comment streams
// Handles comment moderation and metadata
```

### Custom Webhook

Implement your own webhook endpoint:

```typescript
// POST /api/chat/webhook
app.post('/api/chat/webhook', async (req, res) => {
  const { username, message, platform, badges } = req.body;

  // Process message
  const chatMessage = {
    id: generateId(),
    username,
    message,
    platform,
    isModerator: badges?.includes('moderator'),
    isHost: badges?.includes('broadcaster'),
    timestamp: new Date(),
  };

  // Forward to frontend
  broadcastToChat(chatMessage);

  res.json({ success: true });
});
```

Configure:
```bash
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/chat/webhook
```

## Performance Optimization

### Message History

- 20-30 messages: Good balance for performance and visibility
- 50+ messages: May impact rendering performance
- Use virtualization for 100+ messages

### Rendering

- Messages use Framer Motion for smooth animations
- Text formatting is applied on-demand
- Avatar caching reduces re-renders

### Connection Management

The component automatically:
- Cleans up connections on unmount
- Reuses connections when config updates
- Handles reconnection with exponential backoff
- Manages memory for long-running streams

## Troubleshooting

### Chat Not Appearing

```typescript
// Check 1: Verify visibility
isVisible={true}

// Check 2: Verify platform is selected
config.platforms.includes('twitch')

// Check 3: Verify credentials
console.log(config.credentials.twitch.apiKey)

// Check 4: Check browser console for errors
```

### Messages Not Loading

```typescript
// Check 1: Stream is live
// Check 2: API key has required permissions
// Check 3: Channel ID is correct
// Check 4: Network tab shows successful API calls
```

### Performance Issues

```typescript
// Reduce message history
config.maxMessages = 15;

// Disable emoji rendering
config.enableEmojis = false;

// Use profiling tools
console.time('chat-render');
```

## Advanced Usage

### Filtering Messages

```typescript
const filteredConfig = {
  ...config,
  filterSpam: true,  // Enable built-in spam filter
};

// Or implement custom filtering
onMessageReceived={(message) => {
  if (message.message.includes('http')) {
    return; // Skip link spam
  }
}}
```

### Custom Styling

```tsx
// Modify message display
export function StyledChatOverlay() {
  return (
    <div className="chat-wrapper">
      <OBSChatOverlay {...props} />
      <style>{`
        /* Custom styles */
        .chat-message {
          font-family: 'Comic Sans MS', sans-serif;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
}
```

### Statistics & Monitoring

```typescript
interface ChatStatistics {
  totalMessages: number;
  uniqueUsers: number;
  messagesByPlatform: Record<ChatPlatform, number>;
  totalAlerts: number;
  alertsByType: Record<AlertType, number>;
  messagesPerMinute: number;
}

// Track in dashboard
onMessageReceived={(message) => {
  updateStats({
    totalMessages: ++stats.totalMessages,
    messagesByPlatform: {
      ...stats.messagesByPlatform,
      [message.platform]: ++stats.messagesByPlatform[message.platform],
    },
  });
}}
```

## API Reference

### OBSChatOverlay Component

```typescript
interface OBSChatOverlayProps {
  config: ChatOverlayConfig;
  isVisible: boolean;
  onConfigChange: (config: ChatOverlayConfig) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onAlertTriggered?: (alert: ChatAlert) => void;
}
```

### Types

```typescript
type ChatPlatform = 'twitch' | 'youtube' | 'facebook' | 'custom';
type AlertType = 'follow' | 'subscribe' | 'donate' | 'raid';
type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  platform: ChatPlatform;
  isModerator?: boolean;
  isHost?: boolean;
  isSubscriber?: boolean;
  color?: string;
  avatarUrl?: string;
}

interface ChatAlert {
  id: string;
  type: AlertType;
  username: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Mobile browsers: Responsive design

## Dependencies

- `framer-motion`: 10.x - Animations
- `lucide-react`: 0.x - Icons
- `react`: 18.x - Framework
- `tailwindcss`: 3.x - Styling

## File Structure

```
components/LiveStudio/
├── OBSChatOverlay.tsx           # Main component
├── OBSSourceManager.tsx         # Source manager (supports chat_overlay type)
├── OBSSourceProperties.tsx      # Properties panel (chat settings)
├── types/
│   └── chat.ts                  # Type definitions
├── CHAT_OVERLAY_GUIDE.md        # Detailed guide
├── CHAT_OVERLAY_README.md       # This file
└── index.ts                     # Main exports
```

## Contributing

To add new features:

1. Add types to `types/chat.ts`
2. Update `OBSChatOverlay.tsx` with new functionality
3. Add corresponding properties to `OBSSourceProperties.tsx`
4. Update documentation
5. Test across platforms

## License

Part of WISE² Creative Studio. See project LICENSE for details.

## Support

For issues or questions:
- Check CHAT_OVERLAY_GUIDE.md for detailed documentation
- Review example implementations
- Check browser console for error messages
- Verify environment variables and credentials
