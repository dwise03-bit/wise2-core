'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, ChatAlert, ChatConnectionStatus } from '../components/LiveStudio/types/chat';
import { generateMockMessage, generateMockAlert } from '../utils/chatUtils';

interface UseChatOverlayOptions {
  maxMessages?: number;
  autoConnect?: boolean;
  onMessageReceived?: (message: ChatMessage) => void;
  onAlertReceived?: (alert: ChatAlert) => void;
}

export function useChatOverlay(
  platform: 'twitch' | 'youtube' | 'facebook' | 'mock' = 'mock',
  channelId?: string,
  options: UseChatOverlayOptions = {}
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<ChatAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>('idle');

  const maxMessages = options.maxMessages || 500;
  const mockIntervalRef = useRef<NodeJS.Timeout>();

  /**
   * Add message to display (with history limit)
   */
  const addMessage = useCallback(
    (message: ChatMessage) => {
      options.onMessageReceived?.(message);

      setMessages((prev) => {
        const updated = [...prev, message];
        return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
      });
    },
    [maxMessages, options]
  );

  /**
   * Add alert (with auto-remove)
   */
  const addAlert = useCallback(
    (alert: ChatAlert) => {
      options.onAlertReceived?.(alert);

      setAlerts((prev) => [...prev, alert]);

      // Remove alert after duration
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      }, alert.duration);
    },
    [options]
  );

  /**
   * Connect to chat service
   */
  const connect = useCallback(async () => {
    setConnectionStatus('connecting');

    try {
      if (platform === 'mock') {
        // Mock connection for testing
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsConnected(true);
        setConnectionStatus('connected');

        // Start sending mock messages
        mockIntervalRef.current = setInterval(() => {
          if (Math.random() > 0.7) {
            addMessage(generateMockMessage());
          }
          if (Math.random() > 0.95) {
            addAlert(generateMockAlert());
          }
        }, 3000);
      } else {
        // Real platform connection would happen here
        // For now, treat as unsupported
        setConnectionStatus('error');
        throw new Error(`Platform ${platform} not yet implemented`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setIsConnected(false);
      console.error('Chat connection error:', error);
    }
  }, [platform, addMessage, addAlert]);

  /**
   * Disconnect from chat
   */
  const disconnect = useCallback(async () => {
    setConnectionStatus('disconnected');

    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
    }

    setIsConnected(false);
    setMessages([]);
    setAlerts([]);
  }, []);

  /**
   * Send message (for mock or when connected)
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!isConnected && platform !== 'mock') {
        throw new Error('Not connected to chat');
      }

      // For mock, just add to local messages
      if (platform === 'mock') {
        addMessage(
          generateMockMessage({
            message: text,
            userName: 'You',
            userType: 'regular',
          })
        );
      }
    },
    [platform, isConnected, addMessage]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Play sound (placeholder)
   */
  const playSound = useCallback((type: 'message' | 'alert' | 'subscribe' | 'raid') => {
    // In production, would play actual sounds
    // Could use Web Audio API or HTML5 audio elements
    console.log(`Play sound: ${type}`);
  }, []);

  /**
   * Send mock message (for testing)
   */
  const sendMockMessage = useCallback(() => {
    addMessage(generateMockMessage());
    if (Math.random() > 0.5) {
      addAlert(generateMockAlert());
    }
  }, [addMessage, addAlert]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
    };
  }, []);

  return {
    messages,
    alerts,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    playSound,
    sendMockMessage,
    addMessage,
    addAlert,
  };
}

export default useChatOverlay;
