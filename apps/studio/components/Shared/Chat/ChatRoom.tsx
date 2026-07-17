'use client';

import { useState } from 'react';
import { ChatList } from './ChatList';
import { ChatInput } from './ChatInput';
import { useChat } from '../../../hooks/useChat';

export interface ChatRoomProps {
  /**
   * Room title (optional, for display)
   */
  title?: string;

  /**
   * Whether chat is enabled
   */
  isEnabled?: boolean;

  /**
   * Number of active users (optional, for display)
   */
  activeUsers?: number;

  /**
   * Show chat settings/filters (optional)
   */
  showSettings?: boolean;

  /**
   * Max messages to display (default: 200)
   */
  maxMessages?: number;
}

export function ChatRoom({
  title = 'CHAT',
  isEnabled = true,
  activeUsers = 0,
  showSettings = false,
  maxMessages = 200,
}: ChatRoomProps) {
  const { messages, addMessage, clearMessages } = useChat();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mod' | 'verified'>('all');

  const handleSendMessage = (messageText: string) => {
    addMessage({
      userId: 'current-user',
      userName: 'You',
      message: messageText,
      userBadges: ['verified'],
      isModerator: false,
    });
  };

  // Filter messages based on selected filter
  const filteredMessages = messages.filter((msg) => {
    if (selectedFilter === 'mod') return msg.isModerator;
    if (selectedFilter === 'verified') return msg.userBadges.includes('verified') || msg.isModerator;
    return true;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(8,15,28,0.92),rgba(3,7,16,0.98))] shadow-[0_0_40px_rgba(0,153,255,0.12)] backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
          <h3 className="text-sm font-bold tracking-wide text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {activeUsers > 0 && (
            <span className="text-xs text-slate-400">
              👥 {activeUsers.toLocaleString()} {activeUsers === 1 ? 'viewer' : 'viewers'}
            </span>
          )}
          {showSettings && (
            <button
              onClick={() => clearMessages()}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              title="Clear chat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs (optional) */}
      {showSettings && messages.length > 0 && (
        <div className="flex gap-2 border-b border-white/10 bg-black/20 px-2 py-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setSelectedFilter('verified')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedFilter === 'verified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setSelectedFilter('mod')}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              selectedFilter === 'mod'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            Mods
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <ChatList messages={filteredMessages} maxMessages={maxMessages} />

      {/* Chat Input */}
      {isEnabled ? (
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder="Say something..."
          isDisabled={!isEnabled}
        />
      ) : (
        <div className="border-t border-white/10 bg-white/5 p-3 text-center text-xs text-slate-400">
          💬 Chat is currently disabled
        </div>
      )}
    </div>
  );
}
