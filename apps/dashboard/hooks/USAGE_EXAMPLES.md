# useHermesChat Hook - Usage Guide

## Overview

`useHermesChat` is a production-ready React hook for integrating Hermes AI chat into your dashboard. It manages chat state, API communication, message history, and error handling.

## Installation

The hook is located at `/apps/dashboard/src/hooks/useHermesChat.ts` and exported from `/apps/dashboard/src/hooks/index.ts`.

```tsx
import { useHermesChat } from '@/hooks';
```

## Basic Usage

```tsx
import { useHermesChat } from '@/hooks';

export function ChatComponent() {
  const { messages, sendMessage, isLoading, error } = useHermesChat();

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <div>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSend(e.currentTarget.value);
        }}
        disabled={isLoading}
      />
    </div>
  );
}
```

## API Reference

### Hook State

```tsx
const {
  messages,        // Array<HermesChatMessage> - Full chat history
  isLoading,       // boolean - API request in progress
  error,           // string | null - Last error message
  model,           // string - Current AI model name
  provider,        // string - Current AI provider name
  sendMessage,     // Function - Send a message
  clearMessages,   // Function - Clear all messages
  addMessage,      // Function - Manually add a message
} = useHermesChat();
```

### HermesChatMessage

```tsx
interface HermesChatMessage {
  id: string;                    // Unique message ID
  role: 'user' | 'assistant';   // Message sender
  content: string;               // Message text
  timestamp: Date;               // When message was created
}
```

### sendMessage(message, mode?)

Sends a message to Hermes API.

```tsx
// Basic usage
await sendMessage('Hello, Hermes!');

// With mode parameter
await sendMessage('Analyze this data', 'analysis');

// Error handling
try {
  await sendMessage(userInput);
} catch (err) {
  console.error('Failed to send message:', err);
}
```

### clearMessages()

Clears all messages and errors from state.

```tsx
const handleNewConversation = () => {
  clearMessages();
};
```

### addMessage(role, content)

Manually add a message to history (useful for system messages or pre-populated content).

```tsx
// Add a system message
addMessage('assistant', 'System: Hermes is ready to help');

// Add context before starting chat
addMessage('user', 'Context: I am working on a React dashboard');
```

## Advanced Examples

### Chat Component with Input

```tsx
'use client';

import { useState } from 'react';
import { useHermesChat } from '@/hooks';
import { Button } from '@/components/ui';

export function HermesChatBox() {
  const { messages, sendMessage, isLoading, error, model, provider } = useHermesChat();
  const [input, setInput] = useState('');

  const handleSendClick = async () => {
    if (!input.trim() || isLoading) return;
    
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Model Info */}
      {(model || provider) && (
        <div className="text-xs text-muted">
          {model} ({provider})
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.length === 0 && !error && (
          <div className="text-center text-muted py-8">
            Start a conversation with Hermes...
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-3 rounded ${
              msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
            }`}
          >
            <div className="text-sm font-semibold">
              {msg.role === 'user' ? 'You' : 'Hermes'}
            </div>
            <div className="text-sm mt-1">{msg.content}</div>
            <div className="text-xs text-muted mt-1">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {error && (
          <div className="p-3 bg-red-100 rounded border border-red-300">
            <div className="text-sm font-semibold text-red-900">Error</div>
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {isLoading && (
          <div className="p-3 bg-gray-100 rounded animate-pulse">
            Hermes is thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="flex-1 p-2 border rounded disabled:opacity-50"
          rows={3}
        />
        <Button
          onClick={handleSendClick}
          disabled={isLoading || !input.trim()}
          variant="primary"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
```

### Mode-Specific Queries

```tsx
export function AnalysisChat() {
  const { messages, sendMessage, isLoading } = useHermesChat();

  const handleAnalyze = async (data: string) => {
    // Send with mode parameter
    await sendMessage(`Analyze: ${data}`, 'analysis');
  };

  const handleSummarize = async (text: string) => {
    await sendMessage(`Summarize: ${text}`, 'summarization');
  };

  return (
    <div className="space-y-4">
      <button onClick={() => handleAnalyze('data.json')}>
        Analyze Data
      </button>
      <button onClick={() => handleSummarize('long_text.txt')}>
        Summarize Text
      </button>
      {/* Display messages */}
    </div>
  );
}
```

### Multi-Turn Conversation

```tsx
export function ConversationManager() {
  const { messages, sendMessage, clearMessages } = useHermesChat();

  const startNewTopic = async () => {
    clearMessages();
    await sendMessage('Let\'s discuss a new topic.');
  };

  const continueConversation = async (followUp: string) => {
    // Messages are automatically included in request
    await sendMessage(followUp);
  };

  return (
    <div>
      <button onClick={startNewTopic}>New Topic</button>
      {/* Messages shown with full context */}
      <div>Message count: {messages.length}</div>
    </div>
  );
}
```

## Authentication

The hook automatically handles JWT authentication:

1. **Token Lookup**: Checks localStorage for these keys (in order):
   - `wise2_access_token`
   - `auth_token`
   - `authToken`

2. **Header Injection**: Adds `Authorization: Bearer ${token}` to all requests

3. **Error Handling**: 
   - 401 errors: "Authentication failed. Please log in again."
   - 403 errors: "Access denied."

## API Endpoints

The hook automatically constructs the correct API endpoint:

### Local Development
```
POST http://localhost:3011/api/v1/hermes/chat
```

### Production
```
POST https://wise2.net/api/v1/hermes/chat
```

## Error Handling

The hook provides comprehensive error handling:

```tsx
const { error, sendMessage } = useHermesChat();

// Network errors
// "Network error: Unable to reach Hermes service"

// Authentication errors
// "Authentication failed. Please log in again."

// API errors
// "Failed to get response: [error message from server]"

// Message validation
// "Message cannot be empty"
```

## Performance Considerations

1. **Memoization**: All callback functions use `useCallback` to prevent unnecessary re-renders
2. **Message History**: Automatically limited to last 10 messages per request for optimal API performance
3. **State Updates**: Uses batch updates to minimize re-renders
4. **Error Clearing**: Automatically clears previous errors on new message

## Best Practices

1. **Always await sendMessage**: The function returns a Promise
   ```tsx
   await sendMessage(text);
   ```

2. **Check isLoading before sending**: Prevent duplicate requests
   ```tsx
   if (!isLoading && text.trim()) {
     await sendMessage(text);
   }
   ```

3. **Display model/provider info**: Show users what model is being used
   ```tsx
   <div>Using: {model} via {provider}</div>
   ```

4. **Handle errors gracefully**: Show user-friendly error messages
   ```tsx
   {error && <ErrorAlert message={error} />}
   ```

5. **Clear conversation when starting fresh**: Use `clearMessages()` for new topics
   ```tsx
   const handleNewChat = () => {
     clearMessages();
   };
   ```

## Testing

Example test with React Testing Library:

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHermesChat } from '@/hooks';

describe('useHermesChat', () => {
  it('should send and receive messages', async () => {
    const { result } = renderHook(() => useHermesChat());

    act(() => {
      result.current.addMessage('user', 'Hello');
    });

    expect(result.current.messages).toHaveLength(1);
  });

  it('should handle send message', async () => {
    const { result } = renderHook(() => useHermesChat());

    act(() => {
      result.current.sendMessage('Test message');
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });

  it('should clear messages', () => {
    const { result } = renderHook(() => useHermesChat());

    act(() => {
      result.current.addMessage('user', 'Hello');
    });

    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
  });
});
```

## TypeScript Types

Full type definitions are available for IDE autocomplete:

```tsx
import {
  useHermesChat,
  type HermesChatMessage,
  type HermesResponse,
  type HermesChatRequest,
  type UseHermesChatState,
  type UseHermesChatReturn,
} from '@/hooks';
```

## Troubleshooting

### "Network error: Unable to reach Hermes service"
- Check that Hermes API is running
- Verify API URL is correct (localhost:3011 for development)
- Check browser console for CORS errors

### "Authentication failed. Please log in again."
- Ensure JWT token is stored in localStorage with correct key
- Verify token hasn't expired
- Check that Authorization header is being sent

### Messages not appearing
- Check that `addMessage()` is being called with correct role ('user' or 'assistant')
- Verify message content is not empty
- Check browser DevTools Network tab for API responses

### Slow responses
- Check Hermes API performance
- Verify network connection
- Check model/provider settings

## Implementation Details

The hook manages the following internally:

1. **Message Generation**: Unique IDs with timestamps for each message
2. **History Context**: Automatically includes last 10 messages in requests
3. **Token Management**: Looks up JWT from localStorage
4. **URL Construction**: Detects environment (local/production) automatically
5. **Error Recovery**: Maintains message history even on errors
6. **State Cleanup**: Provides clearMessages() for resetting conversation

## Support

For issues or questions, contact the WISE² development team or check the main repository documentation.
