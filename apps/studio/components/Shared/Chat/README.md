# Live Chat System

A comprehensive, production-ready live chat system for WISE² Live Streaming and Live Studio with emoji support, message validation, user badges, and simulated chat messages for demo purposes.

## Components

### ChatMessage Component
Displays individual chat messages with:
- User avatar with consistent color generation
- Username display
- User badges (Moderator, Verified, Subscriber, VIP)
- Message text with emoji and line break support
- Timestamp (shown on hover)
- Hover effects for better UX

**Location:** `/components/Shared/Chat/ChatMessage.tsx`

**Props:**
```typescript
interface ChatMessageProps {
  message: ChatMessage;
}
```

### ChatList Component
Displays scrollable message list with:
- Auto-scroll to latest messages
- Smart scroll detection (pauses auto-scroll if user scrolls up)
- Message count limiting (default 200 messages) to prevent performance issues
- Shows indicator when messages are hidden due to limit
- Empty state with friendly message
- Smooth scrolling behavior

**Location:** `/components/Shared/Chat/ChatList.tsx`

**Props:**
```typescript
interface ChatListProps {
  messages: ChatMessage[];
  maxMessages?: number; // default: 200
}
```

### ChatInput Component
Message input with:
- Rich emoji picker with categories (Smileys, Thumbs, Hand, Hearts, Fire)
- Character count display (shows warning at <50 chars remaining)
- Message validation (empty message check, length validation)
- Enter to send, Shift+Enter for multi-line
- Emoji button for quick access
- Disabled state support
- Configurable max length (default 500 chars)

**Location:** `/components/Shared/Chat/ChatInput.tsx`

**Props:**
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  maxLength?: number; // default: 500
}
```

**Features:**
- 5 emoji categories with 18+ emojis each
- Real-time character counter
- Character warning (red text when <50 chars remaining)
- Smooth emoji picker toggle

### ChatRoom Component
Complete chat interface combining all components:
- Header with title and active user count
- Optional filter tabs (All, Verified, Mods)
- Full message list with auto-scroll
- Message input area
- Disabled state with appropriate messaging
- Optional settings mode with message filtering

**Location:** `/components/Shared/Chat/ChatRoom.tsx`

**Props:**
```typescript
interface ChatRoomProps {
  title?: string;           // default: 'CHAT'
  isEnabled?: boolean;      // default: true
  activeUsers?: number;     // default: 0
  showSettings?: boolean;   // default: false
  maxMessages?: number;     // default: 200
}
```

**Features:**
- Live viewer count display
- Message filtering by type (All/Verified/Mods)
- Clear chat functionality (when settings enabled)
- Responsive header with status indicator
- Disabled state messaging

## Hook: useChat

Custom React hook managing chat state and message simulation:

**Location:** `/hooks/useChat.ts`

**Returns:**
```typescript
{
  messages: ChatMessage[];                           // All chat messages
  users: Map<string, ChatUser>;                      // Tracked users
  moderationStatus: 'active' | 'passive' | 'disabled'; // Moderation mode
  totalUsers: number;                                // Number of unique users
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void;
  removeMessage(messageId: string): void;
  clearMessages(): void;
  updateModerationStatus(status): void;
}
```

**Features:**
- Automatic message ID and timestamp generation
- User tracking (prevents duplicates)
- Demo message simulation:
  - 10 realistic demo users with varied badges
  - 13+ different message templates
  - Random timing (30-40% chance every 2 seconds)
  - Mixed badge distribution (regular, subscriber, verified, moderator)
- Moderation status tracking
- Message removal support
- Clear chat capability

**Demo Users:**
- StreamViewer123, AudioEnthusiast, LiveChat_User, Producer_Mike (Moderator)
- TechLover_Sarah (VIP), MusicalGenius, CloudStudio_Dev
- StreamingPro, MusicProducer99, AudioEngineer_Jay

## Integration

### Live Streaming Page
```tsx
<ChatRoom title="LIVE CHAT" isEnabled={true} activeUsers={viewerCount} />
```
Located in right sidebar of `/app/live-streaming/page.tsx`

### Live Studio Page
```tsx
<ChatRoom title="CHAT ROOM" isEnabled={true} activeUsers={viewerCount} />
```
Located in right panel of `/app/live-studio/page.tsx`

## Types

All types are defined in `/types/streaming.ts`:

```typescript
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadges: string[];  // 'verified', 'subscriber', 'vip', etc.
  message: string;
  timestamp: Date;
  isModerator: boolean;
}
```

## Styling

All components use Tailwind CSS with dark theme optimizations:
- **Primary colors:** Blue (#2563eb) for actions
- **Accent colors:** Purple, Red (moderators), Yellow (VIP)
- **Background:** Gray-900 with gray-800 accents
- **Text:** Gray-300 (primary), Gray-500 (secondary)

**Features:**
- Hover effects on messages
- Smooth transitions
- Responsive layouts
- Disabled state styling
- Dark mode optimized

## Browser Support

- Modern browsers with ES2020+ support
- Chrome/Edge 88+, Firefox 87+, Safari 14+

## Performance

- Limited to 200 messages by default (configurable)
- Smart scroll detection prevents unnecessary re-renders
- Efficient message filtering
- Optimized badge rendering
- Smooth 60fps animations

## Keyboard Shortcuts

- **Enter:** Send message
- **Shift+Enter:** Would support multi-line (currently single line)

## Future Enhancements

- User mentions (@username)
- Message reactions/emojis
- Threaded replies
- User profiles on click
- Message search/filter
- Rich text formatting (bold, italic)
- Link preview support
- Message moderation actions
- Ban/timeout user functionality
- Chat history persistence
- Real WebSocket integration (currently simulated)

## Testing

The chat system is fully functional with:
- Demo message simulation for testing
- No backend required (uses local state)
- Ready for WebSocket integration
- Type-safe throughout with TypeScript

## Export

All chat components and hook are exported from `/components/Shared/Chat/index.ts`:

```typescript
export { ChatMessage, type ChatMessageProps } from './ChatMessage';
export { ChatList, type ChatListProps } from './ChatList';
export { ChatInput, type ChatInputProps } from './ChatInput';
export { ChatRoom, type ChatRoomProps } from './ChatRoom';
export { useChat } from '../../../hooks/useChat';
```
