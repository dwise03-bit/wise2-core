'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../../../types/streaming';

export interface ChatListProps {
  messages: ChatMessageType[];
  maxMessages?: number;
}

export function ChatList({ messages, maxMessages = 200 }: ChatListProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll.current) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle manual scroll to determine if user is viewing latest messages
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    shouldAutoScroll.current = isNearBottom;
  };

  // Limit messages to prevent performance issues
  const displayMessages = messages.slice(-maxMessages);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs text-gray-600">Be the first to chat!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto space-y-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
    >
      {/* Show message count indicator if there are hidden messages */}
      {messages.length > maxMessages && (
        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm py-1 px-3 text-xs text-gray-400 text-center border-b border-gray-700/50 z-10">
          {messages.length - maxMessages} older messages hidden (showing latest {maxMessages})
        </div>
      )}

      {displayMessages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={scrollEndRef} />
    </div>
  );
}
