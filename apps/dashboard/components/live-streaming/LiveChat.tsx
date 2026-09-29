'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isHighlighted?: boolean;
}

interface LiveChatProps {
  messages?: ChatMessage[];
  // eslint-disable-next-line no-unused-vars
  onSendMessage?: (message: string) => void;
  viewerCount?: number;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    username: 'SoundEnthusiast',
    avatar: '👤',
    message: 'Amazing audio quality today!',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    username: 'ProducerJoe',
    avatar: '🎵',
    message: 'Love the mixer setup!',
    timestamp: new Date(Date.now() - 3 * 60000),
    isHighlighted: true,
  },
  {
    id: '3',
    username: 'AudioFan',
    avatar: '🎧',
    message: 'Can you play some EDM?',
    timestamp: new Date(Date.now() - 1 * 60000),
  },
];

/**
 * LiveChat Component
 * Displays live chat with active viewers and messages
 */
export function LiveChat({
  messages = DEFAULT_MESSAGES,
  onSendMessage,
  viewerCount = 1256,
}: LiveChatProps) {
  const [localMessages, setLocalMessages] = useState(messages);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: ChatMessage = {
        id: String(Date.now()),
        username: 'You',
        avatar: '🌟',
        message: messageInput,
        timestamp: new Date(),
      };
      setLocalMessages([...localMessages, newMessage]);
      onSendMessage?.(messageInput);
      setMessageInput('');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-700/50 pb-md mb-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Live Chat</h3>
            <p className="text-xs text-gray-400 mt-1">Active viewers</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-wise-accent-green">{viewerCount.toLocaleString()}</div>
            <p className="text-xs text-gray-400">watching now</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-md mb-md pr-2 min-h-96">
        {localMessages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm transition-all ${
              msg.isHighlighted
                ? 'bg-purple-500/10 border border-purple-500/30 rounded-md p-2'
                : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">{msg.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-200">{msg.username}</span>
                  <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-gray-300 break-words">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700/50 pt-md space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Send a message..."
            className="flex-1 px-md py-sm bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-wise-accent-green"
          />
          <button
            onClick={handleSendMessage}
            className="px-md py-sm bg-wise-accent-green hover:brightness-110 text-wise-bg-primary font-semibold rounded-md transition-all text-sm"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400">
          💡 Press Enter to send messages
        </p>
      </div>
    </div>
  );
}
