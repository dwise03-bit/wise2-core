# Dashboard Hooks Library

## Overview

This directory contains production-ready React hooks for the WISE² Dashboard application.

## Available Hooks

### 1. useHermesChat

**Purpose**: Manage chat interactions with the Hermes AI agent

**Location**: `useHermesChat.ts`

**Key Features**:
- Full conversation history management
- JWT-based authentication via localStorage
- Automatic model/provider tracking
- Comprehensive error handling
- Network resilience
- Memoized callbacks for performance

**Basic Usage**:
```tsx
import { useHermesChat } from '@/hooks';

const { messages, sendMessage, isLoading, error } = useHermesChat();

// Send a message
await sendMessage('Hello, Hermes!');

// Clear history
clearMessages();

// Manually add a message
addMessage('assistant', 'Response from Hermes');
```

**State Management**:
```tsx
{
  messages,      // Array<HermesChatMessage>
  isLoading,     // boolean
  error,         // string | null
  model,         // string (e.g., "gpt-4")
  provider,      // string (e.g., "openai")
  sendMessage,   // (message: string, mode?: string) => Promise<void>
  clearMessages, // () => void
  addMessage,    // (role: 'user'|'assistant', content: string) => void
}
```

**API Integration**:
- Endpoint: `POST /v1/hermes/chat`
- Base URL: 
  - Local: `http://localhost:3011/api`
  - Production: `/api` (relative to current domain)
- Authentication: JWT Bearer token from localStorage

**Error Handling**:
- Network errors: "Network error: Unable to reach Hermes service"
- 401 Unauthorized: "Authentication failed. Please log in again."
- 403 Forbidden: "Access denied. You do not have permission to use Hermes."
- Validation: "Message cannot be empty"
- Parse errors: User-friendly error messages

**Advanced Features**:
- Mode-specific queries: `sendMessage(text, 'analysis')`
- Multi-turn conversations with automatic context
- Last 10 messages included per request
- Timestamps for all messages
- Unique message IDs

### 2. useImpExpression

**Purpose**: Manage WISE² IMP avatar expression state and animations

**Location**: `useImpExpression.ts`

**Key Features**:
- Expression state machine validation
- Automatic transitions based on duration
- Event-driven state changes
- Type-safe expression transitions

**See**: `useImpExpression.ts` for detailed documentation

## Installation & Import

### From Another Component

```tsx
// Option 1: Import from hooks index
import { useHermesChat } from '@/hooks';

// Option 2: Import directly
import { useHermesChat } from '@/hooks/useHermesChat';

// Option 3: Import types
import { 
  useHermesChat,
  type HermesChatMessage,
  type UseHermesChatReturn
} from '@/hooks';
```

## File Structure

```
src/hooks/
├── README.md                 # This file
├── USAGE_EXAMPLES.md        # Comprehensive examples and patterns
├── index.ts                 # Central export point
├── useHermesChat.ts         # Hermes AI chat hook
└── useImpExpression.ts      # IMP avatar expression hook
```

## TypeScript Support

All hooks include full TypeScript type definitions:

```tsx
// useHermesChat types
HermesChatMessage   // Single message structure
HermesResponse      // API response
HermesChatRequest   // API request
UseHermesChatState  // Hook state
UseHermesChatReturn // Complete hook return type

// useImpExpression types
UseImpExpressionReturn  // Hook return type
```

## Development Workflow

### Adding a New Hook

1. Create a new file: `src/hooks/useYourHook.ts`
2. Export types and hook function
3. Add to `index.ts` exports
4. Document in this README
5. Add usage examples to `USAGE_EXAMPLES.md`

### Testing Hooks

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHermesChat } from '@/hooks';

describe('useHermesChat', () => {
  it('sends and receives messages', async () => {
    const { result } = renderHook(() => useHermesChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });
  });
});
```

## API Reference

### useHermesChat

**Function Signature**:
```tsx
function useHermesChat(): UseHermesChatReturn
```

**Returns**:
```tsx
{
  // State
  messages: HermesChatMessage[];
  isLoading: boolean;
  error: string | null;
  model: string;
  provider: string;
  
  // Methods
  sendMessage(message: string, mode?: string): Promise<void>;
  clearMessages(): void;
  addMessage(role: 'user' | 'assistant', content: string): void;
}
```

**Parameters**:
- `sendMessage(message, mode?)`
  - `message`: Non-empty string to send
  - `mode`: Optional mode parameter (e.g., 'analysis', 'summarization')

**Returns**: Promise that resolves when message is sent and response received

## Authentication

The hook handles JWT authentication automatically:

1. **Token Storage**: Checks these localStorage keys (in order):
   - `wise2_access_token`
   - `auth_token`
   - `authToken`

2. **Request Headers**: Automatically adds:
   ```
   Authorization: Bearer ${token}
   Content-Type: application/json
   ```

3. **Error Handling**: Catches and reports auth failures gracefully

## Performance Considerations

1. **Memoization**: All callbacks memoized with `useCallback`
2. **History Limiting**: Only last 10 messages sent per request
3. **Batch Updates**: Minimal re-renders via state batching
4. **Error Clearing**: Previous errors cleared before new requests

## Environment Configuration

### Local Development
- API URL: `http://localhost:3011/api`
- Requires Hermes service running on port 3011

### Production
- API URL: `/api` (relative to current domain)
- Hermes accessible via nginx reverse proxy

### Custom Configuration

To override API URL, modify `getHermesApiUrl()` in `useHermesChat.ts`:

```tsx
function getHermesApiUrl(): string {
  // Custom logic here
  return 'https://custom-api.example.com/api';
}
```

## Troubleshooting

### Issue: Network error connecting to Hermes

**Solutions**:
1. Verify Hermes service is running
2. Check API URL configuration
3. Look for CORS errors in browser console
4. Verify firewall allows port 3011

### Issue: Authentication failed

**Solutions**:
1. Check JWT token is in localStorage
2. Verify token hasn't expired
3. Check Authorization header in Network tab
4. Try logging in again

### Issue: Messages not appearing

**Solutions**:
1. Check `addMessage()` is called with valid role
2. Verify message content is not empty
3. Check browser console for JavaScript errors
4. Inspect Network tab for API responses

### Issue: Performance degradation

**Solutions**:
1. Clear message history periodically with `clearMessages()`
2. Avoid excessive re-renders of message lists
3. Use React.memo for message components
4. Profile with React DevTools

## Best Practices

1. **Always await sendMessage**:
   ```tsx
   await sendMessage(text);
   ```

2. **Check loading state before sending**:
   ```tsx
   if (!isLoading && text.trim()) {
     await sendMessage(text);
   }
   ```

3. **Display errors to users**:
   ```tsx
   {error && <Alert type="error">{error}</Alert>}
   ```

4. **Clear conversation when starting fresh**:
   ```tsx
   const handleNewChat = () => clearMessages();
   ```

5. **Show model/provider info**:
   ```tsx
   <span>Using {model} via {provider}</span>
   ```

## Documentation

- **USAGE_EXAMPLES.md**: Comprehensive code examples and patterns
- **useHermesChat.ts**: Inline JSDoc documentation
- **useImpExpression.ts**: Expression state machine documentation

## Related Documentation

- **Dashboard Setup**: `apps/dashboard/README.md`
- **API Integration**: `packages/api/src/routes/hermes.ts`
- **Auth System**: `packages/shared/src/auth.constants.ts`

## Version History

### v1.0.0 (2026-08-17)
- Initial release of `useHermesChat`
- Full JWT authentication support
- Comprehensive error handling
- Production-ready implementation

## Support

For issues or questions:
1. Check `USAGE_EXAMPLES.md` for examples
2. Review inline JSDoc in hook source
3. Check browser console for errors
4. Verify API service is running
5. Contact WISE² development team

## License

Part of WISE² Genesis - All rights reserved
