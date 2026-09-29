'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/streaming';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  badges: string[];
  isModerator: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Map<string, ChatUser>>(new Map());
  const [moderationStatus, setModerationStatus] = useState<'active' | 'passive' | 'disabled'>('active');
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Demo data for realistic chat simulation
  const demoUsers = [
    { name: 'StreamViewer123', badges: [] },
    { name: 'AudioEnthusiast', badges: ['subscriber'] },
    { name: 'LiveChat_User', badges: ['verified'] },
    { name: 'Producer_Mike', badges: ['subscriber', 'verified'], isModerator: true },
    { name: 'TechLover_Sarah', badges: ['vip'] },
    { name: 'MusicalGenius', badges: ['subscriber'] },
    { name: 'CloudStudio_Dev', badges: ['verified'] },
    { name: 'StreamingPro', badges: ['subscriber', 'verified'] },
    { name: 'MusicProducer99', badges: [] },
    { name: 'AudioEngineer_Jay', badges: ['verified'] },
  ];

  const demoMessages = [
    'Great stream! Love the audio quality.',
    'This is amazing! 🔥',
    'Thanks for streaming today!',
    'The mixer sounds professional 👍',
    'Keep up the great work!',
    'This is exactly what I was looking for',
    'Best live studio setup I\'ve seen ✨',
    'Really enjoying this session',
    'Professional quality broadcast 📹',
    'Love the energy here! 🎵',
    'This is incredible! 💯',
    'Thanks for the great content',
    'Amazing production value',
  ];

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const chatMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, chatMessage]);

    // Track user if not already tracked
    if (!users.has(message.userId)) {
      const newUser: ChatUser = {
        id: message.userId,
        name: message.userName,
        badges: message.userBadges,
        isModerator: message.isModerator,
      };
      setUsers((prev) => new Map(prev).set(message.userId, newUser));
    }
  }, [users]);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateModerationStatus = useCallback((status: 'active' | 'passive' | 'disabled') => {
    setModerationStatus(status);
  }, []);

  // Simulate incoming messages for demo with varied timing and distribution
  useEffect(() => {
    const startSimulation = () => {
      simulationIntervalRef.current = setInterval(() => {
        // Random chance of sending a message (30-40% per interval)
        if (Math.random() < 0.35) {
          const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
          const messageText = demoMessages[Math.floor(Math.random() * demoMessages.length)];

          addMessage({
            userId: user.name,
            userName: user.name,
            message: messageText,
            userBadges: user.badges,
            isModerator: user.isModerator || false,
          });
        }
      }, 2000); // Check every 2 seconds
    };

    startSimulation();

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [addMessage]);

  return {
    messages,
    users,
    moderationStatus,
    addMessage,
    removeMessage,
    clearMessages,
    updateModerationStatus,
    totalUsers: users.size,
  };
}
