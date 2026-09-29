# WISE² Personal IMP — Quick Reference Card

## Phase 1 Files at a Glance

```
📁 apps/dashboard/
  📁 src/
    📁 types/
      📄 imp.ts ............................ Type system & state machine
    📁 hooks/
      📄 useImpExpression.ts .............. Avatar state management
      📄 useHermesChat.ts ................ API integration & chat state
      📄 index.ts ......................... Barrel exports
    📁 components/
      📄 ImpAvatar.tsx ................... Avatar graphics component
  📁 app/
    📁 components/
      📄 AIAssistant.tsx ................ Main chatbot UI (INTEGRATED)
    📁 api/
      📄 [auth already configured] ....... JWT handling

📄 .env.local ............................ Development config (API URL)
📄 .env.production ....................... Production config (API URL)

📁 apps/website/public/wise-imp/ ........ 48 graphics assets (16 PNG + 16 WebP + 16 SVG)

📁 docs/personal-imp/
  📄 PHASE1_FOUNDATION_COMPLETE.md ...... Foundation report
  📄 PHASE1_INTEGRATION_VERIFIED.md .... Integration report
  📄 QUICK_REFERENCE.md ................ This file
```

---

## Key Imports

```tsx
// Avatar state management
import { useImpExpression } from '@/hooks/useImpExpression';
const { state, setExpression, handleEvent } = useImpExpression();

// Chat API integration
import { useHermesChat } from '@/hooks/useHermesChat';
const { messages, sendMessage, isLoading, error } = useHermesChat();

// Avatar component
import { ImpAvatar } from '@/components/ImpAvatar';
<ImpAvatar expression="thinking" colorVariant="blue" size="md" />

// Types
import type { ImpExpression, ImpEvent } from '@/types/imp';
```

---

## Common Patterns

### Trigger Avatar Expression Change
```tsx
// Manual transition
setExpression('happy');

// Event-driven transition
handleEvent({
  type: 'ai_thinking',
  timestamp: new Date(),
});
```

### Send Chat Message
```tsx
const handleMessage = async (text: string) => {
  await sendMessage(text, 'analysis'); // mode is optional
};
```

### Render Avatar
```tsx
<ImpAvatar
  expression={impState.expression}
  colorVariant="blue"
  size="md"
  animated={true}
/>
```

---

## Expression States

| State | Display | Duration | Trigger |
|-------|---------|----------|---------|
| `idle` | Default IMP | ∞ | App default |
| `listening` | Wave animation | ∞ | User starts input |
| `thinking` | Thinking face | ∞ | API processing |
| `speaking` | Celebrate | ∞ | Token stream |
| `happy` | Celebrate | 2s | Tool success |
| `curious` | Celebrate | 2s | Discovery event |
| `focused` | Thinking | 1.5s | Tool execution |
| `playful` | Celebrate | 2.5s | Fun interaction |
| `warning` | Thinking | 3s | Alert state |
| `error` | Idle | 4s | Error occurred |
| `sleeping` | Idle | ∞ | Idle timeout |
| `offline` | Idle | ∞ | No connection |

---

## API Endpoints

**Hermes Chat**
```
POST /v1/hermes/chat

Request:
{
  message: string;
  mode?: string; // 'analysis', 'suggestions', etc.
  messages?: Array<{ role: string; content: string }>;
}

Response:
{
  response: string;
  mode: string;
  model: string; // e.g., 'mistral:latest'
  provider: string; // e.g., 'ollama'
  durationMs: number;
  sources: any[];
  evidenceStatus: string;
}

Authentication: Bearer <JWT_TOKEN> from localStorage
```

---

## Environment Variables

**Development** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

**Production** (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://wise2.net/api
```

**Backend** (`.env`):
```env
OLLAMA_CHAT_MODEL=mistral:latest
HERMES_ENDPOINT=http://127.0.0.1:11434/api/chat
HERMES_TIMEOUT_MS=90000
```

---

## Component Props

### `<ImpAvatar />`
```tsx
interface ImpAvatarProps {
  expression: ImpExpression;          // 'idle' | 'thinking' | ...
  colorVariant?: ImpColorVariant;     // 'blue' | 'gold' | 'green' | 'magenta'
  size?: 'sm' | 'md' | 'lg';         // Default: 'md'
  animated?: boolean;                 // CSS transitions, default: true
  className?: string;                 // Additional Tailwind classes
}
```

### `useImpExpression(initialExpr?, initialColor?)`
```tsx
function useImpExpression(
  initialExpression?: ImpExpression = 'idle',
  initialColorVariant?: ImpColorVariant = 'blue'
): {
  state: ImpState;
  setExpression: (expr: ImpExpression) => void;
  handleEvent: (event: ImpEvent) => void;
}
```

### `useHermesChat()`
```tsx
function useHermesChat(): {
  messages: HermesChatMessage[];
  isLoading: boolean;
  error: string | null;
  model: string;
  provider: string;
  sendMessage: (message: string, mode?: string) => Promise<void>;
  clearMessages: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
}
```

---

## State Machine Transitions

```
                    ┌─────────┐
                    │  IDLE   │◄─────────────┐
                    └────┬────┘              │
                         │                   │
         ┌───────────────┼───────────────┐   │
         │               │               │   │
    LISTENING        THINKING       SLEEPING │
         │               │               │   │
         └───────────────┼───────────────┘   │
                         │                   │
                    SPEAKING  ──┬─────────────┤
                         │      │             │
           ┌─────────────┤      └─ HAPPY ─────┤
           │             │                    │
        CURIOUS    ┌─ PLAYFUL              OFFLINE
           │       │
      FOCUSED     │
```

**Valid Transitions**: See `EXPRESSION_TRANSITIONS` in `types/imp.ts`

---

## Testing Checklist

- [ ] Avatar renders without errors
- [ ] Expression changes when sending message
- [ ] Avatar shows "listening" while user types
- [ ] Avatar shows "thinking" while API processes
- [ ] Avatar shows "speaking" when response arrives
- [ ] Messages appear in correct order
- [ ] Errors display if API fails
- [ ] Model/provider info displays
- [ ] Clear history button works
- [ ] Quick actions trigger messages

---

## Common Issues & Solutions

**Avatar not showing?**
- Check graphics path: `/wise-imp/{state}-{color}.{png|webp}`
- Verify WebP support (fallback to PNG)
- Check browser console for 404 errors

**Messages not sending?**
- Verify JWT token in localStorage
- Check API_URL environment variable
- Verify Hermes service running on backend
- Check browser console for network errors

**Expression not changing?**
- Verify `handleEvent()` is being called
- Check EXPRESSION_TRANSITIONS rules (may be invalid transition)
- Inspect impState.expression in React DevTools

**API timeout?**
- Increase `HERMES_TIMEOUT_MS` (default: 90000ms)
- Verify Ollama/Hermes service is responsive
- Check network latency to API server

---

## Developer Workflow

### 1. Start Development Server
```bash
npm run dev --workspace=apps/dashboard   # Port 3002
npm run dev --workspace=packages/api      # Port 3010
```

### 2. Test in Browser
```
http://localhost:3002
→ Navigate to dashboard
→ Find AI Assistant panel
→ Test avatar + messages
```

### 3. Monitor in DevTools
```
Network tab: Verify POST /api/v1/hermes/chat
Console: Check for errors/warnings
Elements: Inspect avatar img src
React DevTools: Check impState updates
```

### 4. Make Changes
```bash
# Edit component
vim apps/dashboard/app/components/AIAssistant.tsx

# HMR refreshes automatically
# Verify in browser
```

---

## Performance Notes

- **Avatar rendering**: WebP < PNG < SVG (size/performance)
- **Message history**: Capped at 10 messages (sent to API)
- **Event debouncing**: Not needed (state machine is fast)
- **Image loading**: Lazy loading enabled
- **Callback memoization**: All hooks properly memoized

---

## Security Notes

- **JWT Token**: Stored in localStorage (secure for SPA)
- **API auth**: Bearer token in Authorization header
- **CORS**: Configured on backend
- **No secrets**: No API keys in frontend code
- **Environment config**: Different URLs for dev/prod

---

## Phase 2 Preparation

Phase 2 will add streaming. Current setup already supports:
- ✅ Event-driven architecture (ready for stream events)
- ✅ Expression state machine (ready for stream state changes)
- ✅ Hermes API integration (ready to add SSE support)
- ✅ Avatar animation (ready for advanced animations)

No breaking changes needed for Phase 2.

---

**Last Updated**: 2026-08-17  
**Phase**: 1 (Foundation)  
**Status**: Complete ✅
