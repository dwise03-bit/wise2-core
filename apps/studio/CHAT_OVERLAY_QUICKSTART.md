# Chat Overlay - Quick Start Guide

## 1-Minute Setup

### Simplest Usage (Mock/Testing)

```tsx
import { ChatOverlay } from '@/components/LiveStudio/ChatOverlay';

export default function MyStream() {
  return <ChatOverlay platform="mock" autoConnect={true} />;
}
```

That's it! You'll see simulated chat messages and alerts.

---

## Real Platform Setup

### Step 1: Get API Credentials

#### Twitch
1. Go to https://dev.twitch.tv/console/apps
2. Create new application
3. Copy **Client ID**
4. Generate OAuth token at https://twitchtokengenerator.com
5. Scopes needed: `chat:read chat:edit`

#### YouTube
1. Go to https://console.cloud.google.com
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Get access token via OAuth flow

#### Facebook
1. Go to https://developers.facebook.com
2. Create/select app with live_video scope
3. Generate page access token
4. Get live video ID from broadcast

### Step 2: Add to Your Component

```tsx
import { ChatOverlay } from '@/components/LiveStudio/ChatOverlay';

export default function LiveStream() {
  return (
    <ChatOverlay
      platform="twitch"
      channelId="YOUR_CHANNEL_ID"
      autoConnect={true}
    />
  );
}
```

### Step 3: Provide Credentials (Environment Variables)

Create `.env.local`:

```env
NEXT_PUBLIC_TWITCH_CHANNEL_ID=your_channel_id
NEXT_PUBLIC_TWITCH_CHANNEL_NAME=your_channel_name
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_client_id
TWITCH_EVENTSUB_SECRET=your_eventsub_secret

NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id
NEXT_PUBLIC_YOUTUBE_TOKEN=your_access_token

NEXT_PUBLIC_FACEBOOK_PAGE_ID=your_page_id
NEXT_PUBLIC_FACEBOOK_VIDEO_ID=your_video_id
NEXT_PUBLIC_FACEBOOK_TOKEN=your_access_token

NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Multi-Platform Setup

```tsx
import { useChatOverlay } from '@/hooks/useChatOverlay';
import { ChatOverlay } from '@/components/LiveStudio/ChatOverlay';

export default function MultiStream() {
  const { messages, alerts, isConnected, connect } = useChatOverlay(
    ['twitch', 'youtube', 'facebook'],
    {
      twitch: {
        platform: 'twitch',
        channelId: process.env.NEXT_PUBLIC_TWITCH_CHANNEL_ID,
        channelName: process.env.NEXT_PUBLIC_TWITCH_CHANNEL_NAME,
        accessToken: process.env.TWITCH_ACCESS_TOKEN,
      },
      youtube: {
        platform: 'youtube',
        channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
        accessToken: process.env.YOUTUBE_ACCESS_TOKEN,
      },
      facebook: {
        platform: 'facebook',
        pageId: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID,
        liveVideoId: process.env.NEXT_PUBLIC_FACEBOOK_VIDEO_ID,
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
      },
    }
  );

  return (
    <>
      <ChatOverlay platform="twitch" autoConnect={true} />
      <div className="text-white">
        Messages: {messages.length} | Alerts: {alerts.length}
      </div>
    </>
  );
}
```

---

## Configuration

### Position & Size

```tsx
<ChatOverlay
  platform="twitch"
  onConfigChange={(config) => {
    console.log('New position:', config.position);
    console.log('New size:', config.width, config.height);
  }}
/>
```

Available positions: `top-left`, `top-right`, `bottom-left`, `bottom-right`

Size presets:
- Small: 280×300px
- Medium: 350×400px (default)
- Large: 450×550px

### Visual Settings

```typescript
const customConfig = {
  position: 'bottom-right' as const,
  width: 350,
  height: 400,
  opacity: 0.9,              // 0-1
  fontSize: 14,              // 12-16px
  showUsernames: true,
  showTimestamps: true,
  showEmotes: true,
  messageLimit: 50,          // Max messages to display
  autoScroll: true,
  soundEnabled: false,
  alertAnimations: true,
};
```

---

## Hook Essentials

### Basic Usage

```tsx
const {
  messages,
  alerts,
  isConnected,
  connectionStatus,
  connect,
  disconnect,
  sendMessage,
  playSound,
} = useChatOverlay('twitch');

// Connect
useEffect(() => {
  connect();
}, [connect]);

// Send message
<button onClick={() => sendMessage('Hello chat!')}>Send</button>

// Handle alerts
{alerts.map(alert => (
  <div key={alert.id}>
    {alert.type}: {alert.userName}
  </div>
))}
```

### Multi-Platform

```tsx
const { activePlatforms, addPlatform, removePlatform } = useChatOverlay(
  ['twitch', 'youtube']
);

// Add/remove platforms dynamically
<button onClick={() => addPlatform('facebook')}>
  Add Facebook
</button>

// Display active platforms
{activePlatforms.map(p => (
  <span key={p}>{p}</span>
))}
```

---

## Troubleshooting

### "Connection Error"

1. **Check credentials**
   ```bash
   echo $NEXT_PUBLIC_TWITCH_CHANNEL_ID  # Should print your ID
   ```

2. **Check token validity**
   - Twitch: https://twitchtokengenerator.com
   - YouTube: Google Cloud Console
   - Facebook: App Dashboard

3. **Check network**
   - Open DevTools → Network tab
   - Look for API calls to `api.twitch.tv`, `youtube.googleapis.com`, etc.

### "No messages appearing"

1. Verify `autoConnect={true}`
2. Try mock platform first: `platform="mock"`
3. Check `connectionStatus` in console
4. Verify channel ID is correct

### "Emotes not rendering"

Enable in config: `showEmotes: true`

Check console for image load errors (cross-origin issues).

### "Alerts not showing"

1. Check alert duration: `duration > 3000` (3 seconds)
2. Enable animations: `alertAnimations: true`
3. Verify events are firing on the platform

---

## Common Tasks

### Save Configuration

```tsx
const handleConfigChange = (config) => {
  localStorage.setItem('chatConfig', JSON.stringify(config));
};

<ChatOverlay onConfigChange={handleConfigChange} />
```

### Load Configuration

```tsx
useEffect(() => {
  const saved = localStorage.getItem('chatConfig');
  if (saved) {
    const config = JSON.parse(saved);
    setConfig(config);
  }
}, []);
```

### Play Alert Sound

```tsx
const { playSound } = useChatOverlay('twitch');

// On alert
playSound('subscribe');  // 'message' | 'alert' | 'subscribe' | 'raid'
```

### Filter Messages

```tsx
const modMessages = messages.filter(msg => 
  msg.userType === 'moderator' || msg.isBroadcaster
);
```

### Export Chat Log

```tsx
const exportChat = () => {
  const log = messages.map(msg =>
    `[${msg.timestamp.toLocaleTimeString()}] ${msg.userName}: ${msg.message}`
  ).join('\n');
  
  download(log, 'chat.txt');
};
```

---

## Performance Tips

1. **Limit message count**: Set `messageLimit` to 30-50
2. **Disable auto-scroll** if performance is slow
3. **Disable emotes** if rendering is slow
4. **Close unused platforms** with `removePlatform()`
5. **Use mock platform** for development

---

## Examples

### OBS Scene Integration

```tsx
// Use as browser source in OBS
export default function OBSChatSource() {
  return (
    <div className="bg-transparent w-full h-full">
      <ChatOverlay
        platform="twitch"
        autoConnect={true}
      />
    </div>
  );
}
```

### Raid Alert Overlay

```tsx
const { alerts } = useChatOverlay('twitch');
const raidAlert = alerts.find(a => a.type === 'raid');

{raidAlert && (
  <motion.div
    className="fixed inset-0 flex items-center justify-center"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <div className="text-white text-6xl font-bold">
      RAID! {raidAlert.viewerCount} viewers
    </div>
  </motion.div>
)}
```

### Chat Settings Panel

```tsx
import { ChatSettingsPanel } from '@/components/LiveStudio/ChatSettingsPanel';

<ChatSettingsPanel
  config={config}
  onConfigChange={setConfig}
  isConnected={isConnected}
  connectionStatus={connectionStatus}
  onConnect={connect}
  onDisconnect={disconnect}
  onSendTestMessage={sendMockMessage}
/>
```

---

## File Reference

| File | Purpose |
|------|---------|
| `ChatOverlay.tsx` | Main component |
| `ChatMessage.tsx` | Message renderer |
| `ChatAlert.tsx` | Alert renderer |
| `ChatSettingsPanel.tsx` | Configuration UI |
| `useChatOverlay.ts` | Main hook |
| `TwitchConnector.ts` | Twitch integration |
| `YouTubeConnector.ts` | YouTube integration |
| `FacebookConnector.ts` | Facebook integration |
| `types/chat.ts` | Type definitions |
| `utils/chatUtils.ts` | Helper functions |

---

## Next Steps

1. Read full documentation: `CHAT_INTEGRATION_README.md`
2. Check TypeScript types: `types/chat.ts`
3. Review examples: `ChatOverlayIntegration.tsx`
4. Explore integrations: `services/` directory

---

## Support

For issues or questions:
1. Check `CHAT_INTEGRATION_README.md` troubleshooting
2. Review component props via TypeScript tooltips
3. Test with mock platform first
4. Check console for error messages
