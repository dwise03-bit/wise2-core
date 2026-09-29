# Chat Overlay - Quick Start Guide

Get a live chat overlay running in 5 minutes.

## Step 1: Import the Component

```tsx
import { ChatOverlay } from '@/components/LiveStudio';
```

## Step 2: Add to Your Stream Page

### Option A: Mock Chat (Testing)
```tsx
export default function StreamPage() {
  return (
    <div>
      <div className="w-full h-screen bg-black">
        {/* Your stream video here */}
      </div>
      
      <ChatOverlay platform="mock" autoConnect={true} />
    </div>
  );
}
```

### Option B: Preview Mode (Configuration)
```tsx
export default function ChatSettingsPage() {
  const [config, setConfig] = useState();

  return (
    <ChatOverlay
      platform="mock"
      isPreview={true}
      onConfigChange={(newConfig) => {
        setConfig(newConfig);
        localStorage.setItem('chatConfig', JSON.stringify(newConfig));
      }}
    />
  );
}
```

### Option C: Production (Real Chat)
```tsx
export default function LiveStream() {
  return (
    <ChatOverlay
      platform="twitch"
      channelId="your-twitch-id"
      autoConnect={true}
    />
  );
}
```

## Step 3: Position Your Overlay

The overlay appears in a fixed position (default: bottom-right). Click the settings gear icon to adjust:

- **Position**: Top-left, top-right, bottom-left, bottom-right
- **Size**: Small (250x350) to XL (550x600)
- **Opacity**: 0-100%
- **Font**: 10-20px

## Step 4: Configure Settings

In the settings panel:

1. **Enable what you want to show:**
   - ✓ Show Usernames
   - ✓ Show Timestamps
   - ✓ Show Emotes
   - ✓ Auto-Scroll
   - ✓ Sound Alerts

2. **Set message history:** 20, 50, 100, or 200 messages

3. **Toggle alert animations** for visual impact

4. **Copy config** to save your settings as JSON

## Common Configurations

### Config 1: Minimal Chat
```tsx
<ChatOverlay
  platform="mock"
  onConfigChange={(config) => {
    // Sets to:
    // - Show only messages (no names/times/emotes)
    // - 20 message history
    // - Small size
  }}
/>
```

### Config 2: Full Featured
```tsx
<ChatOverlay
  platform="mock"
  onConfigChange={(config) => {
    // Sets to:
    // - Show everything
    // - 100 message history
    // - Large size
    // - Animations + sounds enabled
  }}
/>
```

### Config 3: Compact
```tsx
<ChatOverlay
  platform="mock"
  onConfigChange={(config) => {
    // Sets to:
    // - Medium size (350x400)
    // - Show names + messages only
    // - 50 message history
    // - Bottom-right position
  }}
/>
```

## Using with Your Stream Software

### OBS Setup

1. **Add Browser Source:**
   - Click "+" → Browser
   - Set URL to your stream app page

2. **Configure Size:**
   - Width: 350-450px
   - Height: 400-500px

3. **Position:**
   - Use OBS transform tools to position

4. **Test:**
   - Click settings gear in overlay
   - Send test message
   - Verify it shows

### Streamlabs OBS

Same as OBS, but might need to refresh browser source.

### Wirecast

Use browser source with your app URL.

## Testing Without a Real Stream

```tsx
// Use mock platform to test
<ChatOverlay platform="mock" autoConnect={true} />

// Then click settings gear and:
// 1. Click "Test Message" button repeatedly
// 2. Adjust settings while messages flow
// 3. Click position grid to change positions
// 4. Export config when happy with it
```

## Save Your Configuration

### To localStorage:
```tsx
<ChatOverlay
  platform="mock"
  onConfigChange={(config) => {
    localStorage.setItem('myStreamChatConfig', JSON.stringify(config));
  }}
/>
```

### To Load Later:
```tsx
const savedConfig = JSON.parse(localStorage.getItem('myStreamChatConfig'));
// Then manually apply to a fresh ChatOverlay instance
```

## Troubleshooting

### Chat not showing
- ✓ Click settings (gear icon)
- ✓ Click "Connect" button
- ✓ For mock: Click "Test Message"

### Text too small
- Open settings
- Increase "Font Size" slider

### Too many/few messages
- Open settings
- Adjust "Message History" (20/50/100/200)

### Transparency issues
- Open settings
- Adjust "Opacity" slider

### Overlay position wrong
- Open settings
- Click desired position in the grid

## Next Steps

1. **Test with mock chat** - Verify positioning and styling
2. **Read CHAT_OVERLAY_README.md** - Learn all features
3. **Connect to real platform** - Integrate with Twitch/YouTube
4. **Customize styling** - Edit colors in ChatMessage.tsx
5. **Deploy** - Push to your stream app

## File Reference

```
components/LiveStudio/
├── ChatOverlay.tsx              (main component)
├── ChatMessage.tsx              (single message)
├── ChatAlert.tsx                (alerts)
├── ChatSettingsPanel.tsx        (settings)
├── ChatOverlayExample.tsx       (usage examples)
├── types/
│   └── chat.ts                  (TypeScript types)
└── CHAT_OVERLAY_README.md       (full docs)

hooks/
└── useChatOverlay.ts            (React hook)

utils/
├── chatUtils.ts                 (helpers)
└── emoteParser.ts               (emote utilities)
```

## API Quick Reference

### Component Props
```tsx
<ChatOverlay
  platform="mock"              // 'twitch' | 'youtube' | 'facebook' | 'mock'
  channelId="optional"         // For real platforms
  isPreview={false}            // Show settings panel
  autoConnect={true}           // Connect on mount
  onConfigChange={(c) => {}}   // Config changed callback
/>
```

### Hook Usage
```tsx
const {
  messages,         // ChatMessage[]
  alerts,           // ChatAlert[]
  isConnected,      // boolean
  connect,          // () => void
  disconnect,       // () => void
  playSound,        // (type) => void
  sendMockMessage,  // () => void
} = useChatOverlay('mock');
```

## Common Use Cases

### Use Case 1: Small YouTube Stream
```tsx
<ChatOverlay
  platform="youtube"
  channelId="your-id"
  onConfigChange={(c) => {
    // Small size, top-right, names only
  }}
/>
```

### Use Case 2: Large Twitch Stream
```tsx
<ChatOverlay
  platform="twitch"
  channelId="your-id"
  onConfigChange={(c) => {
    // Large size, bottom-right, full featured
  }}
/>
```

### Use Case 3: Development/Testing
```tsx
<ChatOverlay
  platform="mock"
  isPreview={true}
/>
```

---

**Ready? Start with mock chat, then integrate your real platform when ready!**
