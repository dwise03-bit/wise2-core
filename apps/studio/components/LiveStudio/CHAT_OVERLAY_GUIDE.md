# OBSChatOverlay Component Guide

## Overview

The `OBSChatOverlay` component provides a production-ready live chat display for streaming applications. It supports multiple platforms (Twitch, YouTube, Facebook, Custom) with real-time message display, alert handling, and customizable visual styling.

## Features

### Core Features

1. **Multi-Platform Support**
   - Twitch chat integration
   - YouTube live chat integration
   - Facebook live comments integration
   - Custom webhook support

2. **Message Display**
   - Real-time chat messages with usernames
   - Timestamps for each message
   - Moderator badges
   - Host badges
   - Subscriber badges
   - Custom username colors
   - Avatar support (if provided by platform)

3. **Alert System**
   - Follow alerts
   - Subscriber alerts
   - Donation/tip alerts
   - Raid alerts
   - Auto-dismiss after configurable duration
   - Custom metadata support

4. **Customization**
   - Corner positioning (top-left, top-right, bottom-left, bottom-right)
   - Adjustable font size (10-18px)
   - Background opacity control (0-100%)
   - Max message history (5-50 messages)

5. **Filtering & Moderation**
   - Spam filtering with pattern detection
   - URL shortener detection
   - Excessive promotion detection
   - Emoji support toggle
   - Mention highlighting

## Component Props

```typescript
interface OBSChatOverlayProps {
  // Chat configuration
  config: ChatOverlayConfig;

  // Visibility state
  isVisible: boolean;

  // Callbacks
  onConfigChange: (config: ChatOverlayConfig) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onAlertTriggered?: (alert: ChatAlert) => void;
}
```

### ChatOverlayConfig

```typescript
interface ChatOverlayConfig {
  // Which platforms to connect to
  platforms: ChatPlatform[];

  // Platform-specific credentials
  credentials: Record<ChatPlatform, {
    apiKey?: string;
    channelId?: string;
    [key: string]: any;
  }>;

  // Visual settings
  position: CornerPosition;         // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  fontSize: number;                 // 10-18
  backgroundOpacity: number;        // 0-100
  maxMessages: number;              // 5-50

  // Feature toggles
  showAlerts: boolean;
  alertDuration: number;            // seconds
  enableEmojis: boolean;
  enableMentions: boolean;
  filterSpam: boolean;
}
```

## Basic Usage

### 1. Simple Integration

```tsx
import { OBSChatOverlay } from './OBSChatOverlay';

export function MyLiveStudio() {
  const [config, setConfig] = useState<ChatOverlayConfig>({
    platforms: ['twitch'],
    credentials: {
      twitch: {
        apiKey: process.env.NEXT_PUBLIC_TWITCH_API_KEY,
        channelId: process.env.NEXT_PUBLIC_TWITCH_CHANNEL_ID,
      },
      youtube: { apiKey: '' },
      facebook: { apiKey: '' },
      custom: { webhookUrl: '' },
    },
    position: 'bottom-right',
    fontSize: 14,
    backgroundOpacity: 85,
    maxMessages: 30,
    showAlerts: true,
    alertDuration: 3,
    enableEmojis: true,
    enableMentions: true,
    filterSpam: true,
  });

  return (
    <OBSChatOverlay
      config={config}
      isVisible={true}
      onConfigChange={setConfig}
    />
  );
}
```

### 2. With Event Handlers

```tsx
<OBSChatOverlay
  config={config}
  isVisible={isStreaming}
  onConfigChange={setConfig}
  onMessageReceived={(message) => {
    console.log(`${message.username}: ${message.message}`);
    // Analytics, effects, etc.
  }}
  onAlertTriggered={(alert) => {
    console.log(`${alert.type}: ${alert.username}`);
    // Play sound, show animation, etc.
  }}
/>
```

## Integration with OBSSourceManager

The chat overlay can be added as a source in your OBSSourceManager:

```tsx
const newSource: Source = {
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
    platforms: ['twitch'],
    showAlerts: true,
    filterSpam: true,
  },
};
```

Then render it conditionally:

```tsx
{selectedSource?.type === 'chat_overlay' && (
  <OBSChatOverlay
    config={selectedSource.properties}
    isVisible={selectedSource.visible}
    onConfigChange={(newConfig) => {
      onSourceUpdate(selectedSource.id, { properties: newConfig });
    }}
  />
)}
```

## Platform Setup

### Twitch

1. Create OAuth application at https://dev.twitch.tv/console/apps
2. Generate chat OAuth token with scopes:
   - `chat:read:messages`
   - `chat:read:emotes`
3. Set environment variables:
   ```
   NEXT_PUBLIC_TWITCH_API_KEY=your_api_key
   NEXT_PUBLIC_TWITCH_CHANNEL_ID=your_channel_id
   TWITCH_OAUTH_TOKEN=your_oauth_token
   ```

### YouTube

1. Enable YouTube Data API v3 in Google Cloud Console
2. Create service account or OAuth 2.0 credentials
3. Set environment variables:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key
   NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id
   ```

### Facebook

1. Create Facebook App at https://developers.facebook.com/apps
2. Generate Page Access Token with:
   - `live_comment_moderation` permission
3. Set environment variables:
   ```
   NEXT_PUBLIC_FACEBOOK_API_KEY=your_api_key
   NEXT_PUBLIC_FACEBOOK_PAGE_ID=your_page_id
   ```

### Custom

For custom chat sources, implement a webhook endpoint:

```typescript
// Example webhook handler
app.post('/api/chat/webhook', (req, res) => {
  const { username, message, platform } = req.body;
  
  // Forward to your frontend via WebSocket or polling
  res.json({ success: true });
});
```

Then configure:
```
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/chat/webhook
```

## Styling & Customization

### CSS Variables

The component uses Tailwind classes and can be customized via the config:

```tsx
// Adjust appearance
config.fontSize = 16;           // Larger text
config.backgroundOpacity = 90;  // More opaque background
config.maxMessages = 50;        // Show more messages
```

### Custom Styling

For advanced customization, create a wrapper component:

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

## Advanced Features

### Message Filtering

Implement custom spam detection:

```tsx
const [config, setConfig] = useState({
  ...defaultConfig,
  filterSpam: true,
});

// The component includes built-in spam filters for:
// - URL shorteners (bit.ly, tinyurl, goo.gl)
// - Promotional messages
// - Repetitive messages
```

### Emoji & Mention Support

```tsx
config.enableEmojis = true;    // Support emoji rendering
config.enableMentions = true;  // Highlight @mentions in blue
```

### Alert Customization

```tsx
onAlertTriggered={(alert) => {
  // alert.type: 'follow' | 'subscribe' | 'donate' | 'raid'
  // alert.username: string
  // alert.message: string
  // alert.metadata: Record<string, any>
  
  switch (alert.type) {
    case 'subscribe':
      playSound('subscribe.mp3');
      showCelebration();
      break;
    case 'raid':
      playSound('raid.mp3');
      showRaidAnimation(alert.metadata.raidCount);
      break;
  }
});
```

## Performance Optimization

### Message History

Keep `maxMessages` reasonable to avoid DOM bloat:
- 20-30 messages: Good balance
- 50+ messages: May impact performance

### Rendering

Messages are wrapped with `motion.div` for smooth animations. To disable:

```tsx
// Modify OBSChatOverlay.tsx
// Replace motion.div with regular div for performance
```

### Connection Management

The component automatically:
- Cleans up connections on unmount
- Reuses connections when config updates
- Handles reconnection on network errors

## Troubleshooting

### Chat Not Appearing

1. Check platform credentials are set
2. Verify API keys have required permissions
3. Check browser console for connection errors
4. Ensure `isVisible={true}`

### Messages Not Loading

1. Verify platform is in `config.platforms`
2. Check that credentials are valid
3. Ensure stream is live on the platform
4. Check network tab for API errors

### Performance Issues

1. Reduce `maxMessages` to 15-20
2. Disable `enableEmojis` if rendering slowly
3. Check browser DevTools Performance tab
4. Consider virtualizing message list for 100+ messages

## API Reference

### Events

```typescript
// Fired when a new message arrives
onMessageReceived?: (message: ChatMessage) => void;

// Fired when an alert is triggered
onAlertTriggered?: (alert: ChatAlert) => void;

// Fired when settings change
onConfigChange: (config: ChatOverlayConfig) => void;
```

### Message Types

```typescript
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
```

### Alert Types

```typescript
type AlertType = 'follow' | 'subscribe' | 'donate' | 'raid';

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

## Dependencies

- `framer-motion`: For animations
- `lucide-react`: For icons
- `react`: 18+
- `tailwindcss`: For styling

## License

Part of WISE² Creative Studio. See project LICENSE.
