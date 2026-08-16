'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  isStreamer: boolean;
}

export interface DiscordMessage {
  id: string;
  author: DiscordUser;
  content: string;
  timestamp: Date;
  isSystem: boolean;
}

export interface DiscordChatState {
  messages: DiscordMessage[];
  viewers: DiscordUser[];
  unreadCount: number;
  isConnected: boolean;
}

export const useDiscordChat = (webhookUrl?: string) => {
  const [chatState, setChatState] = useState<DiscordChatState>({
    messages: [],
    viewers: [],
    unreadCount: 0,
    isConnected: false,
  });

  const messageQueueRef = useRef<DiscordMessage[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const [error, setError] = useState<string | null>(null);

  // Connect to Discord
  const connect = useCallback(async () => {
    try {
      setError(null);
      // Simulate connection
      setChatState((prev) => ({
        ...prev,
        isConnected: true,
        viewers: [
          {
            id: 'streamer-1',
            username: 'You (Streamer)',
            isStreamer: true,
          },
        ],
      }));

      // Add welcome message
      const welcomeMsg: DiscordMessage = {
        id: `msg-${Date.now()}`,
        author: {
          id: 'system',
          username: 'System',
          isStreamer: false,
        },
        content: 'Welcome to the Discord chat! Stream started.',
        timestamp: new Date(),
        isSystem: true,
      };

      setChatState((prev) => ({
        ...prev,
        messages: [welcomeMsg, ...prev.messages],
      }));

      // Simulate receiving messages periodically
      pollIntervalRef.current = setInterval(() => {
        const randomMessages = [
          'Great stream!',
          'Love the setup 🎵',
          'What are you working on?',
          'Amazing vibes!',
          'Can you play that again?',
          'This is fire!',
        ];

        if (Math.random() > 0.7) {
          const newMsg: DiscordMessage = {
            id: `msg-${Date.now()}`,
            author: {
              id: `user-${Math.random()}`,
              username: `Viewer_${Math.floor(Math.random() * 1000)}`,
              isStreamer: false,
            },
            content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
            timestamp: new Date(),
            isSystem: false,
          };

          setChatState((prev) => ({
            ...prev,
            messages: [newMsg, ...prev.messages.slice(0, 49)],
            unreadCount: prev.unreadCount + 1,
            viewers: [
              ...prev.viewers,
              ...(Math.random() > 0.8
                ? [
                    {
                      id: `user-${Date.now()}`,
                      username: `Viewer_${Math.floor(Math.random() * 10000)}`,
                      isStreamer: false,
                    },
                  ]
                : []),
            ],
          }));
        }
      }, 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to Discord';
      setError(errorMsg);
    }
  }, []);

  // Disconnect from Discord
  const disconnect = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setChatState({
      messages: [],
      viewers: [],
      unreadCount: 0,
      isConnected: false,
    });
  }, []);

  // Send message to Discord
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const newMsg: DiscordMessage = {
        id: `msg-${Date.now()}`,
        author: {
          id: 'streamer',
          username: 'You (Streamer)',
          isStreamer: true,
        },
        content,
        timestamp: new Date(),
        isSystem: false,
      };

      setChatState((prev) => ({
        ...prev,
        messages: [newMsg, ...prev.messages],
      }));

      // Simulate sending to webhook
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content,
              username: 'WISE² Studio Stream',
            }),
          });
        } catch (err) {
          console.error('Failed to send message:', err);
        }
      }
    },
    [webhookUrl]
  );

  // Mark messages as read
  const markAsRead = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      unreadCount: 0,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...chatState,
    connect,
    disconnect,
    sendMessage,
    markAsRead,
    error,
  };
};
