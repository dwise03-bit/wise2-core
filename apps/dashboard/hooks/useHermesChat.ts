/**
 * useHermesChat - React Hook for Hermes Chat Integration
 * Manages chat state, API communication, and message history for Hermes AI
 *
 * Features:
 * - JWT-based authentication via localStorage
 * - Full message history tracking with timestamps
 * - Automatic model/provider information capture
 * - Graceful error handling for network and API errors
 * - Memoized callback functions for performance
 */

import { useState, useCallback } from 'react';

/**
 * Chat message structure
 */
export interface HermesChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Hermes API response structure
 */
export interface HermesResponse {
  response: string;
  mode: string;
  model: string;
  provider: string;
  durationMs: number;
  sources: Array<Record<string, unknown>>;
  evidenceStatus: string;
}

/**
 * Hermes API request payload structure
 */
export interface HermesChatRequest {
  message: string;
  mode?: string;
  messages?: Array<{ role: string; content: string }>;
}

/**
 * useHermesChat Hook State
 */
export interface UseHermesChatState {
  messages: HermesChatMessage[];
  isLoading: boolean;
  error: string | null;
  model: string;
  provider: string;
}

/**
 * useHermesChat Hook Return Type
 */
export interface UseHermesChatReturn extends UseHermesChatState {
  sendMessage: (message: string, mode?: string) => Promise<void>;
  clearMessages: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
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
 * Supports both local development and production environments
 */
function getHermesApiUrl(): string {
  // Try to use NEXT_PUBLIC_API_URL if available
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Client-side fallback
  if (typeof window !== 'undefined') {
    return '/api';
  }

  // Server-side fallback
  return 'http://localhost:3002/api';
}

/**
 * Generate a unique ID for messages
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * useHermesChat - React Hook for Hermes Chat
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading, error } = useHermesChat();
 *
 * const handleSendMessage = async () => {
 *   await sendMessage('Hello, Hermes!');
 * };
 * ```
 */
export function useHermesChat(): UseHermesChatReturn {
  // State management
  const [messages, setMessages] = useState<HermesChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('');

  /**
   * Add a message to the history
   * Memoized to prevent unnecessary re-renders
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: HermesChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  /**
   * Clear all messages from history
   * Memoized to prevent unnecessary re-renders
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Send a message to Hermes API
   * Handles request building, response parsing, and error handling
   * Memoized to prevent unnecessary re-renders
   */
  const sendMessage = useCallback(
    async (message: string, mode?: string): Promise<void> => {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        setError('Message cannot be empty');
        return;
      }

      // Clear previous error
      setError(null);
      setIsLoading(true);

      try {
        // Add user message to history
        addMessage('user', trimmedMessage);

        // Build request payload with message history
        const historyMessages = messages
          .slice(-10) // Include last 10 messages for context
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

        const payload: HermesChatRequest = {
          message: trimmedMessage,
          messages: historyMessages,
        };

        if (mode) {
          payload.mode = mode;
        }

        // Build request options
        const token = getAuthToken();
        const apiUrl = getHermesApiUrl();
        const endpoint = `${apiUrl}/v1/hermes/chat`;

        const fetchOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };

        // Add authorization header if token exists
        if (token) {
          fetchOptions.headers = {
            ...fetchOptions.headers,
            Authorization: `Bearer ${token}`,
          };
        }

        // Make API request
        const response = await fetch(endpoint, fetchOptions);

        // Handle HTTP error responses
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;

          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch {
            // If response body is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }

          // Specific handling for authentication errors
          if (response.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (response.status === 403) {
            setError('Access denied. You do not have permission to use Hermes.');
          } else {
            setError(`Failed to get response: ${errorMessage}`);
          }

          // Still add an error message to the chat
          addMessage('assistant', `Error: ${errorMessage}`);
          setIsLoading(false);
          return;
        }

        // Parse response
        const data: HermesResponse = await response.json();

        // Update model and provider info
        if (data.model) setModel(data.model);
        if (data.provider) setProvider(data.provider);

        // Add assistant response to history
        addMessage('assistant', data.response || '(no response)');
      } catch (err) {
        // Handle network errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

        // Distinguish between network errors and other errors
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed')) {
          setError('Network error: Unable to reach Hermes service');
        } else {
          setError(`Error: ${errorMessage}`);
        }

        // Add error message to chat
        addMessage('assistant', `Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, addMessage]
  );

  return {
    messages,
    isLoading,
    error,
    model,
    provider,
    sendMessage,
    clearMessages,
    addMessage,
  };
}
