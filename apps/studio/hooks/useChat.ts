'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types/streaming';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Map<string, { name: string; avatar?: string; badges: string[] }>>(new Map());

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const chatMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, chatMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Simulate incoming messages for demo
  useEffect(() => {
    if (Math.random() < 0.1) {
      const demoNames = ['StreamViewer123', 'AudioEnthusiast', 'LiveChat_User', 'Producer_Mike'];
      addMessage({
        userId: Math.random().toString(),
        userName: demoNames[Math.floor(Math.random() * demoNames.length)],
        message: 'Great stream! Love the audio quality.',
        userBadges: Math.random() < 0.3 ? ['subscriber', 'verified'] : [],
        isModerator: false,
      });
    }
  }, [addMessage]);

  return {
    messages,
    users,
    addMessage,
    clearMessages,
  };
}
