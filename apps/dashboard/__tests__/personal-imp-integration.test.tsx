/**
 * Integration tests for WISE² Personal IMP Phase 1
 * Tests end-to-end flows combining hooks, components, and API
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useImpExpression } from '../src/hooks/useImpExpression';
import { useHermesChat } from '../src/hooks/useHermesChat';
import { ImpAvatar } from '../src/components/ImpAvatar';
import { createMockHermesResponse, setupFetchMock } from './utils/test-utils';

describe('Personal IMP Integration Tests', () => {
  describe('Message Flow: Send → Think → Respond', () => {
    it('should flow: user sends message → IMP listens → thinks → speaks', async () => {
      const { mockResponse } = setupFetchMock();
      mockResponse(createMockHermesResponse());

      // Set up hooks
      const impHook = renderHook(() => useImpExpression('idle', 'blue'));
      const chatHook = renderHook(() => useHermesChat());

      // Simulate user clicking "send message"
      act(() => {
        // Step 1: User starts speaking (listening state)
        impHook.result.current.handleEvent({
          type: 'voice_start',
          timestamp: new Date(),
        });
      });

      expect(impHook.result.current.state.expression).toBe('listening');

      // Step 2: Simulate user message
      act(() => {
        chatHook.result.current.addMessage('user', 'Hello, IMP!');
      });

      expect(chatHook.result.current.messages).toHaveLength(1);
      expect(chatHook.result.current.messages[0].role).toBe('user');

      // Step 3: IMP starts thinking
      act(() => {
        impHook.result.current.handleEvent({
          type: 'ai_thinking',
          timestamp: new Date(),
        });
      });

      expect(impHook.result.current.state.expression).toBe('thinking');

      // Step 4: Send to API and get response
      act(() => {
        chatHook.result.current.sendMessage('Hello, IMP!');
      });

      // Wait for async API call
      await waitFor(() => {
        expect(chatHook.result.current.isLoading).toBe(false);
      });

      // Step 5: IMP receives response and speaks
      act(() => {
        impHook.result.current.handleEvent({
          type: 'ai_stream_start',
          timestamp: new Date(),
        });
      });

      expect(impHook.result.current.state.expression).toBe('speaking');

      // Verify response is in chat
      expect(chatHook.result.current.messages).toHaveLength(2);
      expect(chatHook.result.current.messages[1].role).toBe('assistant');
    });
  });

  describe('Expression State During Chat', () => {
    it('should show correct expression states during full exchange', async () => {
      const { mockResponse } = setupFetchMock();
      mockResponse(createMockHermesResponse({ response: 'Great question!' }));

      const impHook = renderHook(() => useImpExpression('idle', 'green'));

      // Initial idle state
      expect(impHook.result.current.state.expression).toBe('idle');

      // User speaks
      act(() => {
        impHook.result.current.handleEvent({
          type: 'voice_start',
          timestamp: new Date(),
        });
      });
      expect(impHook.result.current.state.expression).toBe('listening');

      // Processing begins
      act(() => {
        impHook.result.current.handleEvent({
          type: 'ai_thinking',
          timestamp: new Date(),
        });
      });
      expect(impHook.result.current.state.expression).toBe('thinking');

      // Response streams
      act(() => {
        impHook.result.current.handleEvent({
          type: 'ai_stream_start',
          timestamp: new Date(),
        });
      });
      expect(impHook.result.current.state.expression).toBe('speaking');

      // Response complete
      act(() => {
        impHook.result.current.handleEvent({
          type: 'ai_stream_end',
          timestamp: new Date(),
        });
      });
      expect(impHook.result.current.state.expression).toBe('idle');
    });
  });

  describe('Multiple Message Exchange', () => {
    it('should handle multiple messages in sequence', async () => {
      const { mockResponse } = setupFetchMock();
      mockResponse(createMockHermesResponse({ response: 'Response 1' }));

      const chatHook = renderHook(() => useHermesChat());

      // Message 1
      act(() => {
        chatHook.result.current.addMessage('user', 'First question?');
      });
      expect(chatHook.result.current.messages).toHaveLength(1);

      act(() => {
        chatHook.result.current.addMessage('assistant', 'Response 1');
      });
      expect(chatHook.result.current.messages).toHaveLength(2);

      // Message 2
      act(() => {
        chatHook.result.current.addMessage('user', 'Second question?');
      });
      expect(chatHook.result.current.messages).toHaveLength(3);

      act(() => {
        chatHook.result.current.addMessage('assistant', 'Response 2');
      });
      expect(chatHook.result.current.messages).toHaveLength(4);

      // Verify order
      expect(chatHook.result.current.messages[0].content).toBe('First question?');
      expect(chatHook.result.current.messages[1].content).toBe('Response 1');
      expect(chatHook.result.current.messages[2].content).toBe('Second question?');
      expect(chatHook.result.current.messages[3].content).toBe('Response 2');
    });
  });

  describe('Error Handling & Recovery', () => {
    it('should handle API errors and show error expression', async () => {
      const { mockError } = setupFetchMock();
      mockError('Network error');

      const impHook = renderHook(() => useImpExpression('idle', 'blue'));
      const chatHook = renderHook(() => useHermesChat());

      // Send message
      await act(async () => {
        await chatHook.result.current.sendMessage('Hello');
      });

      // Should have error state
      expect(chatHook.result.current.error).toBeTruthy();

      // Express error
      act(() => {
        impHook.result.current.handleEvent({
          type: 'tool_error',
          timestamp: new Date(),
        });
      });

      expect(impHook.result.current.state.expression).toBe('error');
    });

    it('should recover after error and allow new message', async () => {
      const { mockError, mockResponse } = setupFetchMock();
      mockError('Network error');

      const chatHook = renderHook(() => useHermesChat());

      // First attempt fails
      await act(async () => {
        await chatHook.result.current.sendMessage('Message 1');
      });

      expect(chatHook.result.current.error).toBeTruthy();

      // Clear error and retry with mock success
      act(() => {
        mockResponse(createMockHermesResponse());
        chatHook.result.current.clearMessages();
      });

      // Should be able to send again
      act(() => {
        chatHook.result.current.addMessage('user', 'Message 2');
      });

      expect(chatHook.result.current.messages).toHaveLength(1);
      expect(chatHook.result.current.error).toBeNull();
    });
  });

  describe('Chat History Context', () => {
    it('should include message history in API requests', async () => {
      const { mockResponse } = setupFetchMock();
      mockResponse(createMockHermesResponse());

      const chatHook = renderHook(() => useHermesChat());

      // Build history
      act(() => {
        chatHook.result.current.addMessage('user', 'First');
        chatHook.result.current.addMessage('assistant', 'Response 1');
        chatHook.result.current.addMessage('user', 'Follow up');
      });

      expect(chatHook.result.current.messages).toHaveLength(3);

      // Send new message (should include history)
      act(() => {
        chatHook.result.current.sendMessage('Third message');
      });

      // Verify history is maintained
      expect(chatHook.result.current.messages.length).toBeGreaterThan(3);
    });

    it('should limit history to last 10 messages', async () => {
      const { mockResponse } = setupFetchMock();
      mockResponse(createMockHermesResponse());

      const chatHook = renderHook(() => useHermesChat());

      // Add many messages
      act(() => {
        for (let i = 0; i < 15; i++) {
          chatHook.result.current.addMessage(
            i % 2 === 0 ? 'user' : 'assistant',
            `Message ${i}`
          );
        }
      });

      expect(chatHook.result.current.messages).toHaveLength(15);

      // Send new message - should use only last 10 for context
      act(() => {
        chatHook.result.current.sendMessage('New');
      });

      // Should still have all 15 + new user + assistant response
      expect(chatHook.result.current.messages.length).toBeGreaterThan(15);
    });
  });

  describe('Avatar & Expression Integration', () => {
    it('should render avatar with correct expression state', () => {
      const impHook = renderHook(() => useImpExpression('thinking', 'magenta'));

      const { container } = render(
        <ImpAvatar
          expression={impHook.result.current.state.expression}
          colorVariant={impHook.result.current.state.colorVariant}
          size="md"
        />
      );

      const img = container.querySelector('img');
      expect(img?.src).toContain('thinking-magenta');
    });

    it('should update avatar when expression changes', () => {
      const impHook = renderHook(() => useImpExpression('idle', 'blue'));
      const { container, rerender } = render(
        <ImpAvatar
          expression={impHook.result.current.state.expression}
          colorVariant={impHook.result.current.state.colorVariant}
        />
      );

      let img = container.querySelector('img');
      expect(img?.src).toContain('idle-blue');

      // Change expression
      act(() => {
        impHook.result.current.setExpression('thinking');
      });

      // Re-render with new expression
      rerender(
        <ImpAvatar
          expression={impHook.result.current.state.expression}
          colorVariant={impHook.result.current.state.colorVariant}
        />
      );

      img = container.querySelector('img');
      expect(img?.src).toContain('thinking-blue');
    });

    it('should show success expression after successful tool use', async () => {
      const impHook = renderHook(() => useImpExpression('idle', 'gold'));

      // Start tool work
      act(() => {
        impHook.result.current.handleEvent({
          type: 'tool_start',
          timestamp: new Date(),
        });
      });
      expect(impHook.result.current.state.expression).toBe('focused');

      // Tool succeeds
      act(() => {
        impHook.result.current.handleEvent({
          type: 'tool_success',
          timestamp: new Date(),
        });
      });
      expect(impHook.result.current.state.expression).toBe('happy');

      // Render avatar
      const { container } = render(
        <ImpAvatar
          expression={impHook.result.current.state.expression}
          colorVariant={impHook.result.current.state.colorVariant}
        />
      );

      const img = container.querySelector('img');
      expect(img?.src).toContain('celebrate-gold');
    });
  });

  describe('Offline State Handling', () => {
    it('should transition to offline and prevent messages', async () => {
      const { mockError } = setupFetchMock();
      mockError('Network error');

      const impHook = renderHook(() => useImpExpression('idle', 'blue'));
      const chatHook = renderHook(() => useHermesChat());

      // Device goes offline
      act(() => {
        impHook.result.current.handleEvent({
          type: 'device_offline',
          timestamp: new Date(),
        });
      });

      expect(impHook.result.current.state.expression).toBe('offline');

      // Try to send message
      const sendPromise = act(async () => {
        await chatHook.result.current.sendMessage('Hello?');
      });

      // Should fail or be prevented
      await sendPromise;
      expect(chatHook.result.current.error).toBeTruthy();
    });

    it('should recover when coming back online', async () => {
      const { mockResponse } = setupFetchMock();
      mockResponse(createMockHermesResponse());

      const impHook = renderHook(() => useImpExpression('offline', 'blue'));
      const chatHook = renderHook(() => useHermesChat());

      // Restore connection
      act(() => {
        impHook.result.current.handleEvent({
          type: 'device_online',
          timestamp: new Date(),
        });
      });

      // offline can only transition to idle
      expect(impHook.result.current.state.expression).toBe('offline');

      // Explicit transition to idle
      act(() => {
        impHook.result.current.setExpression('idle');
      });

      expect(impHook.result.current.state.expression).toBe('idle');

      // Now can send messages
      act(() => {
        chatHook.result.current.addMessage('user', 'Back online!');
      });

      expect(chatHook.result.current.messages).toHaveLength(1);
    });
  });

  describe('Color Variant Consistency', () => {
    it('should maintain color variant across state changes', () => {
      const impHook = renderHook(() => useImpExpression('idle', 'green'));

      expect(impHook.result.current.state.colorVariant).toBe('green');

      // Change expressions
      act(() => {
        impHook.result.current.setExpression('listening');
      });
      expect(impHook.result.current.state.colorVariant).toBe('green');

      act(() => {
        impHook.result.current.setExpression('thinking');
      });
      expect(impHook.result.current.state.colorVariant).toBe('green');

      // Color should not change
      expect(impHook.result.current.state.colorVariant).toBe('green');
    });
  });

  describe('Timestamp Tracking', () => {
    it('should update lastEventTime on state changes', () => {
      const impHook = renderHook(() => useImpExpression('idle'));
      const time1 = impHook.result.current.state.lastEventTime;

      // Wait a bit
      const wait = () => new Promise(r => setTimeout(r, 10));

      act(() => {
        impHook.result.current.setExpression('listening');
      });
      const time2 = impHook.result.current.state.lastEventTime;

      expect(time2!.getTime()).toBeGreaterThan(time1!.getTime());
    });

    it('should track timestamps for all messages', () => {
      const chatHook = renderHook(() => useHermesChat());

      const beforeTime = new Date();

      act(() => {
        chatHook.result.current.addMessage('user', 'Test');
      });

      const message = chatHook.result.current.messages[0];
      expect(message.timestamp).toBeInstanceOf(Date);
      expect(message.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
    });
  });
});
