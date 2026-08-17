'use client';

import { useState, useCallback, useRef } from 'react';

export interface StreamingMetrics {
  tokenCount: number;
  wordsPerSecond: number;
  timeToFirstToken: number | null;
  elapsedMs: number;
}

export interface HermesChatStreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseHermesChatStreamReturn {
  messages: HermesChatStreamMessage[];
  streamingMessage: string;
  isStreaming: boolean;
  canAbort: boolean;
  error: string | null;
  model: string;
  provider: string;
  metrics: StreamingMetrics;
  sendMessageStream: (message: string, mode?: string) => Promise<void>;
  abortStream: () => void;
  clearMessages: () => void;
}

/**
 * Get JWT token from localStorage
 * Tries multiple common key names for compatibility
 */
function getAuthToken(): string {
  if (typeof localStorage === 'undefined') return '';

  return (
    localStorage.getItem('wise2_access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

/**
 * Get Hermes API base URL from environment or fallback
 */
function getApiUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    return '/api';
  }

  return 'http://localhost:3002/api';
}

/**
 * Generate a unique ID for messages
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * useHermesChatStream - React Hook for streaming Hermes Chat
 *
 * Provides real-time token streaming with SSE integration, performance metrics,
 * abort capability, and full message history management.
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   streamingMessage,
 *   isStreaming,
 *   metrics,
 *   sendMessageStream,
 *   abortStream,
 * } = useHermesChatStream();
 *
 * const handleSend = async () => {
 *   await sendMessageStream('Hello!');
 * };
 * ```
 */
export function useHermesChatStream(): UseHermesChatStreamReturn {
  const [messages, setMessages] = useState<HermesChatStreamMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('');
  const [metrics, setMetrics] = useState<StreamingMetrics>({
    tokenCount: 0,
    wordsPerSecond: 0,
    timeToFirstToken: null,
    elapsedMs: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const ttftRef = useRef<number | null>(null);

  /**
   * Add a message to the history
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: HermesChatStreamMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  /**
   * Send a message to Hermes with SSE streaming
   */
  const sendMessageStream = useCallback(
    async (message: string, mode?: string): Promise<void> => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        setError('Message cannot be empty');
        return;
      }

      setError(null);
      setStreamingMessage('');
      setIsStreaming(true);
      setMetrics({ tokenCount: 0, wordsPerSecond: 0, timeToFirstToken: null, elapsedMs: 0 });
      startTimeRef.current = Date.now();
      ttftRef.current = null;

      try {
        // Add user message
        addMessage('user', trimmedMessage);

        // Build request
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const endpoint = `${apiUrl}/v1/hermes/chat/stream?message=${encodeURIComponent(trimmedMessage)}${mode ? `&mode=${mode}` : ''}`;

        abortControllerRef.current = new AbortController();

        const fetchOptions: RequestInit = {
          method: 'GET',
          signal: abortControllerRef.current.signal,
        };

        if (token) {
          fetchOptions.headers = {
            Authorization: `Bearer ${token}`,
          };
        }

        const response = await fetch(endpoint, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
          setError(errorMsg);
          addMessage('assistant', `Error: ${errorMsg}`);
          setIsStreaming(false);
          return;
        }

        if (!response.body) {
          setError('Response body not readable');
          setIsStreaming(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedMessage = '';
        let tokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;

            // Parse SSE format: "event: token\ndata: {...}\n\n"
            if (line.startsWith('event: ')) {
              continue;
            }

            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.token) {
                  tokenCount++;
                  accumulatedMessage += data.token;

                  if (ttftRef.current === null) {
                    ttftRef.current = Date.now() - startTimeRef.current;
                  }

                  setStreamingMessage(accumulatedMessage);

                  const elapsedMs = Date.now() - startTimeRef.current;
                  const words = accumulatedMessage.split(/\s+/).length;
                  const wordsPerSecond = (words / elapsedMs) * 1000;

                  setMetrics({
                    tokenCount,
                    wordsPerSecond: Math.max(0, wordsPerSecond),
                    timeToFirstToken: ttftRef.current,
                    elapsedMs,
                  });
                }

                if (data.type === 'done') {
                  if (accumulatedMessage) {
                    addMessage('assistant', accumulatedMessage);
                  }
                  setStreamingMessage('');
                  setIsStreaming(false);
                  return;
                }

                if (data.type === 'error') {
                  setError(data.message);
                  addMessage('assistant', `Error: ${data.message}`);
                  setIsStreaming(false);
                  return;
                }
              } catch {
                // Malformed JSON, skip
                continue;
              }
            }
          }
        }

        // Handle remaining buffer
        if (buffer.trim().startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.slice(6));
            if (data.token) {
              accumulatedMessage += data.token;
              setStreamingMessage(accumulatedMessage);
            }
            if (data.type === 'done' && accumulatedMessage) {
              addMessage('assistant', accumulatedMessage);
            }
          } catch {
            // Ignore
          }
        }

        setStreamingMessage('');
        setIsStreaming(false);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          const errorMsg = err.message;
          setError(errorMsg);
          addMessage('assistant', `Error: ${errorMsg}`);
        }
        setStreamingMessage('');
        setIsStreaming(false);
      }
    },
    [addMessage],
  );

  /**
   * Abort an in-progress stream
   */
  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamingMessage) {
      addMessage('assistant', streamingMessage);
    }
    setStreamingMessage('');
    setIsStreaming(false);
  }, [streamingMessage, addMessage]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingMessage('');
  }, []);

  return {
    messages,
    streamingMessage,
    isStreaming,
    canAbort: isStreaming,
    error,
    model,
    provider,
    metrics,
    sendMessageStream,
    abortStream,
    clearMessages,
  };
}
